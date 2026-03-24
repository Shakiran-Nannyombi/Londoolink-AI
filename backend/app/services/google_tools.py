"""
Google API tools for LangGraph agents.
Provides Gmail and Google Calendar access using stored OAuth credentials.
"""
import json
import logging
from typing import Optional

from langchain.tools import tool

logger = logging.getLogger(__name__)


def _get_google_credentials(user_id: int) -> Optional[object]:
    """Retrieve and refresh Google OAuth credentials for a user."""
    try:
        from google.oauth2.credentials import Credentials
        from google.auth.transport.requests import Request
        from app.db.session import SessionLocal
        from app.models.connected_service import ConnectedService

        db = SessionLocal()
        try:
            service = db.query(ConnectedService).filter(
                ConnectedService.user_id == user_id,
                ConnectedService.service_type == "gmail",
                ConnectedService.is_active == True,
            ).first()

            if not service or not service.encrypted_credentials:
                return None

            creds_data = json.loads(service.encrypted_credentials)
            creds = Credentials(
                token=creds_data.get("token"),
                refresh_token=creds_data.get("refresh_token"),
                token_uri="https://oauth2.googleapis.com/token",
                client_id=creds_data.get("client_id"),
                client_secret=creds_data.get("client_secret"),
                scopes=creds_data.get("scopes"),
            )

            # Refresh if expired
            if creds.expired and creds.refresh_token:
                creds.refresh(Request())
                # Persist refreshed token
                creds_data["token"] = creds.token
                service.encrypted_credentials = json.dumps(creds_data)
                db.commit()

            return creds
        finally:
            db.close()

    except Exception as e:
        logger.error(f"Failed to get Google credentials for user {user_id}: {e}")
        return None


def make_gmail_tool(user_id: int):
    """Create a Gmail tool bound to a specific user."""

    @tool
    def list_recent_emails(max_results: str = "10") -> str:
        """List recent emails from the user's Gmail inbox with subject, sender, and snippet."""
        try:
            from googleapiclient.discovery import build

            creds = _get_google_credentials(user_id)
            if not creds:
                return "Gmail not connected. Please connect your Gmail account in Settings → Integrations."

            service = build("gmail", "v1", credentials=creds)
            results = service.users().messages().list(
                userId="me", maxResults=int(max_results), labelIds=["INBOX"]
            ).execute()

            messages = results.get("messages", [])
            if not messages:
                return "No emails found in inbox."

            email_summaries = []
            for msg in messages:
                detail = service.users().messages().get(
                    userId="me", id=msg["id"], format="metadata",
                    metadataHeaders=["Subject", "From", "Date"]
                ).execute()

                headers = {h["name"]: h["value"] for h in detail.get("payload", {}).get("headers", [])}
                snippet = detail.get("snippet", "")[:150]
                email_summaries.append(
                    f"From: {headers.get('From', 'Unknown')}\n"
                    f"Subject: {headers.get('Subject', 'No subject')}\n"
                    f"Date: {headers.get('Date', 'Unknown')}\n"
                    f"Preview: {snippet}\n"
                )

            return f"Recent {len(email_summaries)} emails:\n\n" + "\n---\n".join(email_summaries)

        except Exception as e:
            logger.error(f"Gmail list error for user {user_id}: {e}")
            return f"Error fetching emails: {str(e)}"

    return list_recent_emails


def make_gmail_search_tool(user_id: int):
    """Create a Gmail search tool bound to a specific user."""

    @tool
    def search_emails(query: str) -> str:
        """Search Gmail emails using Gmail search syntax (e.g. 'from:boss@company.com', 'subject:invoice', 'is:unread')."""
        try:
            from googleapiclient.discovery import build

            creds = _get_google_credentials(user_id)
            if not creds:
                return "Gmail not connected. Please connect your Gmail account in Settings → Integrations."

            service = build("gmail", "v1", credentials=creds)
            results = service.users().messages().list(
                userId="me", q=query, maxResults=10
            ).execute()

            messages = results.get("messages", [])
            if not messages:
                return f"No emails found matching: {query}"

            email_summaries = []
            for msg in messages:
                detail = service.users().messages().get(
                    userId="me", id=msg["id"], format="metadata",
                    metadataHeaders=["Subject", "From", "Date"]
                ).execute()

                headers = {h["name"]: h["value"] for h in detail.get("payload", {}).get("headers", [])}
                snippet = detail.get("snippet", "")[:150]
                email_summaries.append(
                    f"From: {headers.get('From', 'Unknown')}\n"
                    f"Subject: {headers.get('Subject', 'No subject')}\n"
                    f"Date: {headers.get('Date', 'Unknown')}\n"
                    f"Preview: {snippet}\n"
                )

            return f"Found {len(email_summaries)} emails for '{query}':\n\n" + "\n---\n".join(email_summaries)

        except Exception as e:
            logger.error(f"Gmail search error for user {user_id}: {e}")
            return f"Error searching emails: {str(e)}"

    return search_emails


def make_calendar_tool(user_id: int):
    """Create a Google Calendar tool bound to a specific user."""

    @tool
    def list_upcoming_events(days_ahead: str = "7") -> str:
        """List upcoming Google Calendar events for the next N days."""
        try:
            from datetime import datetime, timezone, timedelta
            from googleapiclient.discovery import build

            creds = _get_google_credentials(user_id)
            if not creds:
                return "Google Calendar not connected. Please connect your Gmail account in Settings → Integrations."

            service = build("calendar", "v3", credentials=creds)
            now = datetime.now(timezone.utc)
            time_max = now + timedelta(days=int(days_ahead))

            events_result = service.events().list(
                calendarId="primary",
                timeMin=now.isoformat(),
                timeMax=time_max.isoformat(),
                maxResults=20,
                singleEvents=True,
                orderBy="startTime",
            ).execute()

            events = events_result.get("items", [])
            if not events:
                return f"No upcoming events in the next {days_ahead} days."

            event_summaries = []
            for event in events:
                start = event["start"].get("dateTime", event["start"].get("date", "Unknown"))
                summary = event.get("summary", "No title")
                location = event.get("location", "")
                description = (event.get("description", "") or "")[:100]

                entry = f"Event: {summary}\nWhen: {start}"
                if location:
                    entry += f"\nWhere: {location}"
                if description:
                    entry += f"\nDetails: {description}"
                event_summaries.append(entry)

            return f"Upcoming {len(event_summaries)} events:\n\n" + "\n---\n".join(event_summaries)

        except Exception as e:
            logger.error(f"Calendar list error for user {user_id}: {e}")
            return f"Error fetching calendar events: {str(e)}"

    return list_upcoming_events


def get_google_tools_for_user(user_id: int) -> list:
    """Return all Google API tools bound to a specific user."""
    return [
        make_gmail_tool(user_id),
        make_gmail_search_tool(user_id),
        make_calendar_tool(user_id),
    ]
