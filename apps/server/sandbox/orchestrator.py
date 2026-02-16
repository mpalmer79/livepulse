"""
LivePulse - Sandbox Orchestrator
Manages simulation scenarios, user controls, and event distribution
"""
import asyncio
from typing import Dict, Any, Optional
from datetime import datetime
import structlog

from core.models import Scenario, SandboxControl, SandboxState, Event, AggregatedMetrics, Alert
from websocket.manager import ConnectionManager
from simulators.base import BaseSimulator
from simulators.ecommerce import EcommerceSimulator

# ✅ AI Insights Engine
from core.insights_engine import InsightsEngine

logger = structlog.get_logger()


class SandboxOrchestrator:
    """
    Central orchestrator for the sandbox environment.
    Manages multiple scenario simulators and handles control commands.
    """

    def __init__(self, connection_manager: ConnectionManager):
        self.connection_manager = connection_manager
        self.is_running = False
        self._state = SandboxState()

        # ✅ AI Insights Engine (rolling window + explainable recommendations)
        self._insights_engine = InsightsEngine(window_seconds=180)

        # Initialize simulators
        self._simulators: Dict[Scenario, BaseSimulator] = {
            Scenario.ECOMMERCE: EcommerceSimulator(),
            # Future: Add more simulators
            # Scenario.IOT: IoTSimulator(),
            # Scenario.SOCIAL: SocialSimulator(),
            # Scenario.FINANCIAL: FinancialSimulator(),
        }

        # Set callbacks for all simulators
        for simulator in self._simulators.values():
            simulator.set_callbacks(
                on_event=self._on_event,
                on_metrics=self._on_metrics,
                on_alert=self._on_alert
            )

        # Background tasks
        self._simulator_tasks: Dict[Scenario, asyncio.Task] = {}
        self._metrics_task: Optional[asyncio.Task] = None
        self._heartbeat_task: Optional[asyncio.Task] = None

    @property
    def current_scenario(self) -> Scenario:
        return self._state.scenario

    @property
    def current_simulator(self) -> BaseSimulator:
        return self._simulators[self._state.scenario]

    async def _on_event(self, event: Event):
        """Callback when simulator generates an event"""
        self._state.events_generated = self._state.events_generated + 1

        # ✅ Feed insights engine
        try:
            self._insights_engine.ingest_event(event.model_dump())
        except Exception as e:
            logger.warning("insights_ingest_event_error", error=str(e))

        # Broadcast to WebSocket clients
        await self.connection_manager.broadcast_event(
            event.model_dump(),
            event.scenario
        )

    async def _on_metrics(self, metrics: AggregatedMetrics):
        """Callback when simulator generates aggregated metrics"""

        # ✅ Feed insights engine
        try:
            self._insights_engine.ingest_metrics(metrics.model_dump())
        except Exception as e:
            logger.warning("insights_ingest_metrics_error", error=str(e))

        await self.connection_manager.broadcast_metrics(
            metrics.model_dump(),
            metrics.scenario
        )

    async def _on_alert(self, alert: Alert):
        """Callback when simulator triggers an alert"""
        await self.connection_manager.broadcast_alert(alert.model_dump())

    async def start(self):
        """Start the sandbox environment"""
        self.is_running = True
        self._state.is_running = True
        self._state.start_time = datetime.utcnow()

        logger.info("sandbox_starting", scenario=self._state.scenario.value)

        # Start the current scenario simulator
        await self._start_simulator(self._state.scenario)

        # Start background tasks
        self._metrics_task = asyncio.create_task(self._metrics_loop())
        self._heartbeat_task = asyncio.create_task(self._heartbeat_loop())

        logger.info("sandbox_started")

    async def _start_simulator(self, scenario: Scenario):
        """Start a specific scenario simulator"""
        if scenario in self._simulator_tasks:
            # Already running
            return

        simulator = self._simulators.get(scenario)
        if simulator:
            task = asyncio.create_task(simulator.run())
            self._simulator_tasks[scenario] = task
            logger.info("simulator_started", scenario=scenario.value)

    async def _stop_simulator(self, scenario: Scenario):
        """Stop a specific scenario simulator"""
        if scenario in self._simulator_tasks:
            simulator = self._simulators.get(scenario)
            if simulator:
                simulator.stop()

            task = self._simulator_tasks.pop(scenario)
            task.cancel()
            try:
                await task
            except asyncio.CancelledError:
                pass

            logger.info("simulator_stopped", scenario=scenario.value)

    def stop(self):
        """Stop the sandbox environment"""
        self.is_running = False
        self._state.is_running = False

        # Stop all simulators
        for simulator in self._simulators.values():
            simulator.stop()

        logger.info("sandbox_stopped")

    async def _metrics_loop(self):
        """Periodically broadcast metrics to all clients"""
        while self.is_running:
            try:
                # Broadcast metrics for active scenarios
                for scenario, simulator in self._simulators.items():
                    if simulator.is_running:
                        metrics = simulator.get_aggregated_metrics()

                        # Broadcast metrics
                        await self.connection_manager.broadcast_metrics(
                            metrics.model_dump(),
                            scenario
                        )

                        # ✅ Evaluate + broadcast insights (AI recommendations)
                        try:
                            insights = self._insights_engine.evaluate(scenario.value)
                            for insight in insights:
                                # NOTE: requires ConnectionManager to implement broadcast_insight()
                                await self.connection_manager.broadcast_insight(
                                    insight.model_dump()
                                )
                        except Exception as e:
                            logger.warning("insights_evaluate_error", error=str(e), scenario=scenario.value)

                await asyncio.sleep(1.0)  # Metrics every second

            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error("metrics_loop_error", error=str(e))
                await asyncio.sleep(1.0)

    async def _heartbeat_loop(self):
        """Send heartbeats to keep connections alive"""
        while self.is_running:
            try:
                disconnected = await self.connection_manager.heartbeat()
                if disconnected > 0:
                    logger.info("heartbeat_cleanup", disconnected=disconnected)

                await asyncio.sleep(30.0)  # Heartbeat every 30 seconds

            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error("heartbeat_loop_error", error=str(e))
                await asyncio.sleep(30.0)

    async def handle_control(self, control: SandboxControl) -> Dict[str, Any]:
        """Handle a sandbox control command"""
        action = control.action
        payload = control.payload

        logger.info("control_received", action=action, payload=payload)

        handlers = {
            "set_speed": self._handle_set_speed,
            "set_scenario": self._handle_set_scenario,
            "inject_event": self._handle_inject_event,
            "toggle_chaos": self._handle_toggle_chaos,
            "pause": self._handle_pause,
            "resume": self._handle_resume,
            "reset": self._handle_reset,
        }

        handler = handlers.get(action)
        if handler:
            return await handler(payload)
        else:
            return {"success": False, "error": f"Unknown action: {action}"}

    async def _handle_set_speed(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Set simulation speed"""
        speed = payload.get("speed", 1.0)

        # Apply to current simulator
        self.current_simulator.set_speed(speed)
        self._state.speed = self.current_simulator.speed

        return {
            "success": True,
            "speed": self._state.speed
        }

    async def _handle_set_scenario(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Switch to a different scenario"""
        scenario_str = payload.get("scenario", "ecommerce")

        try:
            new_scenario = Scenario(scenario_str)
        except ValueError:
            return {"success": False, "error": f"Invalid scenario: {scenario_str}"}

        if new_scenario not in self._simulators:
            return {"success": False, "error": f"Scenario not implemented: {scenario_str}"}

        # Stop current simulator if different
        if new_scenario != self._state.scenario:
            await self._stop_simulator(self._state.scenario)
            self._state.scenario = new_scenario
            await self._start_simulator(new_scenario)

        return {
            "success": True,
            "scenario": new_scenario.value
        }

    async def _handle_inject_event(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Inject custom event(s)"""
        event_type = payload.get("event_type")
        count = payload.get("count", 1)
        data = payload.get("data", {})

        if not event_type:
            return {"success": False, "error": "event_type is required"}

        simulator = self.current_simulator

        try:
            injected = 0
            for _ in range(min(count, 100)):  # Limit to 100 at once
                event = simulator.inject_event(event_type, data)
                await simulator.emit_event(event)
                injected = injected + 1

            return {
                "success": True,
                "injected": injected,
                "event_type": event_type
            }
        except ValueError as e:
            return {"success": False, "error": str(e)}

    async def _handle_toggle_chaos(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Toggle chaos mode"""
        enabled = payload.get("enabled", not self._state.chaos_enabled)
        config = payload.get("config", {})

        self._state.chaos_enabled = enabled
        self.current_simulator.enable_chaos(enabled, config)

        return {
            "success": True,
            "chaos_enabled": enabled,
            "config": self.current_simulator.chaos_config
        }

    async def _handle_pause(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Pause simulation"""
        await self._stop_simulator(self._state.scenario)
        self._state.is_running = False

        return {"success": True, "status": "paused"}

    async def _handle_resume(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Resume simulation"""
        await self._start_simulator(self._state.scenario)
        self._state.is_running = True

        return {"success": True, "status": "running"}

    async def _handle_reset(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Reset simulation state"""
        # Stop current
        await self._stop_simulator(self._state.scenario)

        # Reset state
        self._state = SandboxState()

        # Reinitialize simulator
        scenario = self._state.scenario
        self._simulators[scenario] = EcommerceSimulator()
        self._simulators[scenario].set_callbacks(
            on_event=self._on_event,
            on_metrics=self._on_metrics,
            on_alert=self._on_alert
        )

        # Restart
        await self._start_simulator(scenario)
        self._state.is_running = True

        return {"success": True, "status": "reset"}

    def get_state(self) -> Dict[str, Any]:
        """Get current sandbox state"""
        return {
            "scenario": self._state.scenario.value,
            "speed": self._state.speed,
            "is_running": self._state.is_running,
            "chaos_enabled": self._state.chaos_enabled,
            "events_generated": self._state.events_generated,
            "start_time": self._state.start_time.isoformat() if self._state.start_time else None,
            "uptime_seconds": (
                (datetime.utcnow() - self._state.start_time).total_seconds()
                if self._state.start_time else 0
            ),
            "available_scenarios": [s.value for s in self._simulators.keys()],
            "connections": self.connection_manager.get_stats(),
        }
