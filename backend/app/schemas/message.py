from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel


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


class SocialMessage(BaseModel):
    content: str
    platform: str  # "instagram", "whatsapp", "telegram", "twitter", etc.
    sender: str
    recipient: Optional[str] = None
    chat_name: Optional[str] = None  # Group chat name or conversation title
    message_type: str = "text"  # "text", "image", "video", "voice", "document"
    timestamp: datetime
    is_group_chat: bool = False
    participants: Optional[list[str]] = None  # For group chats
    reply_to_message_id: Optional[str] = None  # If replying to another message
    message_id: Optional[str] = None
    urgency_level: Optional[str] = None  # "urgent", "important", "normal", "low"
    contains_media: bool = False
    metadata: Optional[Dict[str, Any]] = None


class WhatsAppMessage(SocialMessage):
    platform: str = "whatsapp"
    phone_number: Optional[str] = None
    contact_name: Optional[str] = None


class InstagramMessage(SocialMessage):
    platform: str = "instagram"
    username: str
    is_story_reply: bool = False
    is_direct_message: bool = True


class TelegramMessage(SocialMessage):
    platform: str = "telegram"
    username: Optional[str] = None
    chat_id: Optional[str] = None
    is_channel: bool = False
    is_bot_message: bool = False
