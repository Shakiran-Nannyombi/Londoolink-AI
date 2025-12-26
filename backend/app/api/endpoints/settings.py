from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import json

from app.db.session import get_db
from app.models.user import User
from app.schemas.profile import SettingsUpdate, SettingsResponse
from app.security.jwt import get_current_user

router = APIRouter()


@router.get("", response_model=SettingsResponse)
async def get_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current user's settings.
    """
    # Parse notification preferences if stored as JSON string
    notification_prefs = current_user.notification_preferences
    if isinstance(notification_prefs, str):
        try:
            notification_prefs = json.loads(notification_prefs)
        except:
            notification_prefs = {}
    
    return SettingsResponse(
        timezone=current_user.timezone or "UTC",
        language_preference=current_user.language_preference or "en",
        notification_preferences=notification_prefs
    )


@router.put("", response_model=SettingsResponse)
async def update_settings(
    settings_data: SettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update current user's settings.
    """
    try:
        # Update timezone
        if settings_data.timezone is not None:
            current_user.timezone = settings_data.timezone
        
        # Update language preference
        if settings_data.language_preference is not None:
            current_user.language_preference = settings_data.language_preference
        
        # Update notification preferences
        if settings_data.notification_preferences is not None:
            # Store as JSON string
            current_user.notification_preferences = json.dumps(settings_data.notification_preferences)
        
        db.commit()
        db.refresh(current_user)
        
        # Parse notification preferences for response
        notification_prefs = current_user.notification_preferences
        if isinstance(notification_prefs, str):
            try:
                notification_prefs = json.loads(notification_prefs)
            except:
                notification_prefs = {}
        
        return SettingsResponse(
            timezone=current_user.timezone or "UTC",
            language_preference=current_user.language_preference or "en",
            notification_preferences=notification_prefs
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update settings: {str(e)}"
        )
