import logging
from typing import Any, Dict, List


from langchain_google_genai import ChatGoogleGenerativeAI

from app.core.config import settings

logger = logging.getLogger(__name__)


class SocialAgent:
    # Social Media & Messaging Agent for analyzing messages from various platforms

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
            logger.info("Social agent created successfully")
            return llm
        except Exception as e:
            logger.error(f"Failed to create social agent: {e}")
            raise

    def analyze(self, prompt: str) -> Dict[str, Any]:
        try:
            result = self.agent.invoke(prompt)
            return {
                "analysis": result.content if hasattr(result, "content") else str(result),
                "status": "completed",
                "agent_type": "social",
            }

        except Exception as e:
            logger.error(f"Social analysis failed: {e}")
            return {
                "analysis": f"Social analysis failed: {str(e)}",
                "status": "error",
                "agent_type": "social",
            }

    def get_daily_insights(self) -> Dict[str, Any]:
        # Get daily social messaging insights
        prompt = "Analyze recent messages from Instagram, WhatsApp, Telegram and other messaging platforms. Identify urgent messages, important conversations, and messages that need immediate replies. Focus on work-related messages, family communications, and time-sensitive opportunities."
        return self.analyze(prompt)

    def analyze_message(self, content: str, platform: str) -> Dict[str, Any]:
        # Analyze a specific message for urgency and importance
        prompt = f"Analyze this {platform} message for urgency, importance, emotional context, and required actions. Identify if this needs immediate reply:\n\n{content}"
        return self.analyze(prompt)
