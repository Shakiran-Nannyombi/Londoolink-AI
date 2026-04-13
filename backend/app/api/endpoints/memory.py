"""
Memory management API endpoints for Backboard integration.

POST /api/v1/memory/preferences — Add a user preference
GET /api/v1/memory/preferences — Get all user preferences
"""

import logging
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.core.config import settings
from app.models.user import User
from app.security.jwt import get_current_user
from app.services.backboard.backboard_service import (
    BackboardService,
    BackboardServiceError,
)

logger = logging.getLogger(__name__)
router = APIRouter()


# Request/Response schemas
class PreferenceCreate(BaseModel):
    content: str


class PreferenceResponse(BaseModel):
    content: str
    timestamp: str


@router.post("/preferences", response_model=dict)
async def add_preference(
    preference: PreferenceCreate,
    current_user: User = Depends(get_current_user),
):
    """Add a user preference to agent memory."""
    if not settings.USE_BACKBOARD:
        raise HTTPException(
            status_code=503,
            detail="Backboard service is not enabled"
        )
    
    try:
        backboard = BackboardService(
            api_key=settings.BACKBOARD_API_KEY,
            base_url=settings.BACKBOARD_BASE_URL
        )
        
        # Get or create assistant for user
        assistant_id = backboard.get_or_create_assistant(current_user.id)
        
        # Add memory
        memory_id = backboard.add_memory(assistant_id, preference.content)
        
        logger.info(f"Added preference for user {current_user.id}: memory_id={memory_id}")
        
        return {
            "status": "success",
            "message": "Preference added successfully",
            "memory_id": memory_id
        }
        
    except BackboardServiceError as e:
        logger.error(f"Failed to add preference: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to add preference: {str(e)}"
        )


@router.get("/preferences", response_model=dict)
async def get_preferences(
    current_user: User = Depends(get_current_user),
):
    """Get all user preferences from agent memory."""
    if not settings.USE_BACKBOARD:
        raise HTTPException(
            status_code=503,
            detail="Backboard service is not enabled"
        )
    
    try:
        backboard = BackboardService(
            api_key=settings.BACKBOARD_API_KEY,
            base_url=settings.BACKBOARD_BASE_URL
        )
        
        # Get or create assistant for user
        assistant_id = backboard.get_or_create_assistant(current_user.id)
        
        # Get all memories (returns dict with memories, total_count, etc.)
        result = backboard.get_all_memories(assistant_id)
        
        logger.info(f"Retrieved {len(result.get('memories', []))} preferences for user {current_user.id}")
        
        return result
        
    except BackboardServiceError as e:
        logger.error(f"Failed to get preferences: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get preferences: {str(e)}"
        )
