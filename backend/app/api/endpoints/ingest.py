import logging
from datetime import datetime
from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException

from app.models.user import User
from app.schemas.message import (
    CalendarEvent,
    EmailMessage,
    GenericMessage,
    InstagramMessage,
    SocialMessage,
    TelegramMessage,
    WhatsAppMessage,
)
from app.security.jwt import get_current_user
from app.services.rag import rag_pipeline

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/email")
async def ingest_email(
    email_data: EmailMessage, current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """Ingest email data from n8n workflows."""
    try:
        logger.info(f"Ingesting email for user {current_user.id}: {email_data.subject}")

        # Format email content for RAG storage
        email_content = f"""
Subject: {email_data.subject}
From: {email_data.sender}
To: {email_data.recipient}
Date: {email_data.timestamp}

{email_data.body}
        """.strip()

        # Prepare metadata
        metadata = {
            "source": "email",
            "user_id": current_user.id,
            "sender": email_data.sender,
            "recipient": email_data.recipient,
            "subject": email_data.subject,
            "timestamp": email_data.timestamp.isoformat(),
            "message_id": email_data.message_id,
            **(email_data.metadata or {}),
        }

        # Add to RAG pipeline
        document_ids = rag_pipeline.add_text(email_content, metadata)

        return {
            "message": "Email ingested successfully",
            "user_id": current_user.id,
            "document_ids": document_ids,
            "email_subject": email_data.subject,
            "status": "success",
        }

    except Exception as e:
        logger.error(f"Email ingestion failed for user {current_user.id}: {e}")
        raise HTTPException(status_code=500, detail=f"Email ingestion failed: {str(e)}")


@router.post("/calendar")
async def ingest_calendar(
    calendar_data: CalendarEvent, current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """Ingest calendar data from n8n workflows."""
    try:
        logger.info(
            f"Ingesting calendar event for user {current_user.id}: {calendar_data.title}"
        )

        # Format calendar content for RAG storage
        calendar_content = f"""
Event: {calendar_data.title}
Description: {calendar_data.description or 'No description'}
Start: {calendar_data.start_time}
End: {calendar_data.end_time}
Location: {calendar_data.location or 'No location specified'}
Attendees: {', '.join(calendar_data.attendees or [])}
        """.strip()

        # Prepare metadata
        metadata = {
            "source": "calendar",
            "user_id": current_user.id,
            "title": calendar_data.title,
            "start_time": calendar_data.start_time.isoformat(),
            "end_time": calendar_data.end_time.isoformat(),
            "location": calendar_data.location,
            "attendees": calendar_data.attendees or [],
            "event_id": calendar_data.event_id,
            "timestamp": calendar_data.start_time.isoformat(),
            **(calendar_data.metadata or {}),
        }

        # Add to RAG pipeline
        document_ids = rag_pipeline.add_text(calendar_content, metadata)

        return {
            "message": "Calendar event ingested successfully",
            "user_id": current_user.id,
            "document_ids": document_ids,
            "event_title": calendar_data.title,
            "status": "success",
        }

    except Exception as e:
        logger.error(f"Calendar ingestion failed for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=500, detail=f"Calendar ingestion failed: {str(e)}"
        )


@router.post("/generic")
async def ingest_generic_message(
    message_data: GenericMessage, current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """Ingest generic message/document data."""
    try:
        logger.info(
            f"Ingesting generic message for user {current_user.id} from {message_data.source}"
        )

        # Prepare metadata
        metadata = {
            "source": message_data.source,
            "user_id": current_user.id,
            "timestamp": message_data.timestamp.isoformat(),
            **(message_data.metadata or {}),
        }

        # Add to RAG pipeline
        document_ids = rag_pipeline.add_text(message_data.content, metadata)

        return {
            "message": "Generic message ingested successfully",
            "user_id": current_user.id,
            "document_ids": document_ids,
            "source": message_data.source,
            "status": "success",
        }

    except Exception as e:
        logger.error(
            f"Generic message ingestion failed for user {current_user.id}: {e}"
        )
        raise HTTPException(
            status_code=500, detail=f"Generic message ingestion failed: {str(e)}"
        )


@router.post("/whatsapp")
async def ingest_whatsapp_message(
    message_data: WhatsAppMessage, current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """Ingest WhatsApp message data."""
    try:
        logger.info(
            f"Ingesting WhatsApp message for user {current_user.id} from {message_data.sender}"
        )

        # Format WhatsApp content for RAG storage
        whatsapp_content = f"""
Platform: WhatsApp
From: {message_data.sender} ({message_data.contact_name or message_data.phone_number or 'Unknown'})
Chat: {message_data.chat_name or 'Direct Message'}
Type: {message_data.message_type}
Time: {message_data.timestamp}
Group Chat: {'Yes' if message_data.is_group_chat else 'No'}

Message: {message_data.content}
        """.strip()

        # Prepare metadata
        metadata = {
            "source": "whatsapp",
            "user_id": current_user.id,
            "platform": message_data.platform,
            "sender": message_data.sender,
            "contact_name": message_data.contact_name,
            "phone_number": message_data.phone_number,
            "chat_name": message_data.chat_name,
            "message_type": message_data.message_type,
            "is_group_chat": message_data.is_group_chat,
            "urgency_level": message_data.urgency_level,
            "contains_media": message_data.contains_media,
            "timestamp": message_data.timestamp.isoformat(),
            "message_id": message_data.message_id,
            **(message_data.metadata or {}),
        }

        # Add to RAG pipeline
        document_ids = rag_pipeline.add_text(whatsapp_content, metadata)

        return {
            "message": "WhatsApp message ingested successfully",
            "user_id": current_user.id,
            "document_ids": document_ids,
            "sender": message_data.sender,
            "platform": "whatsapp",
            "status": "success",
        }

    except Exception as e:
        logger.error(f"WhatsApp ingestion failed for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=500, detail=f"WhatsApp ingestion failed: {str(e)}"
        )


@router.post("/instagram")
async def ingest_instagram_message(
    message_data: InstagramMessage, current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """Ingest Instagram message data."""
    try:
        logger.info(
            f"Ingesting Instagram message for user {current_user.id} from {message_data.username}"
        )

        # Format Instagram content for RAG storage
        instagram_content = f"""
Platform: Instagram
From: @{message_data.username}
Type: {message_data.message_type}
Time: {message_data.timestamp}
Direct Message: {'Yes' if message_data.is_direct_message else 'No'}
Story Reply: {'Yes' if message_data.is_story_reply else 'No'}

Message: {message_data.content}
        """.strip()

        # Prepare metadata
        metadata = {
            "source": "instagram",
            "user_id": current_user.id,
            "platform": message_data.platform,
            "sender": message_data.sender,
            "username": message_data.username,
            "message_type": message_data.message_type,
            "is_direct_message": message_data.is_direct_message,
            "is_story_reply": message_data.is_story_reply,
            "urgency_level": message_data.urgency_level,
            "contains_media": message_data.contains_media,
            "timestamp": message_data.timestamp.isoformat(),
            "message_id": message_data.message_id,
            **(message_data.metadata or {}),
        }

        # Add to RAG pipeline
        document_ids = rag_pipeline.add_text(instagram_content, metadata)

        return {
            "message": "Instagram message ingested successfully",
            "user_id": current_user.id,
            "document_ids": document_ids,
            "username": message_data.username,
            "platform": "instagram",
            "status": "success",
        }

    except Exception as e:
        logger.error(f"Instagram ingestion failed for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=500, detail=f"Instagram ingestion failed: {str(e)}"
        )


@router.post("/telegram")
async def ingest_telegram_message(
    message_data: TelegramMessage, current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """Ingest Telegram message data."""
    try:
        logger.info(
            f"Ingesting Telegram message for user {current_user.id} from {message_data.sender}"
        )

        # Format Telegram content for RAG storage
        telegram_content = f"""
Platform: Telegram
From: {message_data.sender} (@{message_data.username or 'unknown'})
Chat: {message_data.chat_name or 'Direct Message'}
Type: {message_data.message_type}
Time: {message_data.timestamp}
Channel: {'Yes' if message_data.is_channel else 'No'}
Bot Message: {'Yes' if message_data.is_bot_message else 'No'}

Message: {message_data.content}
        """.strip()

        # Prepare metadata
        metadata = {
            "source": "telegram",
            "user_id": current_user.id,
            "platform": message_data.platform,
            "sender": message_data.sender,
            "username": message_data.username,
            "chat_name": message_data.chat_name,
            "chat_id": message_data.chat_id,
            "message_type": message_data.message_type,
            "is_channel": message_data.is_channel,
            "is_bot_message": message_data.is_bot_message,
            "urgency_level": message_data.urgency_level,
            "contains_media": message_data.contains_media,
            "timestamp": message_data.timestamp.isoformat(),
            "message_id": message_data.message_id,
            **(message_data.metadata or {}),
        }

        # Add to RAG pipeline
        document_ids = rag_pipeline.add_text(telegram_content, metadata)

        return {
            "message": "Telegram message ingested successfully",
            "user_id": current_user.id,
            "document_ids": document_ids,
            "sender": message_data.sender,
            "platform": "telegram",
            "status": "success",
        }

    except Exception as e:
        logger.error(f"Telegram ingestion failed for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=500, detail=f"Telegram ingestion failed: {str(e)}"
        )


@router.post("/social")
async def ingest_social_message(
    message_data: SocialMessage, current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """Ingest generic social media message data."""
    try:
        logger.info(
            f"Ingesting {message_data.platform} message for user {current_user.id} from {message_data.sender}"
        )

        # Format social content for RAG storage
        social_content = f"""
Platform: {message_data.platform.title()}
From: {message_data.sender}
Chat: {message_data.chat_name or 'Direct Message'}
Type: {message_data.message_type}
Time: {message_data.timestamp}
Group Chat: {'Yes' if message_data.is_group_chat else 'No'}
Urgency: {message_data.urgency_level or 'Normal'}

Message: {message_data.content}
        """.strip()

        # Prepare metadata
        metadata = {
            "source": message_data.platform,
            "user_id": current_user.id,
            "platform": message_data.platform,
            "sender": message_data.sender,
            "recipient": message_data.recipient,
            "chat_name": message_data.chat_name,
            "message_type": message_data.message_type,
            "is_group_chat": message_data.is_group_chat,
            "participants": message_data.participants,
            "urgency_level": message_data.urgency_level,
            "contains_media": message_data.contains_media,
            "timestamp": message_data.timestamp.isoformat(),
            "message_id": message_data.message_id,
            **(message_data.metadata or {}),
        }

        # Add to RAG pipeline
        document_ids = rag_pipeline.add_text(social_content, metadata)

        return {
            "message": f"{message_data.platform.title()} message ingested successfully",
            "user_id": current_user.id,
            "document_ids": document_ids,
            "sender": message_data.sender,
            "platform": message_data.platform,
            "status": "success",
        }

    except Exception as e:
        logger.error(
            f"{message_data.platform} ingestion failed for user {current_user.id}: {e}"
        )
        raise HTTPException(
            status_code=500,
            detail=f"{message_data.platform} ingestion failed: {str(e)}",
        )


@router.delete("/documents")
async def delete_user_documents(
    filter_data: Dict[str, Any], current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """Delete documents matching filter criteria."""
    try:
        # Ensure user can only delete their own documents
        filter_data["user_id"] = current_user.id

        deleted_count = rag_pipeline.delete_documents(filter_data)

        return {
            "message": f"Deleted {deleted_count} documents",
            "user_id": current_user.id,
            "deleted_count": deleted_count,
            "status": "success",
        }

    except Exception as e:
        logger.error(f"Document deletion failed for user {current_user.id}: {e}")
        raise HTTPException(
            status_code=500, detail=f"Document deletion failed: {str(e)}"
        )
