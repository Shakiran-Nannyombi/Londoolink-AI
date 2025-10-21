import logging
from datetime import datetime
from typing import Any, Dict

from langchain_core.messages import HumanMessage
from langchain_groq import ChatGroq

from app.core.config import settings

from .state import AgentState, create_initial_state
from .workflow import WorkflowBuilder

logger = logging.getLogger(__name__)


class LangGraphCoordinator:
    # Clean, modular multi-agent coordinator using LangGraph

    def __init__(self):
        self.workflow_builder = WorkflowBuilder()
        self.graph = self.workflow_builder.build_workflow()
        self.llm = self._create_llm()

    def _create_llm(self):
        # Create the main LLM for direct document analysis
        return ChatGroq(
            model="llama-3.1-70b-versatile",
            temperature=0.1,
            api_key=settings.GROQ_API_KEY,
            max_tokens=4096,
        )

    def get_daily_briefing(self, user_id: int) -> Dict[str, Any]:
        # Generate daily briefing using LangGraph multi-agent workflow
        try:
            logger.info(f"Starting LangGraph daily briefing for user {user_id}")

            # Initialize state
            initial_state = create_initial_state(user_id)

            # Run the workflow
            result = self.graph.invoke(initial_state)

            # Format the response
            return {
                "user_id": user_id,
                "generated_at": datetime.utcnow().isoformat(),
                "email_insights": result.get("email_analysis", {}),
                "calendar_insights": result.get("calendar_analysis", {}),
                "social_insights": result.get("social_analysis", {}),
                "priority_recommendations": result.get("priority_recommendations", {}),
                "summary": result.get("final_briefing", "No briefing generated"),
                "workflow_status": "completed",
                "agent_framework": "langgraph",
            }

        except Exception as e:
            logger.error(f"LangGraph workflow failed: {e}")
            return {
                "user_id": user_id,
                "generated_at": datetime.utcnow().isoformat(),
                "error": str(e),
                "summary": "Failed to generate daily briefing due to workflow error",
                "workflow_status": "error",
                "agent_framework": "langgraph",
            }

    def analyze_document(self, content: str, document_type: str) -> Dict[str, Any]:
        # Analyze a document using appropriate agent logic
        try:
            logger.info(f"Analyzing {document_type} document with LangGraph")

            # Create document-specific prompts
            if document_type == "email":
                prompt = f"Analyze this email for urgency, importance, and action items:\n\n{content}"
                agent_type = "email"
            elif document_type == "calendar":
                prompt = f"Analyze this calendar event for importance and scheduling considerations:\n\n{content}"
                agent_type = "calendar"
            elif document_type in [
                "instagram",
                "whatsapp",
                "telegram",
                "social",
                "message",
                "chat",
            ]:
                prompt = f"Analyze this {document_type} message for urgency, importance, and required actions:\n\n{content}"
                agent_type = "social"
            else:
                prompt = f"Analyze this {document_type} document and provide insights:\n\n{content}"
                agent_type = "priority"

            # Use LLM directly for document analysis
            messages = [HumanMessage(content=prompt)]
            response = self.llm.invoke(messages)

            return {
                "analysis": response.content,
                "status": "completed",
                "agent_type": agent_type,
                "document_type": document_type,
                "framework": "langgraph",
                "timestamp": datetime.utcnow().isoformat(),
            }

        except Exception as e:
            logger.error(f"Document analysis failed: {e}")
            return {
                "analysis": f"Document analysis failed: {str(e)}",
                "status": "error",
                "agent_type": "unknown",
                "document_type": document_type,
                "framework": "langgraph",
            }

    def chat_with_email_agent(self, user_id: int, message: str) -> str:
        """Chat with the email agent"""
        try:
            logger.info(f"Email agent chat for user {user_id}: {message[:50]}...")
            
            prompt = f"""You are an Email Management Agent. Help the user with email-related tasks.
            
            User message: {message}
            
            Provide helpful, actionable advice about email management, organization, or analysis.
            Be conversational and helpful."""
            
            response = self.llm.invoke([HumanMessage(content=prompt)])
            return response.content
            
        except Exception as e:
            logger.error(f"Email agent chat failed: {e}")
            return f"I'm having trouble processing your request right now. Error: {str(e)}"

    def chat_with_calendar_agent(self, user_id: int, message: str) -> str:
        """Chat with the calendar agent"""
        try:
            logger.info(f"Calendar agent chat for user {user_id}: {message[:50]}...")
            
            prompt = f"""You are a Calendar Management Agent. Help the user with scheduling and time management.
            
            User message: {message}
            
            Provide helpful advice about calendar management, scheduling, time blocking, or meeting optimization.
            Be conversational and helpful."""
            
            response = self.llm.invoke([HumanMessage(content=prompt)])
            return response.content
            
        except Exception as e:
            logger.error(f"Calendar agent chat failed: {e}")
            return f"I'm having trouble processing your request right now. Error: {str(e)}"

    def chat_with_priority_agent(self, user_id: int, message: str) -> str:
        """Chat with the priority agent"""
        try:
            logger.info(f"Priority agent chat for user {user_id}: {message[:50]}...")
            
            prompt = f"""You are a Priority Management Agent. Help the user prioritize tasks and manage their workload.
            
            User message: {message}
            
            Provide helpful advice about task prioritization, productivity, and workflow optimization.
            Be conversational and helpful."""
            
            response = self.llm.invoke([HumanMessage(content=prompt)])
            return response.content
            
        except Exception as e:
            logger.error(f"Priority agent chat failed: {e}")
            return f"I'm having trouble processing your request right now. Error: {str(e)}"

    def chat_with_social_agent(self, user_id: int, message: str) -> str:
        """Chat with the social agent"""
        try:
            logger.info(f"Social agent chat for user {user_id}: {message[:50]}...")
            
            prompt = f"""You are a Social Media Management Agent. Help the user with social media and messaging platforms.
            
            User message: {message}
            
            Provide helpful advice about social media management, messaging optimization, or digital communication.
            Be conversational and helpful."""
            
            response = self.llm.invoke([HumanMessage(content=prompt)])
            return response.content
            
        except Exception as e:
            logger.error(f"Social agent chat failed: {e}")
            return f"I'm having trouble processing your request right now. Error: {str(e)}"

    def general_chat(self, user_id: int, message: str) -> str:
        """General chat functionality"""
        try:
            logger.info(f"General chat for user {user_id}: {message[:50]}...")
            
            prompt = f"""You are Londoolink AI, an intelligent personal assistant. Help the user with their request.
            
            User message: {message}
            
            Provide helpful, accurate information and assistance. Be conversational and professional."""
            
            response = self.llm.invoke([HumanMessage(content=prompt)])
            return response.content
            
        except Exception as e:
            logger.error(f"General chat failed: {e}")
            return f"I'm having trouble processing your request right now. Error: {str(e)}"


# Global LangGraph coordinator instance
langgraph_coordinator = LangGraphCoordinator()
