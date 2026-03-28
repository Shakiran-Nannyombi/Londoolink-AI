import logging
from typing import Any, Dict, List, Optional


from langchain_google_genai import ChatGoogleGenerativeAI

from app.core.config import settings
from app.services.step_up import requires_step_up
from app.services.token_vault import TokenVaultClient, get_token_vault_client

logger = logging.getLogger(__name__)

_GMAIL_SCOPE = "gmail.readonly"
_GOOGLE_SERVICE = "google"


class EmailAgent:
    """Email Triage Agent for analyzing emails and identifying urgent items."""

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

    async def _get_gmail_token(self, auth0_sub: str) -> dict:
        """Retrieve the Gmail access token from the vault for *auth0_sub*."""
        return await self.token_vault_client.retrieve_token(
            auth0_sub, _GOOGLE_SERVICE, _GMAIL_SCOPE
        )

    # ------------------------------------------------------------------
    # Agent construction
    # ------------------------------------------------------------------

    def _create_agent(self):
        """Create the email triage agent."""
        try:
            llm = ChatGoogleGenerativeAI(
                model="gemini-1.5-flash",
                temperature=0.1,
                google_api_key=settings.GEMINI_API_KEY,
            )
            logger.info("Email agent created successfully")
            return llm
        except Exception as e:
            logger.error(f"Failed to create email agent: {e}")
            raise

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def analyze(self, prompt: str, auth0_sub: str = "") -> Dict[str, Any]:
        """Analyze emails based on *prompt* for the user identified by *auth0_sub*."""
        try:
            result = self.agent.invoke(prompt)
            return {
                "analysis": result.content if hasattr(result, "content") else str(result),
                "status": "completed",
                "agent_type": "email",
            }

        except Exception as e:
            logger.error(f"Email analysis failed: {e}")
            return {
                "analysis": f"Email analysis failed: {str(e)}",
                "status": "error",
                "agent_type": "email",
            }

    def get_daily_insights(self, auth0_sub: str = "") -> Dict[str, Any]:
        """Get daily email insights for the user identified by *auth0_sub*."""
        prompt = (
            "Analyze recent emails for urgent items, action items, and important "
            "communications. Provide a summary of key findings."
        )
        return self.analyze(prompt, auth0_sub=auth0_sub)

    @requires_step_up
    async def send_email(
        self,
        state: Dict[str, Any],
        to: str,
        subject: str,
        body: str,
    ) -> Dict[str, Any]:
        """
        Send an email on behalf of the user.

        Decorated with ``@requires_step_up`` — a valid ``step_up_token`` must be
        present in *state* before this method executes.

        Retrieves the Gmail OAuth token from the vault using ``state["auth0_sub"]``
        before calling the Gmail API.
        """
        auth0_sub: str = state.get("auth0_sub", "")
        token_data = await self._get_gmail_token(auth0_sub)
        access_token: str = token_data["access_token"]

        logger.info(
            "send_email called for auth0_sub=%s to=%s subject=%s",
            auth0_sub,
            to,
            subject,
        )

        # TODO: integrate with Gmail API using access_token
        return {
            "status": "sent",
            "to": to,
            "subject": subject,
            "agent_type": "email",
        }
