from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
    )
    
    # JWT Configuration
    SECRET_KEY: str
    JWT_ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int 
    
    # Encryption Configuration
    ENCRYPTION_KEY: str 
    
    # Database Configuration
    DATABASE_URL: str 
    
    # AI Configuration
    OPENAI_API_KEY: str
    GEMINI_API_KEY: Optional[str] = None
    GROQ_API_KEY: Optional[str] = None
    CLAUDE_API_KEY: Optional[str] = None 

    # ChromaDB Configuration
    CHROMA_DB_PATH: str
    
    # Environment
    ENVIRONMENT: str 
    
settings = Settings()
