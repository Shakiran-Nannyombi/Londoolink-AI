import os
from typing import Optional

from pydantic_settings import BaseSettings, SettingsConfigDict

# Use .env.development if it exists (local dev), otherwise .env (production)
_env_file = ".env.development" if os.path.exists(".env.development") else ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=_env_file,
        case_sensitive=True,
        extra="ignore",
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
    GROQ_API_KEY: Optional[str] = None  # Primary AI provider
    OPENAI_API_KEY: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None
    CLAUDE_API_KEY: Optional[str] = None

    # ChromaDB Configuration
    CHROMA_DB_PATH: str

    # Ollama Configuration
    OLLAMA_BASE_URL: str = "http://localhost:11434"

    # Environment
    ENVIRONMENT: str

    # Google OAuth
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None
    GOOGLE_REDIRECT_URI: Optional[str] = None

    # Africa's Talking SMS
    AT_USERNAME: Optional[str] = None
    AT_API_KEY: Optional[str] = None

    # Auth0 Token Vault
    AUTH0_DOMAIN: Optional[str] = None          # e.g. your-tenant.auth0.com
    AUTH0_CLIENT_ID: Optional[str] = None       # Auth0 application client ID
    AUTH0_CLIENT_SECRET: Optional[str] = None   # Auth0 application client secret
    AUTH0_AUDIENCE: Optional[str] = None        # Auth0 API audience identifier
    AUTH0_TOKEN_VAULT_BASE_URL: Optional[str] = None  # e.g. https://{domain}/api/v2/token-vault
    AUTH0_M2M_CLIENT_ID: Optional[str] = None   # M2M application client ID for vault access
    AUTH0_M2M_CLIENT_SECRET: Optional[str] = None  # M2M application client secret

    # OAuth redirect base
    FRONTEND_URL: Optional[str] = None          # e.g. https://londoolink-ai.vercel.app

    # Notion OAuth
    NOTION_CLIENT_ID: Optional[str] = None      # Notion integration client ID
    NOTION_CLIENT_SECRET: Optional[str] = None  # Notion integration client secret
    NOTION_REDIRECT_URI: Optional[str] = None   # Notion OAuth redirect URI


def validate_auth0_config() -> None:
    """Validate that all required Auth0 environment variables are set.

    Raises RuntimeError listing all missing AUTH0_* variables when
    ENVIRONMENT != 'development'.
    """
    if settings.ENVIRONMENT == "development":
        return

    required = {
        "AUTH0_DOMAIN": settings.AUTH0_DOMAIN,
        "AUTH0_CLIENT_ID": settings.AUTH0_CLIENT_ID,
        "AUTH0_CLIENT_SECRET": settings.AUTH0_CLIENT_SECRET,
        "AUTH0_AUDIENCE": settings.AUTH0_AUDIENCE,
        "AUTH0_TOKEN_VAULT_BASE_URL": settings.AUTH0_TOKEN_VAULT_BASE_URL,
        "AUTH0_M2M_CLIENT_ID": settings.AUTH0_M2M_CLIENT_ID,
        "AUTH0_M2M_CLIENT_SECRET": settings.AUTH0_M2M_CLIENT_SECRET,
    }

    missing = [name for name, value in required.items() if not value]

    if missing:
        raise RuntimeError(
            f"Missing required Auth0 environment variables: {', '.join(missing)}. "
            "Set these variables or set ENVIRONMENT=development to skip validation."
        )


settings = Settings()
