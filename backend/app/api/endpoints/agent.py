from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any
import logging

from app.models.user import User
from app.schemas.user import User as UserSchema
from app.security.jwt import get_current_user
from app.services.coordinator import ai_coordinator
from app.services.rag import rag_pipeline

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/health")
async def health_check() -> Dict[str, str]:
    # Health check endpoint to verify the service is running
    return {"status": "ok", "service": "Londoolink AI Agent"}


@router.get("/briefing/daily")
async def get_daily_briefing(current_user: User = Depends(get_current_user)) -> Dict[str, Any]:
    # Get AI-powered daily briefing from multi-agent system
    try:
        logger.info(f"Generating daily briefing for user {current_user.id}")
        
        # Generate briefing using AI coordinator
        briefing = ai_coordinator.get_daily_briefing(current_user.id)
        
        return {
            "message": f"Daily briefing for {current_user.email}",
            "user_id": current_user.id,
            "briefing": briefing,
            "status": "success"
        }
        
    except Exception as e:
        logger.error(f"Failed to generate daily briefing for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate daily briefing: {str(e)}"
        )


@router.get("/users/me", response_model=UserSchema)
async def get_current_user_info(current_user: User = Depends(get_current_user)) -> UserSchema:
    # Get current user information
    return UserSchema.from_orm(current_user)


@router.get("/rag/stats")
async def get_rag_stats(current_user: User = Depends(get_current_user)) -> Dict[str, Any]:
    # Get RAG pipeline statistics
    try:
        stats = rag_pipeline.get_collection_stats()
        return {
            "user_id": current_user.id,
            "rag_stats": stats,
            "status": "success"
        }
    except Exception as e:
        logger.error(f"Failed to get RAG stats: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get RAG statistics: {str(e)}"
        )


@router.post("/rag/search")
async def semantic_search(
    query_data: Dict[str, Any],
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    # Perform semantic search on user's documents
    try:
        query = query_data.get("query", "")
        n_results = query_data.get("n_results", 5)
        
        if not query:
            raise HTTPException(status_code=400, detail="Query is required")
        
        logger.info(f"Performing semantic search for user {current_user.id}: {query}")
        
        results = rag_pipeline.query_texts(query, n_results=n_results)
        
        return {
            "user_id": current_user.id,
            "query": query,
            "results": results,
            "count": len(results),
            "status": "success"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Semantic search failed for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Search failed: {str(e)}"
        )


@router.post("/analyze/document")
async def analyze_document(
    document_data: Dict[str, Any],
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    # Analyze a document using AI agents
    try:
        content = document_data.get("content", "")
        document_type = document_data.get("type", "general")
        
        if not content:
            raise HTTPException(status_code=400, detail="Document content is required")
        
        logger.info(f"Analyzing document for user {current_user.id}, type: {document_type}")
        
        analysis = ai_coordinator.analyze_document(content, document_type)
        
        return {
            "user_id": current_user.id,
            "document_type": document_type,
            "analysis": analysis,
            "status": "success"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Document analysis failed for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Document analysis failed: {str(e)}"
        )
