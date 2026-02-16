"""
LivePulse - E-commerce Simulator
Generates realistic e-commerce events: orders, carts, page views, etc.
"""
import random
from typing import Dict, Any, List
from datetime import datetime, timedelta
import math

from core.models import Event, Scenario, EventSeverity, EcommerceMetrics
from .base import BaseSimulator


# Realistic product catalog
PRODUCTS = [
    {"id": "prod_001", "name": "Wireless Headphones Pro", "category": "Electronics", "price": 149.99},
    {"id": "prod_002", "name": "Organic Coffee Beans 1kg", "category": "Food & Beverage", "price": 24.99},
    {"id": "prod_003", "name": "Yoga Mat Premium", "category": "Sports", "price": 45.00},
    {"id": "prod_004", "name": "Smart Watch Series X", "category": "Electronics", "price": 299.99},
    {"id": "prod_005", "name": "Running Shoes Air", "category": "Sports", "price": 129.99},
    {"id": "prod_006", "name": "Protein Powder 2kg", "category": "Health", "price": 54.99},
    {"id": "prod_007", "name": "Bluetooth Speaker Mini", "category": "Electronics", "price": 79.99},
    {"id": "prod_008", "name": "Leather Wallet Classic", "category": "Accessories", "price": 65.00},
    {"id": "prod_009", "name": "Face Moisturizer SPF30", "category": "Beauty", "price": 32.99},
    {"id": "prod_010", "name": "Mechanical Keyboard RGB", "category": "Electronics", "price": 119.99},
    {"id": "prod_011", "name": "Camping Tent 4-Person", "category": "Outdoor", "price": 189.99},
    {"id": "prod_012", "name": "Stainless Steel Water Bottle", "category": "Sports", "price": 28.99},
    {"id": "prod_013", "name": "Wireless Charger Pad", "category": "Electronics", "price": 34.99},
    {"id": "prod_014", "name": "Essential Oil Diffuser", "category": "Home", "price": 42.99},
    {"id": "prod_015", "name": "Gaming Mouse Pro", "category": "Electronics", "price": 69.99},
]

# Geographic distribution (weighted by population/purchasing power)
REGIONS = [
    {"code": "US-CA", "name": "California", "weight": 15},
    {"code": "US-TX", "name": "Texas", "weight": 12},
    {"code": "US-NY", "name": "New York", "weight": 10},
    {"code": "US-FL", "name": "Florida", "weight": 8},
    {"code": "UK-LON", "name": "London", "weight": 7},
    {"code": "DE-BE", "name": "Berlin", "weight": 5},
    {"code": "FR-IDF", "name": "Paris", "weight": 5},
    {"code": "CA-ON", "name": "Ontario", "weight": 4},
    {"code": "AU-NSW", "name": "Sydney", "weight": 4},
    {"code": "US-WA", "name": "Washington", "weight": 4},
]

# Payment methods
PAYMENT_METHODS = ["credit_card", "debit_card", "paypal", "apple_pay", "google_pay"]

# Traffic sources
TRAFFIC_SOURCES = [
    {"source": "organic", "weight": 30},
    {"source": "paid_search", "weight": 25},
    {"source": "social", "weight": 20},
    {"source": "email", "weight": 15},
    {"source": "direct", "weight": 10},
]


