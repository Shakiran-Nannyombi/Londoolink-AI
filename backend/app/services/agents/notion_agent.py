import logging
from typing import Any, Dict, List, Optional


from langchain_google_genai import ChatGoogleGenerativeAI

from app.core.config import settings
from app.services.step_up import requires_step_up
from app.services.token_vault import TokenVaultClient, get_token_vault_client

logger = logging.getLogger(__name__)

_NOTION_READ_SCOPE = "notion.read"
_NOTION_WRITE_SCOPE = "notion.write"
_NOTION_SERVICE = "notion"


class NotionAgent:
    """Notion Agent for reading and writing Notion pages."""

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

    async def _get_notion_token(self, auth0_sub: str, scope: str) -> dict:
        """Retrieve the Notion access token from the vault for *auth0_sub* with *scope*."""
        return await self.token_vault_client.retrieve_token(
            auth0_sub, _NOTION_SERVICE, scope
        )

    # ------------------------------------------------------------------
    # LangChain tools
    # ------------------------------------------------------------------

    async def list_notion_pages(self, query: str, auth0_sub: str = "") -> str:
        """
        List Notion pages matching *query*.

        Retrieves the Notion OAuth token from the vault using *auth0_sub*
        with scope ``notion.read`` before calling the Notion API.
        """
        token_data = await self._get_notion_token(auth0_sub, _NOTION_READ_SCOPE)
        access_token: str = token_data["access_token"]

        logger.info(
            "list_notion_pages called for auth0_sub=%s query=%s",
            auth0_sub,
            query,
        )

        # TODO: integrate with Notion API using access_token
        return f"Listed Notion pages for query: {query}"

    async def get_notion_page(self, page_id: str, auth0_sub: str = "") -> str:
        """
        Retrieve a single Notion page by *page_id*.

        Retrieves the Notion OAuth token from the vault using *auth0_sub*
        with scope ``notion.read`` before calling the Notion API.
        """
        token_data = await self._get_notion_token(auth0_sub, _NOTION_READ_SCOPE)
        access_token: str = token_data["access_token"]

        logger.info(
            "get_notion_page called for auth0_sub=%s page_id=%s",
            auth0_sub,
            page_id,
        )

        # TODO: integrate with Notion API using access_token
        return f"Retrieved Notion page: {page_id}"

    @requires_step_up
    async def write_notion_page(
        self,
        state: Dict[str, Any],
        title: str,
        content: str,
    ) -> str:
        """
        Write a new Notion page with *title* and *content*.

        Decorated with ``@requires_step_up`` — a valid ``step_up_token`` must be
        present in *state* before this method executes.

        Retrieves the Notion OAuth token from the vault using ``state["auth0_sub"]``
        with scope ``notion.write`` before calling the Notion API.
        """
        auth0_sub: str = state.get("auth0_sub", "")
        token_data = await self._get_notion_token(auth0_sub, _NOTION_WRITE_SCOPE)
        access_token: str = token_data["access_token"]

        logger.info(
            "write_notion_page called for auth0_sub=%s title=%s",
            auth0_sub,
            title,
        )

        # TODO: integrate with Notion API using access_token
        return f"Written Notion page: {title}"

    # ------------------------------------------------------------------
    # Agent construction
    # ------------------------------------------------------------------

    def _create_agent(self):
        """Create the Notion agent."""
        try:
            llm = ChatGoogleGenerativeAI(
                model="gemini-3.0-pro",
                temperature=0.1,
                google_api_key=settings.GEMINI_API_KEY,
            )

            system_prompt = """You are a Notion Agent for Londoolink AI. Your role is to:
            1. Search and retrieve Notion pages relevant to the user's query
            2. Summarize and extract key information from Notion content
            3. Create and update Notion pages on behalf of the user
            4. Organize and structure information in Notion

            Use the available tools to interact with the user's Notion workspace.
            Always confirm write operations before executing them."""

            agent = llm
                model=llm, tools=self.tools, system_prompt=system_prompt
            )

            logger.info("Notion agent created successfully")
            return agent

        except Exception as e:
            logger.error(f"Failed to create Notion agent: {e}")
            raise

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def analyze(self, prompt: str, auth0_sub: str = "") -> Dict[str, Any]:
        """Analyze Notion content based on *prompt* for the user identified by *auth0_sub*."""
        try:
            result = self.agent.invoke(
                {"messages": [{"role": "user", "content": prompt}]}
            )

            return {
                "analysis": result.get("messages", [{}])[-1].get(
                    "content", "No analysis available"
                ),
                "status": "completed",
                "agent_type": "notion",
            }

        except Exception as e:
            logger.error(f"Notion analysis failed: {e}")
            return {
                "analysis": f"Notion analysis failed: {str(e)}",
                "status": "error",
                "agent_type": "notion",
            }

    def get_daily_insights(self, auth0_sub: str = "") -> Dict[str, Any]:
        """Get daily Notion insights for the user identified by *auth0_sub*."""
        prompt = (
            "Review recent Notion pages and databases for important updates, "
            "action items, and key information requiring attention."
        )
        return self.analyze(prompt, auth0_sub=auth0_sub)
