import logging
from typing import Any, Dict, List

from langchain.agents import create_agent
from langchain_groq import ChatGroq

from app.core.config import settings

logger = logging.getLogger(__name__)


class SocialAgent:
    # Social Media & Messaging Agent for analyzing messages from various platforms

    def __init__(self, tools: List):
        self.tools = tools
        self.agent = self._create_agent()

    def _create_agent(self):
        # Create the social messaging agent
        try:
            llm = ChatGroq(
                model="llama-3.1-8b-instant",
                temperature=0.1,
                api_key=settings.GROQ_API_KEY,
            )

            system_prompt = """You are a Social Media & Messaging Agent for Londoolink AI. Your role is to:
            1. Analyze messages from Instagram, WhatsApp, Telegram, and other messaging platforms
            2. Identify urgent messages that need immediate replies
            3. Detect important conversations (work-related, family emergencies, deadlines)
            4. Flag messages from VIP contacts (boss, family, important clients)
            5. Categorize messages by urgency: URGENT, IMPORTANT, NORMAL, LOW_PRIORITY
            6. Identify action items and follow-ups needed
            7. Detect emotional context (angry customers, upset friends, celebrations)
            
            Focus on helping the user prioritize their social interactions and never miss important messages.
            Pay special attention to:
            - Work-related messages during business hours
            - Family/emergency messages anytime
            - Time-sensitive opportunities
            - Messages from people the user frequently interacts with"""

            agent = create_agent(
                model=llm, tools=self.tools, system_prompt=system_prompt
            )

            logger.info("Social agent created successfully")
            return agent

        except Exception as e:
            logger.error(f"Failed to create social agent: {e}")
            raise

    def analyze(self, prompt: str) -> Dict[str, Any]:
        # Analyze social messages based on the given prompt
        try:
            result = self.agent.invoke(
                {"messages": [{"role": "user", "content": prompt}]}
            )

            return {
                "analysis": result.get("messages", [{}])[-1].get(
                    "content", "No analysis available"
                ),
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
