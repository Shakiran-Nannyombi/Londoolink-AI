import logging
from typing import Any, Dict, List

from app.core.config import settings

from .utils import validate_secret_key

logger = logging.getLogger(__name__)


class SecurityValidator:
    """Validates security configuration and settings."""

    def __init__(self):
        self.issues: List[str] = []
        self.warnings: List[str] = []

    def validate_all(self) -> Dict[str, Any]:
        """
        Run all security validations.

        Returns:
            Dictionary with validation results
        """
        self.issues.clear()
        self.warnings.clear()

        self._validate_jwt_config()
        self._validate_encryption_config()
        self._validate_database_config()
        self._validate_environment_config()
        self._validate_api_keys()

        return {
            "is_secure": len(self.issues) == 0,
            "issues": self.issues,
            "warnings": self.warnings,
            "total_issues": len(self.issues),
            "total_warnings": len(self.warnings),
        }

    def _validate_jwt_config(self):
        """Validate JWT configuration."""
        # Check SECRET_KEY
        if not hasattr(settings, "SECRET_KEY") or not settings.SECRET_KEY:
            self.issues.append("SECRET_KEY is not set")
        elif settings.SECRET_KEY == "your-secret-key" or len(settings.SECRET_KEY) < 32:
            self.issues.append("SECRET_KEY is too weak or using default value")
        elif not validate_secret_key(settings.SECRET_KEY, min_length=16):
            self.issues.append("SECRET_KEY format is invalid")

        # Check JWT algorithm
        if not hasattr(settings, "JWT_ALGORITHM") or settings.JWT_ALGORITHM != "HS256":
            self.warnings.append("JWT_ALGORITHM should be HS256 for symmetric signing")

        # Check token expiration
        if not hasattr(settings, "ACCESS_TOKEN_EXPIRE_MINUTES"):
            self.warnings.append("ACCESS_TOKEN_EXPIRE_MINUTES not set, using default")
        elif settings.ACCESS_TOKEN_EXPIRE_MINUTES > 1440:  # 24 hours
            self.warnings.append(
                "ACCESS_TOKEN_EXPIRE_MINUTES is very long (>24h), consider shorter expiration"
            )
        elif settings.ACCESS_TOKEN_EXPIRE_MINUTES < 5:
            self.warnings.append(
                "ACCESS_TOKEN_EXPIRE_MINUTES is very short (<5min), may cause UX issues"
            )

    def _validate_encryption_config(self):
        """Validate encryption configuration."""
        if not hasattr(settings, "ENCRYPTION_KEY") or not settings.ENCRYPTION_KEY:
            self.issues.append("ENCRYPTION_KEY is not set")
        elif settings.ENCRYPTION_KEY == "your_32_byte_encryption_key":
            self.issues.append("ENCRYPTION_KEY is using default value")
        elif not validate_secret_key(settings.ENCRYPTION_KEY, min_length=32):
            self.issues.append(
                "ENCRYPTION_KEY must be at least 32 bytes (64 hex characters)"
            )

    def _validate_database_config(self):
        """Validate database security configuration."""
        if not hasattr(settings, "DATABASE_URL") or not settings.DATABASE_URL:
            self.issues.append("DATABASE_URL is not set")
        elif (
            "localhost" in settings.DATABASE_URL
            and settings.ENVIRONMENT == "production"
        ):
            self.warnings.append("Using localhost database in production environment")
        elif (
            "password" in settings.DATABASE_URL.lower()
            and settings.DATABASE_URL.count("password") > 1
        ):
            self.warnings.append("Database URL may contain weak password")

        # Check for default credentials
        if "londoolink:londoolink123" in settings.DATABASE_URL:
            self.issues.append("Database is using default credentials")

    def _validate_environment_config(self):
        """Validate environment-specific security settings."""
        if not hasattr(settings, "ENVIRONMENT"):
            self.warnings.append("ENVIRONMENT not set, assuming development")
        elif settings.ENVIRONMENT == "production":
            self._validate_production_config()
        elif settings.ENVIRONMENT == "development":
            self._validate_development_config()

    def _validate_production_config(self):
        """Validate production-specific security settings."""
        # Check for debug settings
        if hasattr(settings, "DEBUG") and settings.DEBUG:
            self.issues.append("DEBUG should be False in production")

        # Check for secure protocols
        if hasattr(settings, "DATABASE_URL") and settings.DATABASE_URL.startswith(
            "postgresql://"
        ):
            self.warnings.append(
                "Consider using postgresql+psycopg2:// for better performance"
            )

        # Check HTTPS enforcement
        if not hasattr(settings, "FORCE_HTTPS") or not settings.FORCE_HTTPS:
            self.warnings.append("FORCE_HTTPS should be enabled in production")

    def _validate_development_config(self):
        """Validate development-specific settings."""
        if hasattr(settings, "SECRET_KEY") and len(settings.SECRET_KEY) < 32:
            self.warnings.append("Even in development, use a strong SECRET_KEY")

    def _validate_api_keys(self):
        """Validate API key configurations."""
        # Check Groq API key
        if not hasattr(settings, "GROQ_API_KEY") or not settings.GROQ_API_KEY:
            self.issues.append("GROQ_API_KEY is required for AI functionality")
        elif settings.GROQ_API_KEY.startswith("gsk-dev-placeholder"):
            self.warnings.append("GROQ_API_KEY appears to be a placeholder")

        # Check optional API keys
        optional_keys = ["OPENAI_API_KEY", "GEMINI_API_KEY", "CLAUDE_API_KEY"]
        for key in optional_keys:
            if hasattr(settings, key) and getattr(settings, key):
                api_key = getattr(settings, key)
                if "placeholder" in api_key or "dev-" in api_key:
                    self.warnings.append(f"{key} appears to be a placeholder")

    def get_security_score(self) -> int:
        """
        Calculate a security score from 0-100.

        Returns:
            Security score (100 = perfect, 0 = critical issues)
        """
        base_score = 100

        # Deduct points for issues
        base_score -= len(self.issues) * 20  # Critical issues
        base_score -= len(self.warnings) * 5  # Warnings

        return max(0, base_score)

    def get_recommendations(self) -> List[str]:
        """
        Get security improvement recommendations.

        Returns:
            List of actionable recommendations
        """
        recommendations = []

        if any("SECRET_KEY" in issue for issue in self.issues):
            recommendations.append(
                "Generate a new SECRET_KEY using: openssl rand -hex 32"
            )

        if any("ENCRYPTION_KEY" in issue for issue in self.issues):
            recommendations.append(
                'Generate a new ENCRYPTION_KEY using: python -c "import os; print(os.urandom(32).hex())"'
            )

        if any("default" in issue.lower() for issue in self.issues):
            recommendations.append(
                "Replace all default credentials and keys with secure values"
            )

        if any("production" in warning.lower() for warning in self.warnings):
            recommendations.append(
                "Review production security settings and enable HTTPS"
            )

        if len(self.issues) == 0 and len(self.warnings) > 0:
            recommendations.append("Address warnings to improve security posture")

        return recommendations


# Global validator instance
security_validator = SecurityValidator()
