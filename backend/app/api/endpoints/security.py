from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any
import logging

from app.models.user import User
from app.security.jwt import get_current_user
from app.security.validator import security_validator
from app.security.utils import generate_secret_key, generate_encryption_key

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/health")
async def security_health_check(
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Security health check endpoint.
    Only accessible to authenticated users.
    """
    try:
        # Run security validation
        validation_results = security_validator.validate_all()
        security_score = security_validator.get_security_score()
        recommendations = security_validator.get_recommendations()
        
        return {
            "message": "Security health check completed",
            "user_id": current_user.id,
            "security_score": security_score,
            "is_secure": validation_results['is_secure'],
            "total_issues": validation_results['total_issues'],
            "total_warnings": validation_results['total_warnings'],
            "issues": validation_results['issues'],
            "warnings": validation_results['warnings'],
            "recommendations": recommendations,
            "status": "success"
        }
        
    except Exception as e:
        logger.error(f"Security health check failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Security health check failed: {str(e)}"
        )


@router.post("/generate-keys")
async def generate_security_keys(
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Generate new security keys for development/setup.
    WARNING: Only use this in development environments.
    """
    try:
        # Generate new keys
        jwt_secret = generate_secret_key(32)
        encryption_key = generate_encryption_key()
        
        logger.info(f"Security keys generated for user {current_user.id}")
        
        return {
            "message": "Security keys generated successfully",
            "user_id": current_user.id,
            "keys": {
                "SECRET_KEY": jwt_secret,
                "ENCRYPTION_KEY": encryption_key
            },
            "warning": "These keys are for development only. Store them securely and update your .env file.",
            "instructions": [
                "1. Copy these keys to your .env file",
                "2. Restart your application",
                "3. Never expose these keys in logs or version control",
                "4. Use different keys for production"
            ],
            "status": "success"
        }
        
    except Exception as e:
        logger.error(f"Key generation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Key generation failed: {str(e)}"
        )


@router.get("/config-validation")
async def validate_security_config(
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Validate current security configuration.
    Returns detailed validation results.
    """
    try:
        validation_results = security_validator.validate_all()
        
        return {
            "message": "Security configuration validated",
            "user_id": current_user.id,
            "validation_results": validation_results,
            "security_score": security_validator.get_security_score(),
            "recommendations": security_validator.get_recommendations(),
            "status": "success"
        }
        
    except Exception as e:
        logger.error(f"Security validation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Security validation failed: {str(e)}"
        )
