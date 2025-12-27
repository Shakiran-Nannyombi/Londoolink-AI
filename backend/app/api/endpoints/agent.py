import logging
import gc
from typing import Any, Dict, Optional, Literal

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse

from app.models.user import User
from app.schemas.user import User as UserSchema
from app.security.jwt import get_current_user
from app.services.langgraph.coordinator import LangGraphCoordinator, MemoryManager
from app.services.rag import rag_pipeline

# Initialize coordinator as None, will be lazy loaded
_langgraph_coordinator = None

def get_langgraph_coordinator(model_size: str = 'small'):
    """Lazy load the LangGraph coordinator with specified model size.
    
    Args:
        model_size: One of 'small', 'medium', or 'large'
    """
    global _langgraph_coordinator
    if _langgraph_coordinator is None or _langgraph_coordinator.model_size != model_size:
        if _langgraph_coordinator is not None:
            _langgraph_coordinator.cleanup()
        _langgraph_coordinator = LangGraphCoordinator(model_size=model_size)
    return _langgraph_coordinator

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/health")
async def health_check() -> Dict[str, str]:
    # Health check endpoint to verify the service is running
    return {"status": "ok", "service": "Londoolink AI Agent"}


@router.get("/briefing/daily")
async def get_daily_briefing(
    model_size: Literal['small', 'medium', 'large'] = 'small',
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """Get AI-powered daily briefing from multi-agent system with memory management
    
    Args:
        model_size: Model size to use ('small', 'medium', or 'large')
        current_user: Authenticated user
        
    Returns:
        Dict containing the briefing and memory usage information
    """
    coordinator = None
    try:
        # Check memory before proceeding
        current_memory = MemoryManager.get_memory_usage()
        if current_memory > 400:  # MB
            logger.warning(f"Memory usage high before processing request: {current_memory:.2f}MB")
            # If memory is very high, force small model
            if current_memory > 450:
                model_size = 'small'
                logger.warning(f"Forcing small model due to high memory usage")
            MemoryManager.free_memory()
        
        logger.info(f"Generating daily briefing for user {current_user.id} using {model_size} model")
        
        # Get coordinator instance with specified model size
        coordinator = get_langgraph_coordinator(model_size=model_size)
        
        try:
            # Generate briefing using LangGraph coordinator
            briefing = coordinator.get_daily_briefing(current_user.id)
            
            response = {
                "message": f"Daily briefing for {current_user.email} ({model_size} model)",
                "user_id": current_user.id,
                "briefing": briefing,
                "status": "success",
                "model_size": model_size,
                "memory_usage_mb": round(MemoryManager.get_memory_usage(), 2),
                "model_config": {
                    "max_tokens": coordinator.MODEL_CONFIGS[model_size]['max_tokens'],
                    "temperature": coordinator.MODEL_CONFIGS[model_size]['temperature']
                }
            }
            return response
            
        finally:
            # Clean up resources after use
            if coordinator:
                coordinator.cleanup()

    except Exception as e:
        error_msg = f"Failed to generate daily briefing for user {current_user.id}: {e}"
        logger.error(error_msg, exc_info=True)
        
        # Clean up if coordinator was initialized
        if coordinator:
            try:
                coordinator.cleanup()
            except Exception as cleanup_error:
                logger.error(f"Error during cleanup: {cleanup_error}")
        
        # Force garbage collection
        MemoryManager.free_memory()
        
        # Return error response with memory info
        return JSONResponse(
            status_code=500,
            content={
                "detail": "Failed to generate daily briefing",
                "error": str(e),
                "memory_usage_mb": round(MemoryManager.get_memory_usage(), 2)
            }
        )


@router.get("/users/me", response_model=UserSchema)
async def get_current_user_info(
    current_user: User = Depends(get_current_user),
) -> UserSchema:
    # Get current user information
    return UserSchema.from_orm(current_user)


@router.get("/rag/stats")
async def get_rag_stats(
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    # Get RAG pipeline statistics
    try:
        stats = rag_pipeline.get_collection_stats()
        return {"user_id": current_user.id, "rag_stats": stats, "status": "success"}
    except Exception as e:
        logger.error(f"Failed to get RAG stats: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to get RAG statistics: {str(e)}"
        )


@router.post("/rag/search")
async def semantic_search(
    query_data: Dict[str, Any], current_user: User = Depends(get_current_user)
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
            "status": "success",
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Semantic search failed for user {current_user.id}: {e}")
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")


@router.post("/analyze/document")
async def analyze_document(
    document_data: Dict[str, Any], current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    # Analyze a document using AI agents
    try:
        content = document_data.get("content", "")
        document_type = document_data.get("type", "general")

        if not content:
            raise HTTPException(status_code=400, detail="Document content is required")

        logger.info(
            f"Analyzing document for user {current_user.id}, type: {document_type}"
        )

        analysis = langgraph_coordinator.analyze_document(content, document_type)

        return {
            "user_id": current_user.id,
            "document_type": document_type,
            "analysis": analysis,
            "status": "success",
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Document analysis failed for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=500, detail=f"Document analysis failed: {str(e)}"
        )


@router.post("/chat")
async def chat_with_agent(
    chat_data: Dict[str, Any],
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    # Chat with a specific agent
    try:
        agent_type = chat_data.get("agent_type", "email")
        message = chat_data.get("message", "")

        if not message:
            raise HTTPException(status_code=400, detail="Message is required")

        logger.info(f"Chat request for user {current_user.id}, agent: {agent_type}, message: {message[:50]}...")

        # Route to appropriate agent based on type
        if agent_type == "email":
            response = langgraph_coordinator.chat_with_email_agent(current_user.id, message)
        elif agent_type == "calendar":
            response = langgraph_coordinator.chat_with_calendar_agent(current_user.id, message)
        elif agent_type == "priority":
            response = langgraph_coordinator.chat_with_priority_agent(current_user.id, message)
        elif agent_type == "social":
            response = langgraph_coordinator.chat_with_social_agent(current_user.id, message)
        else:
            # Default to general chat
            response = langgraph_coordinator.general_chat(current_user.id, message)

        return {
            "user_id": current_user.id,
            "agent_type": agent_type,
            "message": response,
            "status": "success"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Agent chat failed for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Agent chat failed: {str(e)}"
        )
