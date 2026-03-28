"""
StepUpService — process-local step-up authentication for high-stakes agent actions.

Storage is intentionally in-process (dict). For multi-process production deployments,
swap _pending_challenges and _issued_tokens to a Redis-backed store.
"""

import asyncio
import functools
import inspect
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional, Tuple

import pyotp

from app.db.base import SessionLocal
from app.models.user import User
from app.security.password import verify_password
from app.services.token_vault.exceptions import StepUpRequiredError


class InvalidCredentialError(Exception):
    """Raised when the supplied TOTP code or password is incorrect."""


# ---------------------------------------------------------------------------
# Process-local storage
# ---------------------------------------------------------------------------

# {user_id: {challenge_id: issued_at}}
_pending_challenges: Dict[int, Dict[str, datetime]] = {}

# {user_id: {step_up_token: (issued_at, consumed)}}
_issued_tokens: Dict[int, Dict[str, Tuple[datetime, bool]]] = {}

_CHALLENGE_TTL = timedelta(minutes=5)
_TOKEN_TTL = timedelta(minutes=5)


# ---------------------------------------------------------------------------
# StepUpService
# ---------------------------------------------------------------------------


class StepUpService:
    """Manages step-up authentication challenges and tokens."""

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    async def require_step_up(self, user_id: int) -> str:
        """
        Issue a new challenge for *user_id*.

        Returns a ``challenge_id`` (UUID string) that the frontend must
        present back via ``verify_challenge``.
        """
        challenge_id = str(uuid.uuid4())
        now = datetime.now(tz=timezone.utc)

        if user_id not in _pending_challenges:
            _pending_challenges[user_id] = {}

        # Purge expired challenges for this user before adding a new one
        _pending_challenges[user_id] = {
            cid: ts
            for cid, ts in _pending_challenges[user_id].items()
            if now - ts < _CHALLENGE_TTL
        }

        _pending_challenges[user_id][challenge_id] = now
        return challenge_id

    async def verify_challenge(
        self,
        user_id: int,
        challenge_id: str,
        credential: str,
    ) -> str:
        """
        Verify *credential* against the pending challenge.

        - If ``user.two_factor_enabled`` is True  → validate TOTP via ``pyotp``
        - If ``user.two_factor_enabled`` is False → validate password via ``passlib``

        Returns a ``step_up_token`` (UUID string) valid for 5 minutes, single-use.
        Raises ``InvalidCredentialError`` on bad credential.
        Raises ``ValueError`` if the challenge_id is unknown or expired.
        """
        now = datetime.now(tz=timezone.utc)

        # Validate challenge exists and is not expired
        user_challenges = _pending_challenges.get(user_id, {})
        issued_at = user_challenges.get(challenge_id)
        if issued_at is None or now - issued_at >= _CHALLENGE_TTL:
            raise ValueError(f"Unknown or expired challenge_id: {challenge_id}")

        # Load user from DB
        user = self._get_user(user_id)

        # Validate credential
        if user.two_factor_enabled:
            self._verify_totp(user, credential)
        else:
            self._verify_password(user, credential)

        # Challenge consumed — remove it
        del _pending_challenges[user_id][challenge_id]

        # Issue step-up token
        step_up_token = str(uuid.uuid4())
        if user_id not in _issued_tokens:
            _issued_tokens[user_id] = {}
        _issued_tokens[user_id][step_up_token] = (now, False)

        return step_up_token

    async def consume_token(self, user_id: int, step_up_token: str) -> bool:
        """
        Validate and invalidate *step_up_token* for *user_id*.

        Returns ``True`` if the token was valid and has now been consumed.
        Returns ``False`` if the token is expired, already used, or unknown.
        """
        now = datetime.now(tz=timezone.utc)
        user_tokens = _issued_tokens.get(user_id, {})
        entry = user_tokens.get(step_up_token)

        if entry is None:
            return False

        issued_at, consumed = entry
        if consumed or now - issued_at >= _TOKEN_TTL:
            return False

        # Mark as consumed (single-use)
        _issued_tokens[user_id][step_up_token] = (issued_at, True)
        return True

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _get_user(self, user_id: int) -> User:
        db = SessionLocal()
        try:
            user = db.query(User).filter(User.id == user_id).first()
            if user is None:
                raise ValueError(f"User {user_id} not found")
            return user
        finally:
            db.close()

    def _verify_totp(self, user: User, code: str) -> None:
        if not user.two_factor_secret:
            raise InvalidCredentialError("User has no TOTP secret configured")
        totp = pyotp.TOTP(user.two_factor_secret)
        if not totp.verify(code):
            raise InvalidCredentialError("Invalid TOTP code")

    def _verify_password(self, user: User, plain_password: str) -> None:
        if not user.hashed_password:
            raise InvalidCredentialError("User has no password configured")
        if not verify_password(plain_password, user.hashed_password):
            raise InvalidCredentialError("Invalid password")


# ---------------------------------------------------------------------------
# Module-level singleton
# ---------------------------------------------------------------------------

_step_up_service = StepUpService()


# ---------------------------------------------------------------------------
# @requires_step_up decorator
# ---------------------------------------------------------------------------


def requires_step_up(func: Any) -> Any:
    """
    Decorator that enforces step-up authentication before a high-stakes action.

    Reads ``step_up_token`` from the agent state (first positional arg or kwarg
    named ``state``).  Calls ``StepUpService.consume_token()``.  Raises
    ``StepUpRequiredError`` if the token is absent, expired, or already used.

    Works on both sync and async functions.
    """

    def _extract_state(args: tuple, kwargs: dict) -> Optional[Dict[str, Any]]:
        """Return the state dict from args/kwargs, or None."""
        if args:
            first = args[0]
            if isinstance(first, dict):
                return first
        return kwargs.get("state")

    def _get_user_id(state: Dict[str, Any]) -> Optional[int]:
        return state.get("user_id")

    def _get_step_up_token(state: Dict[str, Any]) -> Optional[str]:
        return state.get("step_up_token")

    async def _check(args: tuple, kwargs: dict) -> None:
        state = _extract_state(args, kwargs)
        if state is None:
            raise StepUpRequiredError("No agent state found; step-up token required")

        token = _get_step_up_token(state)
        if not token:
            raise StepUpRequiredError("step_up_token is absent from agent state")

        user_id = _get_user_id(state)
        if user_id is None:
            raise StepUpRequiredError("user_id is absent from agent state")

        valid = await _step_up_service.consume_token(user_id, token)
        if not valid:
            raise StepUpRequiredError("step_up_token is expired or already used")

    if inspect.iscoroutinefunction(func):

        @functools.wraps(func)
        async def async_wrapper(*args: Any, **kwargs: Any) -> Any:
            await _check(args, kwargs)
            return await func(*args, **kwargs)

        return async_wrapper

    else:

        @functools.wraps(func)
        def sync_wrapper(*args: Any, **kwargs: Any) -> Any:
            # Run the async check in a new event loop if none is running,
            # otherwise schedule it on the running loop.
            try:
                loop = asyncio.get_running_loop()
            except RuntimeError:
                loop = None

            if loop and loop.is_running():
                # We're inside an async context — use asyncio.run_coroutine_threadsafe
                # or simply create a task. For simplicity we use a nested approach.
                import concurrent.futures

                future = asyncio.run_coroutine_threadsafe(_check(args, kwargs), loop)
                future.result()
            else:
                asyncio.run(_check(args, kwargs))

            return func(*args, **kwargs)

        return sync_wrapper
