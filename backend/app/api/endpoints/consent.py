from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.db.session import get_db
from app.models.user import User
from app.models.consent import UserConsent
from app.schemas.profile import ConsentCreate, ConsentResponse, ConsentRevoke
from app.security.jwt import get_current_user

router = APIRouter()


@router.get("", response_model=List[ConsentResponse])
async def get_consents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all consents for the current user.
    """
    consents = db.query(UserConsent).filter(
        UserConsent.user_id == current_user.id
    ).all()
    
    return consents


@router.post("", response_model=ConsentResponse)
async def grant_consent(
    consent_data: ConsentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Grant consent for a specific service.
    """
    # Check if consent already exists
    existing_consent = db.query(UserConsent).filter(
        UserConsent.user_id == current_user.id,
        UserConsent.service_type == consent_data.service_type
    ).first()
    
    if existing_consent:
        # Update existing consent
        existing_consent.consent_given = consent_data.consent_given
        existing_consent.consent_date = datetime.utcnow()
        existing_consent.revoked_date = None if consent_data.consent_given else datetime.utcnow()
        
        try:
            db.commit()
            db.refresh(existing_consent)
            return existing_consent
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update consent: {str(e)}"
            )
    else:
        # Create new consent
        new_consent = UserConsent(
            user_id=current_user.id,
            service_type=consent_data.service_type,
            consent_given=consent_data.consent_given,
            consent_date=datetime.utcnow()
        )
        
        try:
            db.add(new_consent)
            db.commit()
            db.refresh(new_consent)
            return new_consent
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create consent: {str(e)}"
            )


@router.delete("/{service_type}")
async def revoke_consent(
    service_type: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Revoke consent for a specific service.
    """
    consent = db.query(UserConsent).filter(
        UserConsent.user_id == current_user.id,
        UserConsent.service_type == service_type
    ).first()
    
    if not consent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No consent found for service: {service_type}"
        )
    
    try:
        consent.consent_given = False
        consent.revoked_date = datetime.utcnow()
        db.commit()
        return {"message": f"Consent revoked for {service_type}"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to revoke consent: {str(e)}"
        )
