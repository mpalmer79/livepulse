"""
LivePulse - Configuration Management
Uses pydantic-settings for type-safe environment variable handling
"""
from typing import List
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # App config
    APP_NAME: str = "LivePulse"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # Server config
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001", 
        "https://livepulse.vercel.app",
        "https://*.vercel.app"
    ]
    
    # Redis (optional - falls back to in-memory for demo)
    REDIS_URL: str = ""
    
    # Database (optional - falls back to in-memory for demo)
    DATABASE_URL: str = ""
    
    # Sandbox defaults
    SANDBOX_DEFAULT_SCENARIO: str = "ecommerce"
    SANDBOX_DEFAULT_SPEED: float = 1.0
    SANDBOX_MAX_SPEED: float = 100.0
    SANDBOX_HISTORY_MINUTES: int = 30
    
    # WebSocket config
    WS_HEARTBEAT_INTERVAL: int = 30
    WS_MAX_CONNECTIONS: int = 1000
    
    # Rate limiting
    RATE_LIMIT_REQUESTS: int = 100
    RATE_LIMIT_WINDOW: int = 60
    
    # External integrations (optional)
    SLACK_WEBHOOK_URL: str = ""
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_PHONE_NUMBER: str = ""
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """Cached settings instance"""
    return Settings()


settings = get_settings()
