"""SMS notification service using Africa's Talking."""
import logging
from typing import Optional

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)


async def send_sms(phone_number: str, message: str) -> bool:
    """Send an SMS via Africa's Talking API. Returns True on success."""
    username = settings.AT_USERNAME
    api_key = settings.AT_API_KEY

    if not username or not api_key:
        logger.warning("Africa's Talking credentials not configured — SMS not sent")
        return False

    if not phone_number:
        logger.warning("No phone number provided — SMS not sent")
        return False

    # Ensure phone number has country code
    if not phone_number.startswith("+"):
        phone_number = f"+{phone_number}"

    try:
        base_url = (
            "https://api.sandbox.africastalking.com/version1/messaging"
            if username == "sandbox"
            else "https://api.africastalking.com/version1/messaging"
        )

        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                base_url,
                headers={
                    "apiKey": api_key,
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Accept": "application/json",
                },
                data={
                    "username": username,
                    "to": phone_number,
                    "message": message,
                },
            )

        if resp.status_code == 201:
            logger.info(f"SMS sent to {phone_number}")
            return True
        else:
            logger.error(f"SMS failed: {resp.status_code} {resp.text}")
            return False

    except Exception as e:
        logger.error(f"SMS error: {e}")
        return False


async def send_urgent_alert(phone_number: str, task_title: str, task_description: str) -> bool:
    """Send an urgent task alert SMS."""
    message = (
        f"🚨 URGENT - Londoolink AI Alert\n\n"
        f"{task_title}\n\n"
        f"{task_description[:100]}{'...' if len(task_description) > 100 else ''}\n\n"
        f"Check your dashboard for details."
    )
    return await send_sms(phone_number, message)
