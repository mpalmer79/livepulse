"""
LivePulse - WebSocket Routes
Handles WebSocket connections and message routing
"""
import asyncio
import uuid
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from typing import Optional
import json
import structlog

from core.models import WSSubscription, SandboxControl, Scenario

logger = structlog.get_logger()
router = APIRouter()


@router.websocket("/stream")
async def websocket_stream(
    websocket: WebSocket,
    client_id: Optional[str] = Query(default=None)
):
    """
    Main WebSocket endpoint for real-time data streaming.
    
    Query params:
        client_id: Optional client identifier (auto-generated if not provided)
    
    Message types clients can send:
        - subscribe: Update subscription preferences
        - control: Sandbox control commands
        - ping: Keepalive ping
    """
    # Get manager from app state
    manager = websocket.app.state.connection_manager
    sandbox = websocket.app.state.sandbox_orchestrator
    
    # Generate client ID if not provided
    if not client_id:
        client_id = f"client_{uuid.uuid4().hex[:8]}"
    
    # Connect
    connection = await manager.connect(websocket, client_id)
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            
            try:
                message = json.loads(data)
                msg_type = message.get("type", "")
                payload = message.get("payload", {})
                
                connection.messages_received = connection.messages_received + 1
                
                if msg_type == "subscribe":
                    # Update subscription preferences
                    scenarios = [Scenario(s) for s in payload.get("scenarios", ["ecommerce"])]
                    subscription = WSSubscription(
                        scenarios=scenarios,
                        event_types=payload.get("event_types", []),
                        include_metrics=payload.get("include_metrics", True),
                        include_alerts=payload.get("include_alerts", True),
                        metrics_interval_ms=payload.get("metrics_interval_ms", 1000)
                    )
                    await manager.update_subscription(client_id, subscription)
                    
                    # Confirm subscription update
                    await connection.send_json({
                        "type": "state",
                        "payload": {
                            "status": "subscription_updated",
                            "scenarios": [s.value for s in scenarios]
                        }
                    })
                
                elif msg_type == "control":
                    # Sandbox control command
                    control = SandboxControl(**payload)
                    result = await sandbox.handle_control(control)
                    
                    await connection.send_json({
                        "type": "state",
                        "payload": {
                            "status": "control_executed",
                            "action": control.action,
                            "result": result
                        }
                    })
                
                elif msg_type == "ping":
                    # Respond to ping
                    await connection.send_json({
                        "type": "pong",
                        "payload": {"timestamp": payload.get("timestamp")}
                    })
                
                elif msg_type == "get_state":
                    # Return current sandbox state
                    state = sandbox.get_state()
                    await connection.send_json({
                        "type": "state",
                        "payload": state
                    })
                
                else:
                    logger.warning("unknown_message_type", 
                                 client_id=client_id, 
                                 msg_type=msg_type)
                    
            except json.JSONDecodeError:
                logger.warning("invalid_json", client_id=client_id)
                await connection.send_json({
                    "type": "error",
                    "payload": {"message": "Invalid JSON"}
                })
            except Exception as e:
                logger.error("message_processing_error", 
                           client_id=client_id, 
                           error=str(e))
                await connection.send_json({
                    "type": "error",
                    "payload": {"message": str(e)}
                })
    
    except WebSocketDisconnect:
        logger.info("websocket_disconnect", client_id=client_id)
    except Exception as e:
        logger.error("websocket_error", client_id=client_id, error=str(e))
    finally:
        await manager.disconnect(client_id)


@router.websocket("/sandbox/{scenario}")
async def websocket_scenario(
    websocket: WebSocket,
    scenario: str,
    client_id: Optional[str] = Query(default=None)
):
    """
    Scenario-specific WebSocket endpoint.
    Automatically subscribes to the specified scenario.
    """
    manager = websocket.app.state.connection_manager
    
    # Validate scenario
    try:
        scenario_enum = Scenario(scenario)
    except ValueError:
        await websocket.close(code=4000, reason=f"Invalid scenario: {scenario}")
        return
    
    if not client_id:
        client_id = f"{scenario}_{uuid.uuid4().hex[:8]}"
    
    connection = await manager.connect(websocket, client_id)
    
    # Subscribe to specific scenario
    subscription = WSSubscription(scenarios=[scenario_enum])
    await manager.update_subscription(client_id, subscription)
    
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get("type") == "ping":
                await connection.send_json({"type": "pong"})
    
    except WebSocketDisconnect:
        pass
    finally:
        await manager.disconnect(client_id)
