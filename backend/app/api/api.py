from fastapi import APIRouter

from app.api.endpoints import agent, auth, ingest, security

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(agent.router, prefix="/agent", tags=["agent"])
api_router.include_router(ingest.router, prefix="/ingest", tags=["ingestion"])
api_router.include_router(security.router, prefix="/security", tags=["security"])
