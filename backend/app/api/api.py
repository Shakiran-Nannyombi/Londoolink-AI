from fastapi import APIRouter

from app.api.endpoints import agent, auth, ingest, security, profile, settings, consent, integrations, two_factor

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(agent.router, prefix="/agent", tags=["agent"])
api_router.include_router(ingest.router, prefix="/ingest", tags=["ingestion"])
api_router.include_router(security.router, prefix="/security", tags=["security"])
api_router.include_router(profile.router, prefix="/profile", tags=["profile"])
api_router.include_router(settings.router, prefix="/settings", tags=["settings"])
api_router.include_router(consent.router, prefix="/consent", tags=["consent"])
api_router.include_router(integrations.router, prefix="/integrations", tags=["integrations"])
api_router.include_router(two_factor.router, prefix="/2fa", tags=["two-factor-auth"])
