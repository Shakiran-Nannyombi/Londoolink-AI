import logging
from typing import Any, Dict, List

from langchain.agents import create_agent
from langchain_groq import ChatGroq

from app.core.config import settings

logger = logging.getLogger(__name__)


class EmailAgent:
    # Email Triage Agent for analyzing emails and identifying urgent items

    def __init__(self, tools: List):
        self.tools = tools
        self.agent = self._create_agent()

    def _create_agent(self):
        # Create the email triage agent
        try:
            llm = ChatGroq(
                model="llama-3.1-8b-instant",
                temperature=0.1,
                api_key=settings.GROQ_API_KEY,
            )

            system_prompt = """You are an Email Triage Agent for Londoolink AI. Your role is to:
            1. Analyze emails for urgency and importance
            2. Identify action items and deadlines
            3. Categorize emails by type (work, personal, newsletters, etc.)
            4. Flag emails that require immediate attention
            
            Use the available tools to search through the user's emails and provide insights.
            Be concise but thorough in your analysis."""

            agent = create_agent(
                model=llm, tools=self.tools, system_prompt=system_prompt
            )

            logger.info("Email agent created successfully")
            return agent

        except Exception as e:
            logger.error(f"Failed to create email agent: {e}")
            raise

    def analyze(self, prompt: str) -> Dict[str, Any]:
        # Analyze emails based on the given prompt
        try:
            result = self.agent.invoke(
                {"messages": [{"role": "user", "content": prompt}]}
            )

            return {
                "analysis": result.get("messages", [{}])[-1].get(
                    "content", "No analysis available"
                ),
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

    def get_daily_insights(self) -> Dict[str, Any]:
        # Get daily email insights
        prompt = "Analyze recent emails for urgent items, action items, and important communications. Provide a summary of key findings."
        return self.analyze(prompt)
