from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.api import api_router
from app.core.config import settings, validate_auth0_config

# Validate Auth0 config at startup (raises RuntimeError if vars are missing in non-dev)
validate_auth0_config()

app = FastAPI(
    title="Londoolink AI Backend",
    description="An intelligent agent that securely tracks and links your digital life, ensuring you never miss what truly matters.",
    version="0.1.0",
    openapi_url="/api/v1/openapi.json",
)

# Set up CORS middleware for frontend connection
# Get allowed origins from environment variable for production
import os

allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173,https://londoolink-ai.vercel.app,http://londoolink-ai.vercel.app").split(",")

# Add development origins if not in production
if settings.ENVIRONMENT != "production":
    allowed_origins.extend(
        [
            "http://localhost:3000", 
            "http://127.0.0.1:3000", 
            "https://localhost:3000",
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:5174",
            "http://127.0.0.1:5174",
        ]
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://londoolink-ai.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Request logging middleware for debugging
from fastapi import Request
import time
import logging

logger = logging.getLogger("app")
logging.basicConfig(level=logging.INFO)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    origin = request.headers.get("origin")
    path = request.url.path
    method = request.method
    
    logger.info(f"Incoming {method} {path} from origin: {origin}")
    
    try:
        response = await call_next(request)
        process_time = (time.time() - start_time) * 1000
        logger.info(f"Completed {method} {path} - Status: {response.status_code} - {process_time:.2f}ms")
        return response
    except Exception as e:
        process_time = (time.time() - start_time) * 1000
        logger.error(f"Failed {method} {path} - Error: {str(e)} - {process_time:.2f}ms")
        raise e

from fastapi.staticfiles import StaticFiles

# Include API router
app.include_router(api_router, prefix="/api/v1")

# Mount static files
import os
os.makedirs("static", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/")
async def root():
    return {"message": "Londoolink AI Backend is running!", "version": "0.1.0"}

# Vercel handler
handler = app
