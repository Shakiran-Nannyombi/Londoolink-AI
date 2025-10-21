import logging
from datetime import datetime
from typing import Any, Dict

from app.services.agents import CalendarAgent, EmailAgent, PriorityAgent, SocialAgent
from app.services.tools import get_all_tools

logger = logging.getLogger(__name__)


class AICoordinator:
    # Simple coordinator that manages specialized AI agents

    def __init__(self):
        self.tools = get_all_tools()
        self.email_agent = EmailAgent(self.tools)
        self.calendar_agent = CalendarAgent(self.tools)
        self.social_agent = SocialAgent(self.tools)
        self.priority_agent = PriorityAgent(self.tools)
        logger.info("AI Coordinator initialized with all agents")

    def get_daily_briefing(self, user_id: int) -> Dict[str, Any]:
        # Generate a comprehensive daily briefing using all agents
        try:
            briefing_data = {
                "user_id": user_id,
                "generated_at": datetime.utcnow().isoformat(),
                "email_insights": {},
                "calendar_insights": {},
                "social_insights": {},
                "priority_recommendations": {},
                "summary": "",
            }

            # Get insights from each agent
            try:
                email_result = self.email_agent.get_daily_insights()
                briefing_data["email_insights"] = email_result
            except Exception as e:
                logger.error(f"Email insights failed: {e}")
                briefing_data["email_insights"] = {
                    "analysis": "Email analysis temporarily unavailable",
                    "status": "error",
                    "agent_type": "email",
                }

            try:
                calendar_result = self.calendar_agent.get_daily_insights()
                briefing_data["calendar_insights"] = calendar_result
            except Exception as e:
                logger.error(f"Calendar insights failed: {e}")
                briefing_data["calendar_insights"] = {
                    "analysis": "Calendar analysis temporarily unavailable",
                    "status": "error",
                    "agent_type": "calendar",
                }

            try:
                social_result = self.social_agent.get_daily_insights()
                briefing_data["social_insights"] = social_result
            except Exception as e:
                logger.error(f"Social insights failed: {e}")
                briefing_data["social_insights"] = {
                    "analysis": "Social messaging analysis temporarily unavailable",
                    "status": "error",
                    "agent_type": "social",
                }

            # Create master briefing
            try:
                priority_result = self.priority_agent.create_briefing(
                    email_analysis=briefing_data["email_insights"].get(
                        "analysis", "Not available"
                    ),
                    calendar_analysis=briefing_data["calendar_insights"].get(
                        "analysis", "Not available"
                    ),
                    social_analysis=briefing_data["social_insights"].get(
                        "analysis", "Not available"
                    ),
                )
                briefing_data["priority_recommendations"] = priority_result
                briefing_data["summary"] = priority_result.get(
                    "analysis", "Daily briefing generated successfully"
                )
            except Exception as e:
                logger.error(f"Priority briefing failed: {e}")
                briefing_data["priority_recommendations"] = {
                    "analysis": "Prioritization analysis temporarily unavailable",
                    "status": "error",
                    "agent_type": "priority",
                }
                briefing_data["summary"] = (
                    "Daily briefing completed with limited analysis due to technical issues."
                )

            logger.info(f"Daily briefing generated for user {user_id}")
            return briefing_data

        except Exception as e:
            logger.error(f"Failed to generate daily briefing: {e}")
            return {
                "user_id": user_id,
                "generated_at": datetime.utcnow().isoformat(),
                "error": str(e),
                "summary": "Failed to generate daily briefing due to technical issues.",
            }

    def analyze_document(self, content: str, document_type: str) -> Dict[str, Any]:
        # Analyze a document using the appropriate agent
        try:
            if document_type == "email":
                return self.email_agent.analyze(
                    f"Analyze this email for urgency, importance, and action items:\n\n{content}"
                )
            elif document_type == "calendar":
                return self.calendar_agent.analyze(
                    f"Analyze this calendar event for importance and scheduling considerations:\n\n{content}"
                )
            elif document_type in [
                "instagram",
                "whatsapp",
                "telegram",
                "social",
                "message",
                "chat",
            ]:
                return self.social_agent.analyze_message(content, document_type)
            else:
                return self.priority_agent.analyze_document(content, document_type)

        except Exception as e:
            logger.error(f"Document analysis failed: {e}")
            return {
                "analysis": f"Analysis failed: {str(e)}",
                "document_type": document_type,
                "status": "error",
            }


# Global coordinator instance
ai_coordinator = AICoordinator()
