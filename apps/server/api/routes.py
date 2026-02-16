"""
LivePulse - REST API Routes
HTTP endpoints for sandbox control, metrics, and configuration
"""
from fastapi import APIRouter, Request, HTTPException
from typing import Dict, Any, List, Optional
from pydantic import BaseModel

from core.models import Scenario, SandboxControl, EventInjection, ChaosConfig

router = APIRouter()


# ============================================
# REQUEST MODELS
# ============================================

class SpeedRequest(BaseModel):
    speed: float


class ScenarioRequest(BaseModel):
    scenario: str


class InjectRequest(BaseModel):
    event_type: str
    count: int = 1
    data: Dict[str, Any] = {}


class ChaosRequest(BaseModel):
    enabled: bool
    config: Optional[ChaosConfig] = None


# ============================================
# SANDBOX CONTROL ENDPOINTS
# ============================================

@router.get("/sandbox/state")
async def get_sandbox_state(request: Request) -> Dict[str, Any]:
    """Get current sandbox state"""
    orchestrator = request.app.state.sandbox_orchestrator
    return orchestrator.get_state()


@router.post("/sandbox/speed")
async def set_speed(request: Request, body: SpeedRequest) -> Dict[str, Any]:
    """Set simulation speed"""
    orchestrator = request.app.state.sandbox_orchestrator
    control = SandboxControl(action="set_speed", payload={"speed": body.speed})
    return await orchestrator.handle_control(control)


@router.post("/sandbox/scenario")
async def set_scenario(request: Request, body: ScenarioRequest) -> Dict[str, Any]:
    """Switch simulation scenario"""
    orchestrator = request.app.state.sandbox_orchestrator
    control = SandboxControl(action="set_scenario", payload={"scenario": body.scenario})
    return await orchestrator.handle_control(control)


@router.post("/sandbox/inject")
async def inject_event(request: Request, body: InjectRequest) -> Dict[str, Any]:
    """Inject custom event(s)"""
    orchestrator = request.app.state.sandbox_orchestrator
    control = SandboxControl(
        action="inject_event",
        payload={
            "event_type": body.event_type,
            "count": body.count,
            "data": body.data
        }
    )
    return await orchestrator.handle_control(control)


@router.post("/sandbox/chaos")
async def toggle_chaos(request: Request, body: ChaosRequest) -> Dict[str, Any]:
    """Toggle chaos mode"""
    orchestrator = request.app.state.sandbox_orchestrator
    payload = {"enabled": body.enabled}
    if body.config:
        payload["config"] = body.config.model_dump()
    
    control = SandboxControl(action="toggle_chaos", payload=payload)
    return await orchestrator.handle_control(control)


@router.post("/sandbox/pause")
async def pause_simulation(request: Request) -> Dict[str, Any]:
    """Pause simulation"""
    orchestrator = request.app.state.sandbox_orchestrator
    control = SandboxControl(action="pause", payload={})
    return await orchestrator.handle_control(control)


@router.post("/sandbox/resume")
async def resume_simulation(request: Request) -> Dict[str, Any]:
    """Resume simulation"""
    orchestrator = request.app.state.sandbox_orchestrator
    control = SandboxControl(action="resume", payload={})
    return await orchestrator.handle_control(control)


@router.post("/sandbox/reset")
async def reset_simulation(request: Request) -> Dict[str, Any]:
    """Reset simulation to initial state"""
    orchestrator = request.app.state.sandbox_orchestrator
    control = SandboxControl(action="reset", payload={})
    return await orchestrator.handle_control(control)


# ============================================
# METRICS ENDPOINTS
# ============================================

@router.get("/metrics/current")
async def get_current_metrics(request: Request) -> Dict[str, Any]:
    """Get current aggregated metrics"""
    orchestrator = request.app.state.sandbox_orchestrator
    simulator = orchestrator.current_simulator
    metrics = simulator.get_aggregated_metrics()
    return metrics.model_dump()


@router.get("/metrics/history")
async def get_metrics_history(
    request: Request,
    limit: int = 100,
    event_type: Optional[str] = None
) -> Dict[str, Any]:
    """Get recent event history"""
    orchestrator = request.app.state.sandbox_orchestrator
    simulator = orchestrator.current_simulator
    history = simulator.get_history(limit=limit, event_type=event_type)
    
    return {
        "count": len(history),
        "events": [e.model_dump() for e in history]
    }


# ============================================
# SCENARIO INFO ENDPOINTS
# ============================================

@router.get("/scenarios")
async def list_scenarios() -> Dict[str, Any]:
    """List available scenarios"""
    return {
        "scenarios": [
            {
                "id":
