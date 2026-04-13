"""
Thread management API endpoints for Backboard integration.

GET /api/v1/threads — List all threads for user
GET /api/v1/threads/{thread_id} — Get thread history
POST /api/v1/threads/{thread_id}/messages — Ask follow-up question
"""

import logging
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Path
from pydantic import BaseModel

from app.core.config import settings
from app.models.user import User
from app.security.jwt import get_current_user
from app.services.agents.priority_agent import PriorityAgent
from app.services.backboard.backboard_service import (
    BackboardService,
    BackboardServiceError,
)

logger = logging.getLogger(__name__)
router = APIRouter()


# Request/Response schemas
class MessageCreate(BaseModel):
    question: str


class MessageResponse(BaseModel):
    role: str
    content: str
    timestamp: str


class ThreadResponse(BaseModel):
    thread_id: str
    thread_type: str
    created_at: str
    last_message_at: Optional[str] = None


class FollowupResponse(BaseModel):
    response: str
    thread_id: str


@router.get("", response_model=List[ThreadResponse])
async def list_threads(
    thread_type: Optional[str] = None,
    current_user: User = Depends(get_current_user),
):
    """List all threads for the current user."""
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
        
        # List threads
        threads = backboard.list_threads(
            user_id=current_user.id,
            thread_type=thread_type
        )
        
        logger.info(f"Retrieved {len(threads)} threads for user {current_user.id}")
        
        return threads
        
    except BackboardServiceError as e:
        logger.error(f"Failed to list threads: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to list threads: {str(e)}"
        )


@router.get("/{thread_id}", response_model=List[MessageResponse])
async def get_thread_history(
    thread_id: str = Path(..., description="Thread ID"),
    limit: Optional[int] = None,
    current_user: User = Depends(get_current_user),
):
    """Get conversation history for a specific thread."""
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
        
        # Get thread history
        history = backboard.get_thread_history(thread_id, limit=limit)
        
        logger.info(f"Retrieved {len(history)} messages for thread {thread_id}")
        
        return history
        
    except BackboardServiceError as e:
        logger.error(f"Failed to get thread history: {e}")
        raise HTTPException(
            status_code=404 if "not found" in str(e).lower() else 500,
            detail=f"Failed to get thread history: {str(e)}"
        )


@router.post("/{thread_id}/messages", response_model=FollowupResponse)
async def ask_followup_question(
    thread_id: str = Path(..., description="Thread ID"),
    message: MessageCreate = ...,
    current_user: User = Depends(get_current_user),
):
    """Ask a follow-up question on an existing thread."""
    if not settings.USE_BACKBOARD:
        raise HTTPException(
            status_code=503,
            detail="Backboard service is not enabled"
        )
    
    try:
        # Initialize Priority Agent
        agent = PriorityAgent(tools=[])
        
        # Answer follow-up question
        response = agent.answer_followup(
            thread_id=thread_id,
            question=message.question
        )
        
        logger.info(f"Answered follow-up question for thread {thread_id}")
        
        return {
            "response": response,
            "thread_id": thread_id
        }
        
    except ValueError as e:
        logger.error(f"Failed to answer follow-up: {e}")
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Unexpected error answering follow-up: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to answer follow-up question: {str(e)}"
        )
