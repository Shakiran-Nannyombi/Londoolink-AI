"""Backboard.io integration service."""

from .backboard_service import (
    BackboardService,
    BackboardError,
    BackboardServiceError,
    BackboardAPIError,
    BackboardAuthError,
    BackboardNotFoundError,
    BackboardRateLimitError,
    BackboardServiceUnavailableError,
)

__all__ = [
    "BackboardService",
    "BackboardError",
    "BackboardServiceError",
    "BackboardAPIError",
    "BackboardAuthError",
    "BackboardNotFoundError",
    "BackboardRateLimitError",
    "BackboardServiceUnavailableError",
]
