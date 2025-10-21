from pydantic import BaseModel
from typing import Dict, Any, Optional
from datetime import datetime


class EmailMessage(BaseModel):
    sender: str
    recipient: str
    subject: str
    body: str
    timestamp: datetime
    message_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class CalendarEvent(BaseModel):
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    location: Optional[str] = None
    attendees: Optional[list[str]] = None
    event_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class GenericMessage(BaseModel):
    content: str
    source: str  # e.g., "email", "calendar", "slack"
    timestamp: datetime
    metadata: Optional[Dict[str, Any]] = None
