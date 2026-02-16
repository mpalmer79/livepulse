from __future__ import annotations

from collections import deque
from typing import Deque, Optional, Dict, Any
import math
import time

from core.insights import Insight


def _mean(values: list[float]) -> float:
    return sum(values) / len(values) if values else 0.0


def _std(values: list[float], mu: Optional[float] = None) -> float:
    if len(values) < 2:
        return 0.0
    if mu is None:
        mu = _mean(values)
    var = sum((v - mu) ** 2 for v in values) / (len(values) - 1)
    return math.sqrt(var)


class InsightsEngine:
    """
    Explainable "AI recommendations" engine.
    Uses a rolling window of metrics/events to generate human-readable insights.
    """

    def __init__(self, window_seconds: int = 180):
        self.window_seconds = window_seconds

        # store (ts_epoch, metrics_dict) and (ts_epoch, event_dict)
        self.metrics_window: Deque[tuple[float, Dict[str, Any]]] = deque()
        self.events_window: Deque[tuple[float, Dict[str, Any]]] = deque()

        # rate limiting: avoid spamming the same insight category
        self._last_emitted: Dict[str, float] = {}

    def ingest_metrics(self, metrics: Dict[str, Any]):
        now = time.time()
        self.metrics_window.append((now, metrics))
        self._trim(now)

    def ingest_event(self, event: Dict[str, Any]):
        now = time.time()
        self.events_window.append((now, event))
        self._trim(now)

    def _trim(self, now: float):
        cutoff = now - self.window_seconds
        while self.metrics_window and self.metrics_window[0][0] < cutoff:
            self.metrics_window.popleft()
        while self.events_window and self.events_window[0][0] < cutoff:
            self.events_window.popleft()

    def _cooldown_ok(self, key: str, cooldown_seconds: int = 45) -> bool:
        now = time.time()
        last = self._last_emitted.get(key, 0.0)
        if now - last >= cooldown_seconds:
            self._last_emitted[key] = now
            return True
        return False

    def evaluate(self, scenario: str) -> list[Insight]:
        """
        Run rules against the rolling window; return zero or more insights.
        """
        insights: list[Insight] = []
        if len(self.metrics_window) < 10:
            return insights  # wait for baseline

        # pull latest metrics snapshot
        latest = self.metrics_window[-1][1]

        # ---- Rule 1: Conversion drop vs baseline ----
        conv = float(latest.get("conversion_rate", 0.0) or 0.0)
        conv_series = [float(m.get("conversion_rate", 0.0) or 0.0) for _, m in self.metrics_window]
        mu = _mean(conv_series[:-1])
        sd = _std(conv_series[:-1], mu)

        # trigger if latest below mean - 2*sd (and sd not tiny)
        if sd > 0.0001 and conv < mu - 2.0 * sd and self._cooldown_ok("conversion_drop"):
            # find likely driver: checkout_start up but checkout_complete down, etc.
            drivers = self._driver_guess_conversion()

            insights.append(
                Insight(
                    scenario=scenario,
                    severity="HIGH",
                    category="Conversion",
                    message="Conversion rate dropped significantly vs baseline in the last few minutes.",
                    drivers=drivers,
                    recommendation="Inspect checkout flow, payment failures, and recent UI changes. Consider enabling Chaos mode to reproduce edge cases.",
                    confidence=82,
                )
            )

        # ---- Rule 2: Refund spike ----
        refund_rate = self._rate_for_event("refund")
        if refund_rate >= 0.15 and self._cooldown_ok("refund_spike"):  # 0.15 events/sec over window is high in this sim
            insights.append(
                Insight(
                    scenario=scenario,
                    severity="MEDIUM",
                    category="Refunds",
                    message="Refund activity is elevated relative to recent traffic.",
                    drivers=[
                        f"Refunds/sec (window): {refund_rate:.2f}",
                        "Possible product/fulfillment issue or payment gateway instability.",
                    ],
                    recommendation="Review recent orders for common SKUs/regions. Check payment provider logs and fulfillment latency.",
                    confidence=74,
                )
            )

        # ---- Rule 3: Traffic surge not converting ----
        page_rate = self._rate_for_event("page_view")
        order_rate = self._rate_for_event("order")
        if page_rate > 2.0 and order_rate < 0.10 and self._cooldown_ok("traffic_not_converting"):
            insights.append(
                Insight(
                    scenario=scenario,
                    severity="MEDIUM",
                    category="Funnel",
                    message="Traffic increased but orders are not rising proportionally.",
                    drivers=[
                        f"Page views/sec: {page_rate:.2f}",
                        f"Orders/sec: {order_rate:.2f}",
                        "Funnel mismatch suggests landing page relevance or checkout friction.",
                    ],
                    recommendation="Validate campaign targeting and landing page message match. Check checkout_start → checkout_complete drop-off.",
                    confidence=76,
                )
            )

        return insights

    def _rate_for_event(self, event_type: str) -> float:
        """
        Rough event rate over current window: events / seconds.
        """
        if not self.events_window:
            return 0.0
        count = 0
        start_ts = self.events_window[0][0]
        end_ts = self.events_window[-1][0]
        span = max(1.0, end_ts - start_ts)
        for _, e in self.events_window:
            if e.get("type") == event_type:
                count += 1
        return count / span

    def _driver_guess_conversion(self) -> list[str]:
        """
        Simple driver guess using event ratios.
        """
        checkout_start = self._rate_for_event("checkout_start")
        checkout_complete = self._rate_for_event("checkout_complete")
        cart_add = self._rate_for_event("cart_add")

        drivers = []
        drivers.append(f"checkout_start/sec: {checkout_start:.2f}")
        drivers.append(f"checkout_complete/sec: {checkout_complete:.2f}")
        drivers.append(f"cart_add/sec: {cart_add:.2f}")

        if checkout_start > 0.2 and checkout_complete < checkout_start * 0.4:
            drivers.append("Drop-off between checkout start and completion suggests payment/validation friction.")
        return drivers
