"""
LivePulse - Real-time Analytics Platform
Main FastAPI Application Entry Point
"""
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import structlog

from api.routes import router as api_router
from websocket.manager import ConnectionManager
from websocket.routes import router as ws_router
from core.config import settings
from sandbox.orchestrator import SandboxOrchestrator

# Configure structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.dev.ConsoleRenderer() if settings.DEBUG else structlog.processors.JSONRenderer()
    ],
    wrapper_class=structlog.stdlib.BoundLogger,
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()

# Global instances
connection_manager = ConnectionManager()
sandbox_orchestrator = SandboxOrchestrator(connection_manager)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan - startup and shutdown events"""
    logger.info("starting_livepulse", version="1.0.0", environment=settings.ENVIRONMENT)
    
    # Start sandbox simulators in background
    sandbox_task = asyncio.create_task(sandbox_orchestrator.start())
    
    yield
    
    # Shutdown
    logger.info("shutting_down_livepulse")
    sandbox_orchestrator.stop()
    sandbox_task.cancel()
    try:
        await sandbox_task
    except asyncio.CancelledError:
        pass
    
    # Close all WebSocket connections
    await connection_manager.disconnect_all()


app = FastAPI(
    title="LivePulse",
    description="Real-time Analytics & Monitoring Platform with Sandbox Environment",
    version="1.0.0",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(api_router, prefix="/api/v1")
app.include_router(ws_router, prefix="/ws")


@app.get("/health")
async def health_check():
    """Health check endpoint for deployment monitoring"""
    return {
        "status": "healthy",
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT,
        "connections": connection_manager.active_count,
        "sandbox_active": sandbox_orchestrator.is_running
    }


@app.get("/")
async def root():
    """Root endpoint with API info"""
    return {
        "name": "LivePulse API",
        "version": "1.0.0",
        "docs": "/docs" if settings.DEBUG else "Disabled in production",
        "websocket": "/ws/stream",
        "health": "/health"
    }


# Make instances available to routes via app.state
app.state.connection_manager = connection_manager
app.state.sandbox_orchestrator = sandbox_orchestrator
