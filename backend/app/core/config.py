from pydantic_settings import BaseSettings
from typing import Optional
import secrets


class Settings(BaseSettings):
    # JWT Configuration
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Encryption Configuration
    ENCRYPTION_KEY: str = secrets.token_hex(32)  # Generate a random 32-byte key for dev
    
    # Database Configuration
    DATABASE_URL: str = "sqlite:///./londoolink.db"  # Use SQLite for development
    
    # AI Configuration
    OPENAI_API_KEY: str = "sk-dev-placeholder"
    
    # ChromaDB Configuration
    CHROMA_DB_PATH: str = "./chroma_db"
    
    # Environment
    ENVIRONMENT: str = "development"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
