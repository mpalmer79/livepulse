"""
LivePulse - Base Simulator
Abstract base class for all data simulators
"""
import asyncio
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional, Callable
from datetime import datetime
import random
import structlog

from core.models import Event, Metric, Scenario, EventSeverity, AggregatedMetrics

logger = structlog.get_logger()


class BaseSimulator(ABC):
    """
    Abstract base class for scenario simulators.
    Provides common functionality for event generation and metrics aggregation.
    """
    
    def __init__(self, scenario: Scenario):
        self.scenario = scenario
        self.is_running = False
        self.speed = 1.0
        self.chaos_enabled = False
        self.chaos_config = {
            "error_rate": 0.05,
            "latency_ms": 0,
            "spike_probability": 0.01,
            "drop_probability": 0.02
        }
        
        # Stats tracking
        self.events_generated = 0
        self.start_time: Optional[datetime] = None
        
        # Event history for replay/time travel
        self._event_history: List[Event] = []
        self._max_history = 10000
        
        # Metrics aggregation
        self._current_metrics: Dict[str, float] = {}
        self._metric_window: List[Event] = []
        self._metric_window_seconds = 60
        
        # Callbacks
        self._on_event: Optional[Callable] = None
        self._on_metrics: Optional[Callable] = None
        self._on_alert: Optional[Callable] = None
    
    def set_callbacks(
        self,
        on_event: Callable = None,
        on_metrics: Callable = None,
        on_alert: Callable = None
    ):
        """Set callback functions for events, metrics, and alerts"""
        self._on_event = on_event
        self._on_metrics = on_metrics
        self._on_alert = on_alert
    
    def set_speed(self, speed: float):
        """Set simulation speed multiplier"""
        self.speed = max(0.1, min(speed, 100.0))
        logger.info("speed_changed", scenario=self.scenario.value, speed=self.speed)
    
    def enable_chaos(self, enabled: bool, config: Dict[str, Any] = None):
        """Enable/disable chaos mode"""
        self.chaos_enabled = enabled
        if config:
            self.chaos_config.update(config)
        logger.info("chaos_mode", 
                   scenario=self.scenario.value, 
                   enabled=enabled, 
                   config=self.chaos_config)
    
    @abstractmethod
    def generate_event(self) -> Event:
        """Generate a single event - must be implemented by subclasses"""
        pass
    
    @abstractmethod
    def get_aggregated_metrics(self) -> AggregatedMetrics:
        """Get current aggregated metrics - must be implemented by subclasses"""
        pass
    
    @abstractmethod
    def get_event_types(self) -> List[str]:
        """Return list of event types this simulator can generate"""
        pass
    
    def create_event(self, event_type: str, data: Dict[str, Any], 
                     severity: EventSeverity = EventSeverity.INFO) -> Event:
        """Helper to create events with common fields"""
        event = Event(
            type=event_type,
            source=f"simulator:{self.scenario.value}",
            data=data,
            severity=severity,
            scenario=self.scenario
        )
        return event
    
    def apply_chaos(self, event: Event) -> Optional[Event]:
        """Apply chaos engineering effects to an event"""
        if not self.chaos_enabled:
            return event
        
        # Random drop
        if random.random() < self.chaos_config["drop_probability"]:
            logger.debug("chaos_drop", event_type=event.type)
            return None
        
        # Random error
        if random.random() < self.chaos_config["error_rate"]:
            event.severity = EventSeverity.ERROR
            event.data["chaos_error"] = True
            event.data["error_message"] = "Simulated chaos error"
        
        # Traffic spike (increase value if applicable)
        if random.random() < self.chaos_config["spike_probability"]:
            if "value" in event.data:
                event.data["value"] = event.data["value"] * random.uniform(5, 20)
            event.data["chaos_spike"] = True
        
        return event
    
    async def emit_event(self, event: Event):
        """Emit an event through the callback"""
        # Apply chaos effects
        event = self.apply_chaos(event)
        if event is None:
            return
        
        # Track event
        self.events_generated = self.events_generated + 1
        self._event_history.append(event)
        
        # Trim history
        if len(self._event_history) > self._max_history:
            self._event_history = self._event_history[-self._max_history:]
        
        # Add to metrics window
        self._metric_window.append(event)
        self._trim_metric_window()
        
        # Call callback
        if self._on_event:
            await self._on_event(event)
    
    def _trim_metric_window(self):
        """Remove events older than the metric window"""
        cutoff = datetime.utcnow().timestamp() - self._metric_window_seconds
        self._metric_window = [
            e for e in self._metric_window 
            if e.timestamp.timestamp() > cutoff
        ]
    
    async def emit_metrics(self):
        """Calculate and emit aggregated metrics"""
        metrics = self.get_aggregated_metrics()
        if self._on_metrics:
            await self._on_metrics(metrics)
    
    async def emit_alert(self, name: str, message: str, 
                         severity: EventSeverity, metric_name: str,
                         metric_value: float, threshold: float):
        """Emit an alert"""
        from core.models import Alert
        
        alert = Alert(
            name=name,
            message=message,
            severity=severity,
            source=f"simulator:{self.scenario.value}",
            metric_name=metric_name,
            metric_value=metric_value,
            threshold=threshold
        )
        
        if self._on_alert:
            await self._on_alert(alert)
    
    def get_base_interval(self) -> float:
        """Get base interval between events in seconds"""
        return 1.0 / self.speed
    
    def get_random_interval(self) -> float:
        """Get randomized interval for more realistic event timing"""
        base = self.get_base_interval()
        # Add some variance (±30%)
        variance = base * 0.3
        return max(0.01, base + random.uniform(-variance, variance))
    
    async def run(self):
        """Main simulation loop"""
        self.is_running = True
        self.start_time = datetime.utcnow()
        
        logger.info("simulator_started", scenario=self.scenario.value)
        
        metrics_counter = 0
        metrics_interval = 10  # Emit metrics every N events
        
        try:
            while self.is_running:
                # Generate and emit event
                event = self.generate_event()
                await self.emit_event(event)
                
                # Periodically emit metrics
                metrics_counter = metrics_counter + 1
                if metrics_counter >= metrics_interval:
                    await self.emit_metrics()
                    metrics_counter = 0
                
                # Wait before next event
                interval = self.get_random_interval()
                
                # Apply chaos latency
                if self.chaos_enabled and self.chaos_config["latency_ms"] > 0:
                    interval = interval + (self.chaos_config["latency_ms"] / 1000)
                
                await asyncio.sleep(interval)
                
        except asyncio.CancelledError:
            logger.info("simulator_cancelled", scenario=self.scenario.value)
        except Exception as e:
            logger.error("simulator_error", scenario=self.scenario.value, error=str(e))
            raise
        finally:
            self.is_running = False
    
    def stop(self):
        """Stop the simulator"""
        self.is_running = False
        logger.info("simulator_stopped", 
                   scenario=self.scenario.value,
                   events_generated=self.events_generated)
    
    def inject_event(self, event_type: str, data: Dict[str, Any] = None) -> Event:
        """Manually inject a specific event type"""
        if event_type not in self.get_event_types():
            raise ValueError(f"Unknown event type: {event_type}")
        
        # Subclasses can override for custom injection logic
        event = self.create_event(
            event_type=event_type,
            data=data or {},
            severity=EventSeverity.INFO
        )
        return event
    
    def get_history(self, limit: int = 100, 
                    event_type: str = None) -> List[Event]:
        """Get recent event history"""
        history = self._event_history
        
        if event_type:
            history = [e for e in history if e.type == event_type]
        
        return history[-limit:]
    
    def get_state(self) -> Dict[str, Any]:
        """Get current simulator state"""
        return {
            "scenario": self.scenario.value,
            "is_running": self.is_running,
            "speed": self.speed,
            "chaos_enabled": self.chaos_enabled,
            "chaos_config": self.chaos_config,
            "events_generated": self.events_generated,
            "start_time": self.start_time.isoformat() if self.start_time else None,
            "uptime_seconds": (datetime.utcnow() - self.start_time).total_seconds() if self.start_time else 0
        }
