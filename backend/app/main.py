from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.api import api_router
from app.core.config import settings

app = FastAPI(
    title="Londoolink AI Backend",
    description="An intelligent agent that securely tracks and links your digital life, ensuring you never miss what truly matters.",
    version="0.1.0",
    openapi_url="/api/v1/openapi.json",
)

# Set up CORS middleware for frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js frontend development
        "http://127.0.0.1:3000",  # Alternative localhost
        "https://localhost:3000", # HTTPS version
        "*"  # Allow all for development - configure properly for production
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix="/api/v1")


@app.get("/")
async def root():
    return {"message": "Londoolink AI Backend is running!", "version": "0.1.0"}
