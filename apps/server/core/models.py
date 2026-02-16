"""
LivePulse - Data Models
Pydantic models for events, metrics, and API schemas
"""
from datetime import datetime
from typing import Any, Dict, List, Optional, Literal
from pydantic import BaseModel, Field
from enum import Enum
import uuid


# ============================================
# ENUMS
# ============================================

class Scenario(str, Enum):
    """Available sandbox scenarios"""
    ECOMMERCE = "ecommerce"
    IOT = "iot"
    SOCIAL = "social"
    FINANCIAL = "financial"


class EventSeverity(str, Enum):
    """Event severity levels"""
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"


class MetricType(str, Enum):
    """Types of metrics"""
    COUNTER = "counter"
    GAUGE = "gauge"
    HISTOGRAM = "histogram"
    RATE = "rate"


# ============================================
# BASE MODELS
# ============================================

class TimestampedModel(BaseModel):
    """Base model with timestamp"""
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class IdentifiedModel(TimestampedModel):
    """Base model with ID and timestamp"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))


# ============================================
# EVENTS
# ============================================

class Event(IdentifiedModel):
    """Generic event model"""
    type: str
    source: str
    data: Dict[str, Any]
    severity: EventSeverity = EventSeverity.INFO
    scenario: Scenario = Scenario.ECOMMERCE
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class EcommerceEvent(Event):
    """E-commerce specific event"""
    type: Literal["order", "cart_add", "cart_remove", "page_view", "checkout_start", "checkout_complete", "refund", "review"]
    
    # Computed fields for e-commerce
    @property
    def order_value(self) -> Optional[float]:
        return self.data.get("total") or self.data.get("value")


class IoTEvent(Event):
    """IoT sensor event"""
    type: Literal["temperature", "humidity", "pressure", "motion", "power", "alert"]
    device_id: str = ""
    location: str = ""


class SocialEvent(Event):
    """Social media metrics event"""
    type: Literal["post", "like", "share", "comment", "follow", "mention", "engagement"]
    platform: str = ""


class FinancialEvent(Event):
    """Financial/trading event"""
    type: Literal["trade", "quote", "order_book", "alert", "position", "pnl"]
    symbol: str = ""


# ============================================
# METRICS
# ============================================

class Metric(TimestampedModel):
    """Single metric data point"""
    name: str
    value: float
    type: MetricType = MetricType.GAUGE
    tags: Dict[str, str] = Field(default_factory=dict)
    unit: str = ""


class MetricSeries(BaseModel):
    """Time series of metric values"""
    name: str
    values: List[Metric]
    aggregation: str = "avg"  # avg, sum, min, max, count


class AggregatedMetrics(TimestampedModel):
    """Aggregated metrics for dashboard cards"""
    scenario: Scenario
    period_seconds: int = 60
    
    # Common metrics
    events_per_second: float = 0
    total_events: int = 0
    error_rate: float = 0
    
    # Scenario-specific metrics stored as dict
    metrics: Dict[str, float] = Field(default_factory=dict)


# ============================================
# E-COMMERCE SPECIFIC
# ============================================

class EcommerceMetrics(AggregatedMetrics):
    """Aggregated e-commerce metrics"""
    scenario: Scenario = Scenario.ECOMMERCE
    
    # Revenue
    revenue_total: float = 0
    revenue_per_minute: float = 0
    average_order_value: float = 0
    
    # Orders
    orders_total: int = 0
    orders_per_minute: float = 0
    orders_pending: int = 0
    orders_completed: int = 0
    orders_refunded: int = 0
    
    # Cart
    cart_additions: int = 0
    cart_abandonment_rate: float = 0
    
    # Traffic
    page_views: int = 0
    unique_visitors: int = 0
    conversion_rate: float = 0
    
    # Products
    top_products: List[Dict[str, Any]] = Field(default_factory=list)


# ============================================
# ALERTS
# ============================================

class Alert(IdentifiedModel):
    """Alert triggered by threshold or anomaly"""
    name: str
    message: str
    severity: EventSeverity
    source: str
    metric_name: str
    metric_value: float
    threshold: float
    acknowledged: bool = False
    resolved: bool = False
    resolved_at: Optional[datetime] = None


# ============================================
# SANDBOX CONTROLS
# ============================================

class SandboxState(BaseModel):
    """Current state of sandbox environment"""
    scenario: Scenario = Scenario.ECOMMERCE
    speed: float = 1.0
    is_running: bool = True
    chaos_enabled: bool = False
    start_time: datetime = Field(default_factory=datetime.utcnow)
    events_generated: int = 0
    
    
class SandboxControl(BaseModel):
    """Control message for sandbox manipulation"""
    action: Literal["set_speed", "set_scenario", "inject_event", "toggle_chaos", "pause", "resume", "reset"]
    payload: Dict[str, Any] = Field(default_factory=dict)


class EventInjection(BaseModel):
    """Manual event injection request"""
    event_type: str
    count: int = 1
    data: Dict[str, Any] = Field(default_factory=dict)


class ChaosConfig(BaseModel):
    """Chaos mode configuration"""
    enabled: bool = False
    error_rate: float = 0.05  # 5% of events will be errors
    latency_ms: int = 0  # Added latency
    spike_probability: float = 0.01  # 1% chance of traffic spike
    drop_probability: float = 0.02  # 2% chance of dropped events


# ============================================
# WEBSOCKET MESSAGES
# ============================================

class WSMessage(BaseModel):
    """WebSocket message wrapper"""
    type: Literal["event", "metrics", "alert", "state", "error", "heartbeat"]
    payload: Dict[str, Any]
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class WSSubscription(BaseModel):
    """Client subscription preferences"""
    scenarios: List[Scenario] = Field(default_factory=lambda: [Scenario.ECOMMERCE])
    event_types: List[str] = Field(default_factory=list)  # Empty = all
    include_metrics: bool = True
    include_alerts: bool = True
    metrics_interval_ms: int = 1000  # How often to send aggregated metrics
