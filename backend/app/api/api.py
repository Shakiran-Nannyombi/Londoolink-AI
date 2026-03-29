from fastapi import APIRouter

from app.api.endpoints import agent, audit, auth, demo, health, ingest, security, profile, settings, consent, integrations, two_factor, step_up

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(demo.router, prefix="/auth", tags=["demo"])
api_router.include_router(agent.router, prefix="/agent", tags=["agent"])
api_router.include_router(ingest.router, prefix="/ingest", tags=["ingestion"])
api_router.include_router(security.router, prefix="/security", tags=["security"])
api_router.include_router(profile.router, prefix="/profile", tags=["profile"])
api_router.include_router(settings.router, prefix="/settings", tags=["settings"])
api_router.include_router(consent.router, prefix="/consent", tags=["consent"])
api_router.include_router(integrations.router, prefix="/integrations", tags=["integrations"])
api_router.include_router(two_factor.router, prefix="/2fa", tags=["two-factor-auth"])
api_router.include_router(step_up.router, prefix="/step-up", tags=["step-up-auth"])
api_router.include_router(audit.router, prefix="/audit", tags=["audit"])
api_router.include_router(health.router, prefix="/health", tags=["health"])
