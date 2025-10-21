from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any

from app.models.user import User
from app.schemas.user import User as UserSchema
from app.security.jwt import get_current_user

router = APIRouter()


@router.get("/health")
async def health_check() -> Dict[str, str]:
    """Health check endpoint to verify the service is running."""
    return {"status": "ok", "service": "Londoolink AI Agent"}


@router.get("/briefing/daily")
async def get_daily_briefing(current_user: User = Depends(get_current_user)) -> Dict[str, Any]:
    """Get daily briefing from AI agents."""
    # TODO: Implement agent orchestration service call
    return {
        "message": f"Daily briefing for {current_user.email}",
        "briefing": "This will contain your AI-generated daily briefing",
        "user_id": current_user.id
    }


@router.get("/users/me", response_model=UserSchema)
async def get_current_user_info(current_user: User = Depends(get_current_user)) -> UserSchema:
    """Get current user information."""
    return UserSchema.from_orm(current_user)
