"""
LivePulse - WebSocket Connection Manager
Handles client connections, subscriptions, and message broadcasting
"""
import asyncio
from typing import Dict, List, Set, Optional
from fastapi import WebSocket
from datetime import datetime
import json
import structlog

from core.models import WSMessage, WSSubscription, Scenario

logger = structlog.get_logger()


class Connection:
    """Represents a single WebSocket connection with its subscription state"""
    
    def __init__(self, websocket: WebSocket, client_id: str):
        self.websocket = websocket
        self.client_id = client_id
        self.connected_at = datetime.utcnow()
        self.subscription = WSSubscription()
        self.last_heartbeat = datetime.utcnow()
        self.messages_sent = 0
        self.messages_received = 0
    
    async def send(self, message: WSMessage) -> bool:
        """Send a message to this connection"""
        try:
            await self.websocket.send_text(message.model_dump_json())
            self.messages_sent = self.messages_sent + 1
            return True
        except Exception as e:
            logger.warning("send_failed", client_id=self.client_id, error=str(e))
            return False
    
    async def send_json(self, data: dict) -> bool:
        """Send raw JSON to this connection"""
        try:
            await self.websocket.send_text(json.dumps(data, default=str))
            self.messages_sent = self.messages_sent + 1
            return True
        except Exception as e:
            logger.warning("send_json_failed", client_id=self.client_id, error=str(e))
            return False
    
    def update_subscription(self, subscription: WSSubscription):
        """Update client's subscription preferences"""
        self.subscription = subscription
        logger.info("subscription_updated", 
                   client_id=self.client_id, 
                   scenarios=[s.value for s in subscription.scenarios])
    
    def is_subscribed_to(self, scenario: Scenario, event_type: str = None) -> bool:
        """Check if client is subscribed to a scenario/event type"""
        if scenario not in self.subscription.scenarios:
            return False
        if event_type and self.subscription.event_types:
            return event_type in self.subscription.event_types
        return True


class ConnectionManager:
    """
    Manages all WebSocket connections and handles message distribution.
    Thread-safe and supports topic-based subscriptions.
    """
    
    def __init__(self):
        self._connections: Dict[str, Connection] = {}
        self._lock = asyncio.Lock()
        self._scenario_subscribers: Dict[Scenario, Set[str]] = {
            scenario: set() for scenario in Scenario
        }
    
    @property
    def active_count(self) -> int:
        """Number of active connections"""
        return len(self._connections)
    
    async def connect(self, websocket: WebSocket, client_id: str) -> Connection:
        """Accept a new WebSocket connection"""
        await websocket.accept()
        
        async with self._lock:
            connection = Connection(websocket, client_id)
            self._connections[client_id] = connection
            
            # Subscribe to default scenario
            for scenario in connection.subscription.scenarios:
                self._scenario_subscribers[scenario].add(client_id)
        
        logger.info("client_connected", 
                   client_id=client_id, 
                   total_connections=self.active_count)
        
        # Send welcome message
        await connection.send(WSMessage(
            type="state",
            payload={
                "status": "connected",
                "client_id": client_id,
                "subscribed_scenarios": [s.value for s in connection.subscription.scenarios]
            }
        ))
        
        return connection
    
    async def disconnect(self, client_id: str):
        """Remove a connection"""
        async with self._lock:
            if client_id in self._connections:
                connection = self._connections.pop(client_id)
                
                # Remove from all scenario subscriptions
                for subscribers in self._scenario_subscribers.values():
                    subscribers.discard(client_id)
                
                logger.info("client_disconnected",
                           client_id=client_id,
                           duration_seconds=(datetime.utcnow() - connection.connected_at).total_seconds(),
                           messages_sent=connection.messages_sent)
    
    async def disconnect_all(self):
        """Disconnect all clients (used during shutdown)"""
        async with self._lock:
            for client_id, connection in list(self._connections.items()):
                try:
                    await connection.websocket.close()
                except Exception:
                    pass
            self._connections.clear()
            for subscribers in self._scenario_subscribers.values():
                subscribers.clear()
        
        logger.info("all_clients_disconnected")
    
    async def update_subscription(self, client_id: str, subscription: WSSubscription):
        """Update a client's subscription"""
        async with self._lock:
            if client_id not in self._connections:
                return
            
            connection = self._connections[client_id]
            old_scenarios = set(connection.subscription.scenarios)
            new_scenarios = set(subscription.scenarios)
            
            # Update scenario subscriptions
            for scenario in old_scenarios - new_scenarios:
                self._scenario_subscribers[scenario].discard(client_id)
            for scenario in new_scenarios - old_scenarios:
                self._scenario_subscribers[scenario].add(client_id)
            
            connection.update_subscription(subscription)
    
    async def broadcast(self, message: WSMessage, scenario: Optional[Scenario] = None):
        """
        Broadcast a message to all relevant subscribers.
        If scenario is specified, only send to subscribers of that scenario.
        """
        if scenario:
            client_ids = self._scenario_subscribers.get(scenario, set())
        else:
            client_ids = set(self._connections.keys())
        
        if not client_ids:
            return
        
        # Send to all relevant clients concurrently
        disconnected = []
        
        async def send_to_client(client_id: str):
            if client_id in self._connections:
                success = await self._connections[client_id].send(message)
                if not success:
                    disconnected.append(client_id)
        
        await asyncio.gather(*[send_to_client(cid) for cid in client_ids])
        
        # Clean up failed connections
        for client_id in disconnected:
            await self.disconnect(client_id)
    
    async def broadcast_event(self, event: dict, scenario: Scenario):
        """Broadcast an event to scenario subscribers"""
        message = WSMessage(
            type="event",
            payload=event
        )
        await self.broadcast(message, scenario)
    
    async def broadcast_metrics(self, metrics: dict, scenario: Scenario):
        """Broadcast aggregated metrics to scenario subscribers"""
        message = WSMessage(
            type="metrics",
            payload=metrics
        )
        
        # Only send to clients who want metrics
        client_ids = self._scenario_subscribers.get(scenario, set())
        
        for client_id in list(client_ids):
            if client_id in self._connections:
                connection = self._connections[client_id]
                if connection.subscription.include_metrics:
                    await connection.send(message)
    
    async def broadcast_alert(self, alert: dict):
        """Broadcast an alert to all subscribers who want alerts"""
        message = WSMessage(
            type="alert",
            payload=alert
        )
        
        for connection in self._connections.values():
            if connection.subscription.include_alerts:
                await connection.send(message)
    
    async def send_to_client(self, client_id: str, message: WSMessage) -> bool:
        """Send a message to a specific client"""
        if client_id in self._connections:
            return await self._connections[client_id].send(message)
        return False
    
    async def heartbeat(self):
        """Send heartbeat to all connections and clean up stale ones"""
        message = WSMessage(
            type="heartbeat",
            payload={"timestamp": datetime.utcnow().isoformat()}
        )
        
        disconnected = []
        for client_id, connection in list(self._connections.items()):
            success = await connection.send(message)
            if success:
                connection.last_heartbeat = datetime.utcnow()
            else:
                disconnected.append(client_id)
        
        for client_id in disconnected:
            await self.disconnect(client_id)
        
        return len(disconnected)
    
    def get_stats(self) -> dict:
        """Get connection statistics"""
        total_messages = sum(c.messages_sent for c in self._connections.values())
        scenario_counts = {
            scenario.value: len(subscribers) 
            for scenario, subscribers in self._scenario_subscribers.items()
        }
        
        return {
            "total_connections": self.active_count,
            "total_messages_sent": total_messages,
            "subscribers_by_scenario": scenario_counts
        }
