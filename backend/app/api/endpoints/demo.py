"""Demo login endpoint — seeds a demo user with rich sample data."""
import json
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.models.connected_service import ConnectedService
from app.schemas.token import Token
from app.security.jwt import create_access_token
from app.core.config import settings

router = APIRouter()

DEMO_EMAIL = "demodev708@gmail.com"
DEMO_NAME = "Alex Demo"
DEMO_PHONE = "+256700000000"
DEMO_AVATAR = "https://api.dicebear.com/7.x/avataaars/svg?seed=londoolink-demo"


def _seed_demo_briefing():
    """Return rich demo briefing data."""
    now = datetime.now(timezone.utc)
    return {
        "user_id": 0,
        "generated_at": now.isoformat(),
        "email_insights": {
            "summary": "You have 3 unread emails requiring action. Sarah from the design team sent the final mockups for review. The client meeting confirmation from TechCorp is pending your response by EOD.",
            "analysis": "High priority: Client meeting confirmation needs response. Medium: Design review requested. Low: Newsletter digest.",
            "key_sender": "sarah@designteam.com",
            "categories": ["client", "design", "meetings"],
            "action_items": ["Reply to TechCorp meeting confirmation", "Review design mockups", "Schedule follow-up with Sarah"],
        },
        "calendar_insights": {
            "summary": "You have 2 meetings today. Product standup at 10am and client demo at 3pm. Tomorrow's sprint planning needs preparation.",
            "analysis": "Today is busy with back-to-back meetings in the afternoon. Block time for demo prep.",
            "categories": ["meetings", "planning"],
            "upcoming_events": ["10:00 AM - Product Standup", "3:00 PM - TechCorp Client Demo", "Tomorrow 9:00 AM - Sprint Planning"],
            "action_items": ["Prepare demo slides", "Review sprint backlog before tomorrow"],
        },
        "social_insights": {
            "summary": "Your LinkedIn post about AI agents got 47 reactions. 3 connection requests from potential collaborators.",
            "analysis": "Good engagement on recent content. New connections worth reviewing.",
            "platforms": ["linkedin"],
            "action_items": ["Accept connection requests", "Respond to comments on AI post"],
        },
        "priority_recommendations": {
            "summary": "URGENT: TechCorp client demo at 3pm today requires slide preparation. Reply to meeting confirmation email immediately.",
            "analysis": "Top priority is the client demo preparation. Email response is time-sensitive.",
            "top_priorities": [
                "Reply to TechCorp meeting confirmation (deadline: EOD)",
                "Prepare client demo slides (demo at 3pm)",
                "Review design mockups from Sarah",
            ],
        },
        "summary": "Busy day ahead with a critical client demo at 3pm. 3 urgent emails need responses. Stay focused on demo prep.",
        "workflow_status": "completed",
        "agent_framework": "langgraph",
    }


@router.post("/demo-login", response_model=Token)
async def demo_login(db: Session = Depends(get_db)):
    """Log in as the demo user, seeding rich sample data."""
    # Upsert demo user
    user = db.query(User).filter(User.email == DEMO_EMAIL).first()
    if not user:
        user = User(
            email=DEMO_EMAIL,
            full_name=DEMO_NAME,
            hashed_password=None,
            is_active=True,
            phone_number=DEMO_PHONE,
            profile_picture_url=DEMO_AVATAR,
            timezone="Africa/Kampala",
            language_preference="en",
            auth0_sub=f"demo|{DEMO_EMAIL}",
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # Update profile picture if missing
        if not user.profile_picture_url:
            user.profile_picture_url = DEMO_AVATAR
            user.full_name = DEMO_NAME
            db.commit()
        db.refresh(user)

    # Seed connected services
    for service_type, scopes in [
        ("google", ["https://www.googleapis.com/auth/gmail.readonly", "https://www.googleapis.com/auth/calendar.readonly"]),
        ("notion", ["read_content", "update_content"]),
    ]:
        existing = db.query(ConnectedService).filter(
            ConnectedService.user_id == user.id,
            ConnectedService.service_type == service_type,
        ).first()
        if not existing:
            db.add(ConnectedService(
                user_id=user.id,
                service_type=service_type,
                service_identifier=f"demo-{service_type}",
                vault_backed=True,
                auth0_sub=user.auth0_sub,
                granted_scopes=json.dumps(scopes),
                is_active=True,
            ))
    db.commit()

    token = create_access_token(
        data={"sub": user.email},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return {"access_token": token, "token_type": "bearer"}


@router.get("/demo-briefing")
async def demo_briefing():
    """Return rich demo briefing data without requiring auth."""
    return _seed_demo_briefing()
