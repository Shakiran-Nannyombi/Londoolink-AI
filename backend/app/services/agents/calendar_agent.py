import logging
from typing import Any, Dict, List, Optional

from langchain.agents import create_agent
from langchain_google_genai import ChatGoogleGenerativeAI

from app.core.config import settings
from app.services.step_up import requires_step_up
from app.services.token_vault import TokenVaultClient, get_token_vault_client

logger = logging.getLogger(__name__)

_CALENDAR_SCOPE = "calendar.readonly"
_GOOGLE_SERVICE = "google"


class CalendarAgent:
    """Calendar Analysis Agent for analyzing meetings and events."""

    def __init__(
        self,
        tools: List,
        token_vault_client: Optional[TokenVaultClient] = None,
    ) -> None:
        self.tools = tools
        self.token_vault_client: TokenVaultClient = (
            token_vault_client if token_vault_client is not None else get_token_vault_client()
        )
        self.agent = self._create_agent()

    # ------------------------------------------------------------------
    # Token vault helpers
    # ------------------------------------------------------------------

    async def _get_calendar_token(self, auth0_sub: str) -> dict:
        """Retrieve the Google Calendar access token from the vault for *auth0_sub*."""
        return await self.token_vault_client.retrieve_token(
            auth0_sub, _GOOGLE_SERVICE, _CALENDAR_SCOPE
        )

    # ------------------------------------------------------------------
    # Agent construction
    # ------------------------------------------------------------------

    def _create_agent(self):
        """Create the calendar analysis agent."""
        try:
            llm = ChatGoogleGenerativeAI(
                model="gemini-3.0-pro",
                temperature=0.1,
                google_api_key=settings.GEMINI_API_KEY,
            )

            system_prompt = """You are a Calendar Analysis Agent for Londoolink AI. Your role is to:
            1. Analyze upcoming meetings and events
            2. Identify scheduling conflicts
            3. Suggest optimal time management
            4. Highlight important deadlines and commitments
            
            Use the available tools to search through calendar events and provide insights.
            Focus on helping the user manage their time effectively."""

            agent = create_agent(
                model=llm, tools=self.tools, system_prompt=system_prompt
            )

            logger.info("Calendar agent created successfully")
            return agent

        except Exception as e:
            logger.error(f"Failed to create calendar agent: {e}")
            raise

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def analyze(self, prompt: str, auth0_sub: str = "") -> Dict[str, Any]:
        """Analyze calendar events based on *prompt* for the user identified by *auth0_sub*."""
        try:
            result = self.agent.invoke(
                {"messages": [{"role": "user", "content": prompt}]}
            )

            return {
                "analysis": result.get("messages", [{}])[-1].get(
                    "content", "No analysis available"
                ),
                "status": "completed",
                "agent_type": "calendar",
            }

        except Exception as e:
            logger.error(f"Calendar analysis failed: {e}")
            return {
                "analysis": f"Calendar analysis failed: {str(e)}",
                "status": "error",
                "agent_type": "calendar",
            }

    def get_daily_insights(self, auth0_sub: str = "") -> Dict[str, Any]:
        """Get daily calendar insights for the user identified by *auth0_sub*."""
        prompt = (
            "Analyze upcoming calendar events, meetings, and deadlines. "
            "Identify any conflicts or important items requiring attention."
        )
        return self.analyze(prompt, auth0_sub=auth0_sub)

    @requires_step_up
    async def create_calendar_event(
        self,
        state: Dict[str, Any],
        title: str,
        start_time: str,
        end_time: str,
        description: str = "",
    ) -> Dict[str, Any]:
        """
        Create a calendar event on behalf of the user.

        Decorated with ``@requires_step_up`` — a valid ``step_up_token`` must be
        present in *state* before this method executes.

        Retrieves the Google Calendar OAuth token from the vault using
        ``state["auth0_sub"]`` before calling the Calendar API.
        """
        auth0_sub: str = state.get("auth0_sub", "")
        token_data = await self._get_calendar_token(auth0_sub)
        access_token: str = token_data["access_token"]

        logger.info(
            "create_calendar_event called for auth0_sub=%s title=%s",
            auth0_sub,
            title,
        )

        # TODO: integrate with Google Calendar API using access_token
        return {
            "status": "created",
            "title": title,
            "start_time": start_time,
            "end_time": end_time,
            "agent_type": "calendar",
        }

    @requires_step_up
    async def update_calendar_event(
        self,
        state: Dict[str, Any],
        event_id: str,
        title: Optional[str] = None,
        start_time: Optional[str] = None,
        end_time: Optional[str] = None,
        description: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Update an existing calendar event on behalf of the user.

        Decorated with ``@requires_step_up`` — a valid ``step_up_token`` must be
        present in *state* before this method executes.

        Retrieves the Google Calendar OAuth token from the vault using
        ``state["auth0_sub"]`` before calling the Calendar API.
        """
        auth0_sub: str = state.get("auth0_sub", "")
        token_data = await self._get_calendar_token(auth0_sub)
        access_token: str = token_data["access_token"]

        logger.info(
            "update_calendar_event called for auth0_sub=%s event_id=%s",
            auth0_sub,
            event_id,
        )

        # TODO: integrate with Google Calendar API using access_token
        return {
            "status": "updated",
            "event_id": event_id,
            "agent_type": "calendar",
        }