class EcommerceSimulator(BaseSimulator):
    """
    Simulates realistic e-commerce activity including:
    - Page views with realistic browsing patterns
    - Cart additions/removals
    - Checkout flow with abandonment
    - Order completion
    - Refunds and returns
    - Product reviews
    """
    
    def __init__(self):
        super().__init__(Scenario.ECOMMERCE)
        
        # Event type weights (determines frequency)
        self._event_weights = {
            "page_view": 50,
            "cart_add": 15,
            "cart_remove": 5,
            "checkout_start": 8,
            "checkout_complete": 5,
            "order": 5,
            "refund": 1,
            "review": 1,
        }
        
        # Simulation state
        self._active_carts: Dict[str, List[Dict]] = {}  # session_id -> items
        self._active_checkouts: Dict[str, Dict] = {}     # session_id -> checkout data
        self._daily_stats = self._init_daily_stats()
        
        # Time-based traffic patterns (24h cycle)
        self._hourly_traffic = [
            0.3, 0.2, 0.15, 0.1, 0.1, 0.15,   # 0-5: Night (low)
            0.3, 0.5, 0.7, 0.9, 1.0, 1.0,     # 6-11: Morning ramp up
            0.95, 0.9, 0.85, 0.9, 0.95, 1.0,  # 12-17: Afternoon
            1.1, 1.2, 1.15, 1.0, 0.8, 0.5,    # 18-23: Evening peak then decline
        ]
        
        # Alert thresholds
        self._alert_thresholds = {
            "high_cart_abandonment": 0.75,  # 75% abandonment rate
            "low_conversion": 0.01,          # 1% conversion rate
            "revenue_spike": 10000,          # Revenue spike alert
            "error_spike": 0.1,              # 10% error rate
        }
    
    def _init_daily_stats(self) -> Dict[str, Any]:
        """Initialize daily statistics tracking"""
        return {
            "revenue": 0,
            "orders": 0,
            "refunds": 0,
            "page_views": 0,
            "unique_visitors": set(),
            "cart_adds": 0,
            "cart_removes": 0,
            "checkout_starts": 0,
            "checkout_completes": 0,
            "product_sales": {},
        }
    
    def get_event_types(self) -> List[str]:
        return list(self._event_weights.keys())
    
    def _get_traffic_multiplier(self) -> float:
        """Get traffic multiplier based on time of day"""
        hour = datetime.utcnow().hour
        return self._hourly_traffic[hour]
    
    def _weighted_choice(self, choices: List[Dict], weight_key: str = "weight") -> Dict:
        """Make a weighted random choice"""
        weights = [c[weight_key] for c in choices]
        return random.choices(choices, weights=weights)[0]
    
    def _generate_session_id(self) -> str:
        """Generate a realistic session ID"""
        return f"sess_{random.randint(100000, 999999)}"
    
    def _generate_user_id(self) -> str:
        """Generate a user ID (some sessions are anonymous)"""
        if random.random() < 0.4:  # 40% are logged in
            return f"user_{random.randint(10000, 99999)}"
        return None
    
    def _select_event_type(self) -> str:
        """Select an event type based on weights"""
        types = list(self._event_weights.keys())
        weights = list(self._event_weights.values())
        return random.choices(types, weights=weights)[0]
    
    def generate_event(self) -> Event:
        """Generate a single e-commerce event"""
        event_type = self._select_event_type()
        
        generators = {
            "page_view": self._generate_page_view,
            "cart_add": self._generate_cart_add,
            "cart_remove": self._generate_cart_remove,
            "checkout_start": self._generate_checkout_start,
            "checkout_complete": self._generate_checkout_complete,
            "order": self._generate_order,
            "refund": self._generate_refund,
            "review": self._generate_review,
        }
        
        generator = generators.get(event_type, self._generate_page_view)
        return generator()
    
    def _generate_page_view(self) -> Event:
        """Generate a page view event"""
        product = random.choice(PRODUCTS) if random.random() < 0.7 else None
        region = self._weighted_choice(REGIONS)
        source = self._weighted_choice(TRAFFIC_SOURCES)
        
        page_types = ["home", "category", "product", "search", "cart", "checkout", "account"]
        page_weights = [15, 20, 40, 10, 8, 5, 2]
        page_type = random.choices(page_types, weights=page_weights)[0]
        
        data = {
            "page_type": page_type,
            "session_id": self._generate_session_id(),
            "user_id": self._generate_user_id(),
            "region": region["code"],
            "region_name": region["name"],
            "source": source["source"],
            "device": random.choice(["desktop", "mobile", "tablet"]),
            "browser": random.choice(["chrome", "safari", "firefox", "edge"]),
            "duration_seconds": random.randint(5, 300),
        }
        
        if product and page_type == "product":
            data["product_id"] = product["id"]
            data["product_name"] = product["name"]
            data["product_price"] = product["price"]
            data["product_category"] = product["category"]
        
        self._daily_stats["page_views"] = self._daily_stats["page_views"] + 1
        if data.get("user_id"):
            self._daily_stats["unique_visitors"].add(data["user_id"])
        
        return self.create_event("page_view", data)
    
    def _generate_cart_add(self) -> Event:
        """Generate cart add event"""
        product = random.choice(PRODUCTS)
        session_id = self._generate_session_id()
        quantity = random.choices([1, 2, 3, 4], weights=[70, 20, 7, 3])[0]
        
        # Track in active carts
        if session_id not in self._active_carts:
            self._active_carts[session_id] = []
        
        item = {
            "product_id": product["id"],
            "product_name": product["name"],
            "price": product["price"],
            "quantity": quantity,
        }
        self._active_carts[session_id].append(item)
        
        # Limit cart tracking to prevent memory issues
        if len(self._active_carts) > 1000:
            oldest = list(self._active_carts.keys())[0]
            del self._active_carts[oldest]
        
        data = {
            "session_id": session_id,
            "user_id": self._generate_user_id(),
            "product_id": product["id"],
            "product_name": product["name"],
            "product_category": product["category"],
            "price": product["price"],
            "quantity": quantity,
            "cart_total": sum(i["price"] * i["quantity"] for i in self._active_carts[session_id]),
            "cart_items": len(self._active_carts[session_id]),
        }
        
        self._daily_stats["cart_adds"] = self._daily_stats["cart_adds"] + 1
        
        return self.create_event("cart_add", data)
    
    def _generate_cart_remove(self) -> Event:
        """Generate cart remove event"""
        # Use an existing cart if available
        if self._active_carts:
            session_id = random.choice(list(self._active_carts.keys()))
            cart = self._active_carts[session_id]
            
            if cart:
                removed_item = cart.pop(random.randrange(len(cart)))
                
                data = {
                    "session_id": session_id,
                    "product_id": removed_item["product_id"],
                    "product_name": removed_item["product_name"],
                    "price": removed_item["price"],
                    "quantity": removed_item["quantity"],
                    "cart_total": sum(i["price"] * i["quantity"] for i in cart),
                    "cart_items": len(cart),
                }
                
                self._daily_stats["cart_removes"] = self._daily_stats["cart_removes"] + 1
                
                return self.create_event("cart_remove", data)
        
        # Fallback to generated data
        product = random.choice(PRODUCTS)
        return self.create_event("cart_remove", {
            "session_id": self._generate_session_id(),
            "product_id": product["id"],
            "product_name": product["name"],
            "price": product["price"],
            "quantity": 1,
            "cart_total": 0,
            "cart_items": 0,
        })
    
    def _generate_checkout_start(self) -> Event:
        """Generate checkout start event"""
        session_id = self._generate_session_id()
        
        # Use existing cart or generate items
        if session_id in self._active_carts and self._active_carts[session_id]:
            items = self._active_carts[session_id]
        else:
            num_items = random.choices([1, 2, 3, 4, 5], weights=[40, 30, 15, 10, 5])[0]
            items = []
            for _ in range(num_items):
                product = random.choice(PRODUCTS)
                items.append({
                    "product_id": product["id"],
                    "product_name": product["name"],
                    "price": product["price"],
                    "quantity": random.randint(1, 3),
                })
        
        subtotal = sum(i["price"] * i["quantity"] for i in items)
        shipping = 0 if subtotal > 50 else 9.99
        tax = subtotal * 0.08
        total = subtotal + shipping + tax
        
        checkout_data = {
            "session_id": session_id,
            "items": items,
            "subtotal": round(subtotal, 2),
            "shipping": shipping,
            "tax": round(tax, 2),
            "total": round(total, 2),
        }
        
        self._active_checkouts[session_id] = checkout_data
        
        # Limit checkout tracking
        if len(self._active_checkouts) > 500:
            oldest = list(self._active_checkouts.keys())[0]
            del self._active_checkouts[oldest]
        
        region = self._weighted_choice(REGIONS)
        
        data = {
            **checkout_data,
            "user_id": self._generate_user_id(),
            "region": region["code"],
            "item_count": len(items),
        }
        
        self._daily_stats["checkout_starts"] = self._daily_stats["checkout_starts"] + 1
        
        return self.create_event("checkout_start", data)
    
    def _generate_checkout_complete(self) -> Event:
        """Generate checkout complete event (order placed)"""
        # Use existing checkout or generate
        if self._active_checkouts:
            session_id = random.choice(list(self._active_checkouts.keys()))
            checkout = self._active_checkouts.pop(session_id)
        else:
            # Generate checkout data
            num_items = random.choices([1, 2, 3], weights=[50, 35, 15])[0]
            items = []
            for _ in range(num_items):
                product = random.choice(PRODUCTS)
                items.append({
                    "product_id": product["id"],
                    "product_name": product["name"],
                    "price": product["price"],
                    "quantity": random.randint(1, 2),
                })
            
            subtotal = sum(i["price"] * i["quantity"] for i in items)
            shipping = 0 if subtotal > 50 else 9.99
            tax = subtotal * 0.08
            
            checkout = {
                "session_id": self._generate_session_id(),
                "items": items,
                "subtotal": round(subtotal, 2),
                "shipping": shipping,
                "tax": round(tax, 2),
                "total": round(subtotal + shipping + tax, 2),
            }
        
        region = self._weighted_choice(REGIONS)
        payment = random.choice(PAYMENT_METHODS)
        
        data = {
            **checkout,
            "order_id": f"ORD-{random.randint(100000, 999999)}",
            "user_id": self._generate_user_id(),
            "payment_method": payment,
            "region": region["code"],
            "region_name": region["name"],
            "item_count": len(checkout["items"]),
        }
        
        self._daily_stats["checkout_completes"] = self._daily_stats["checkout_completes"] + 1
        
        return self.create_event("checkout_complete", data)
    
    def _generate_order(self) -> Event:
        """Generate order confirmation event"""
        num_items = random.choices([1, 2, 3, 4], weights=[45, 35, 15, 5])[0]
        items = []
        
        for _ in range(num_items):
            product = random.choice(PRODUCTS)
            quantity = random.choices([1, 2, 3], weights=[70, 25, 5])[0]
            items.append({
                "product_id": product["id"],
                "product_name": product["name"],
                "category": product["category"],
                "price": product["price"],
                "quantity": quantity,
                "line_total": round(product["price"] * quantity, 2),
            })
            
            # Track product sales
            pid = product["id"]
            if pid not in self._daily_stats["product_sales"]:
                self._daily_stats["product_sales"][pid] = {"name": product["name"], "units": 0, "revenue": 0}
            self._daily_stats["product_sales"][pid]["units"] = self._daily_stats["product_sales"][pid]["units"] + quantity
            self._daily_stats["product_sales"][pid]["revenue"] = self._daily_stats["product_sales"][pid]["revenue"] + (product["price"] * quantity)
        
        subtotal = sum(i["line_total"] for i in items)
        shipping = 0 if subtotal > 50 else 9.99
        tax = subtotal * 0.08
        total = subtotal + shipping + tax
        
        region = self._weighted_choice(REGIONS)
        payment = random.choice(PAYMENT_METHODS)
        
        data = {
            "order_id": f"ORD-{random.randint(100000, 999999)}",
            "session_id": self._generate_session_id(),
            "user_id": self._generate_user_id(),
            "items": items,
            "item_count": num_items,
            "subtotal": round(subtotal, 2),
            "shipping": round(shipping, 2),
            "tax": round(tax, 2),
            "total": round(total, 2),
            "payment_method": payment,
            "region": region["code"],
            "region_name": region["name"],
            "currency": "USD",
        }
        
        self._daily_stats["orders"] = self._daily_stats["orders"] + 1
        self._daily_stats["revenue"] = self._daily_stats["revenue"] + total
        
        return self.create_event("order", data)
    
    def _generate_refund(self) -> Event:
        """Generate refund event"""
        product = random.choice(PRODUCTS)
        quantity = random.randint(1, 2)
        refund_amount = product["price"] * quantity
        
        reasons = [
            "Wrong size/fit",
            "Damaged during shipping",
            "Not as described",
            "Changed mind",
            "Quality issues",
            "Late delivery",
        ]
        
        data = {
            "refund_id": f"REF-{random.randint(10000, 99999)}",
            "order_id": f"ORD-{random.randint(100000, 999999)}",
            "user_id": self._generate_user_id(),
            "product_id": product["id"],
            "product_name": product["name"],
            "quantity": quantity,
            "refund_amount": round(refund_amount, 2),
            "reason": random.choice(reasons),
            "original_payment_method": random.choice(PAYMENT_METHODS),
        }
        
        self._daily_stats["refunds"] = self._daily_stats["refunds"] + 1
        
        return self.create_event("refund", data, severity=EventSeverity.WARNING)
    
    def _generate_review(self) -> Event:
        """Generate product review event"""
        product = random.choice(PRODUCTS)
        
        # Ratings tend toward positive (4-5 stars most common)
        rating = random.choices([1, 2, 3, 4, 5], weights=[5, 8, 15, 35, 37])[0]
        
        data = {
            "review_id": f"REV-{random.randint(10000, 99999)}",
            "order_id": f"ORD-{random.randint(100000, 999999)}",
            "user_id": self._generate_user_id(),
            "product_id": product["id"],
            "product_name": product["name"],
            "rating": rating,
            "verified_purchase": random.random() < 0.85,
            "helpful_votes": random.randint(0, 50) if random.random() < 0.3 else 0,
        }
        
        return self.create_event("review", data)
    
    def get_aggregated_metrics(self) -> EcommerceMetrics:
        """Calculate aggregated e-commerce metrics"""
    
        window_events = self._metric_window
        
        # Count events by type
        event_counts = {}
        for event in window_events:
            event_counts[event.type] = event_counts.get(event.type, 0) + 1
        
        # Calculate revenue from orders
        revenue = sum(
            e.data.get("total", 0) 
            for e in window_events 
            if e.type == "order"
        )
        
        orders = event_counts.get("order", 0)
        page_views = event_counts.get("page_view", 0)
        cart_adds = event_counts.get("cart_add", 0)
        checkout_starts = event_counts.get("checkout_start", 0)
        checkout_completes = event_counts.get("checkout_complete", 0)
        
        # Calculate rates
        window_seconds = self._metric_window_seconds
        events_per_second = len(window_events) / window_seconds if window_seconds > 0 else 0
        revenue_per_minute = (revenue / window_seconds) * 60 if window_seconds > 0 else 0
        orders_per_minute = (orders / window_seconds) * 60 if window_seconds > 0 else 0
        
        avg_order_value = revenue / orders if orders > 0 else 0
        conversion_rate = (orders / page_views * 100) if page_views > 0 else 0
        cart_abandonment = 1 - (checkout_completes / checkout_starts) if checkout_starts > 0 else 0
        
        # Error rate
        error_events = sum(1 for e in window_events if e.severity == EventSeverity.ERROR)
        error_rate = error_events / len(window_events) if window_events else 0
        
        # Top products from daily stats
        top_products = sorted(
            self._daily_stats["product_sales"].values(),
            key=lambda x: x["revenue"],
            reverse=True
        )[:5]
        
        return EcommerceMetrics(
            period_seconds=window_seconds,
            events_per_second=round(events_per_second, 2),
            total_events=len(window_events),
            error_rate=round(error_rate, 4),
            revenue_total=round(self._daily_stats["revenue"], 2),
            revenue_per_minute=round(revenue_per_minute, 2),
            average_order_value=round(avg_order_value, 2),
            orders_total=self._daily_stats["orders"],
            orders_per_minute=round(orders_per_minute, 2),
            orders_pending=len(self._active_checkouts),
            orders_completed=checkout_completes,
            orders_refunded=self._daily_stats["refunds"],
            cart_additions=cart_adds,
            cart_abandonment_rate=round(cart_abandonment, 4),
            page_views=self._daily_stats["page_views"],
            unique_visitors=len(self._daily_stats["unique_visitors"]),
            conversion_rate=round(conversion_rate, 4),
            top_products=top_products,
        )
    
    def inject_event(self, event_type: str, data: Dict[str, Any] = None) -> Event:
        """Inject a specific event with optional custom data"""
        generators = {
            "page_view": self._generate_page_view,
            "cart_add": self._generate_cart_add,
            "cart_remove": self._generate_cart_remove,
            "checkout_start": self._generate_checkout_start,
            "checkout_complete": self._generate_checkout_complete,
            "order": self._generate_order,
            "refund": self._generate_refund,
            "review": self._generate_review,
        }
        
        if event_type not in generators:
            raise ValueError(f"Unknown event type: {event_type}")
        
        event = generators[event_type]()
        
        # Override with custom data if provided
        if data:
            event.data.update(data)
        
        return event
