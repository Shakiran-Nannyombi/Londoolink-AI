import logging
from typing import Any, Dict, List


from langchain_google_genai import ChatGoogleGenerativeAI

from app.core.config import settings

logger = logging.getLogger(__name__)


class PriorityAgent:
    # Master Prioritization Agent for synthesizing insights and creating daily briefings

    def __init__(self, tools: List):
        self.tools = tools
        self.agent = self._create_agent()

    def _create_agent(self):
        try:
            llm = ChatGoogleGenerativeAI(
                model="gemini-1.5-flash",
                temperature=0.1,
                google_api_key=settings.GEMINI_API_KEY,
            )
            logger.info("Priority agent created successfully")
            return llm
        except Exception as e:
            logger.error(f"Failed to create priority agent: {e}")
            raise

    def analyze(self, prompt: str) -> Dict[str, Any]:
        try:
            result = self.agent.invoke(prompt)
            return {
                "analysis": result.content if hasattr(result, "content") else str(result),
                "status": "completed",
                "agent_type": "priority",
            }

        except Exception as e:
            logger.error(f"Priority analysis failed: {e}")
            return {
                "analysis": f"Priority analysis failed: {str(e)}",
                "status": "error",
                "agent_type": "priority",
            }

    def create_briefing(
        self, email_analysis: str, calendar_analysis: str, social_analysis: str
    ) -> Dict[str, Any]:
        # Create a comprehensive daily briefing from all agent analyses
        context = f"""
        Email Analysis: {email_analysis}
        Calendar Analysis: {calendar_analysis}
        Social Messaging Analysis: {social_analysis}
        """

        prompt = f"Based on the following analysis, create a prioritized daily briefing with actionable recommendations:\n{context}"
        return self.analyze(prompt)

    def analyze_document(
        self, content: str, document_type: str = "general"
    ) -> Dict[str, Any]:
        # Analyze a general document and provide insights
        prompt = (
            f"Analyze this {document_type} document and provide insights:\n\n{content}"
        )
        return self.analyze(prompt)
