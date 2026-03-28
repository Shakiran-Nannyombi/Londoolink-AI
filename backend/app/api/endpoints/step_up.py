"""
Step-up authentication API endpoints.

POST /api/v1/step-up/challenge  — issue a new challenge for the current user
POST /api/v1/step-up/verify     — verify a challenge and return a step-up token
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.models.user import User
from app.security.jwt import get_current_user
from app.services.step_up import InvalidCredentialError, StepUpService

router = APIRouter()

_step_up_service = StepUpService()


# ---------------------------------------------------------------------------
# Request / Response schemas
# ---------------------------------------------------------------------------


class ChallengeResponse(BaseModel):
    challenge_id: str


class VerifyRequest(BaseModel):
    challenge_id: str
    credential: str


class VerifyResponse(BaseModel):
    step_up_token: str


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------


@router.post("/challenge", response_model=ChallengeResponse)
async def create_challenge(
    current_user: User = Depends(get_current_user),
) -> ChallengeResponse:
    """Issue a step-up challenge for the authenticated user."""
    challenge_id = await _step_up_service.require_step_up(current_user.id)
    return ChallengeResponse(challenge_id=challenge_id)


@router.post("/verify", response_model=VerifyResponse)
async def verify_challenge(
    body: VerifyRequest,
    current_user: User = Depends(get_current_user),
) -> VerifyResponse:
    """
    Verify a step-up challenge.

    Returns a single-use step-up token valid for 5 minutes.
    Returns 401 if the credential (TOTP code or password) is incorrect.
    """
    try:
        step_up_token = await _step_up_service.verify_challenge(
            user_id=current_user.id,
            challenge_id=body.challenge_id,
            credential=body.credential,
        )
    except InvalidCredentialError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
        ) from exc
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc

    return VerifyResponse(step_up_token=step_up_token)
