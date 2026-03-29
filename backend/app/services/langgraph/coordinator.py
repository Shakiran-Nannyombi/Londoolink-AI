import logging
import gc
import os
import psutil
from datetime import datetime
from typing import Any, Dict, Optional

from langchain_core.messages import HumanMessage
from langchain_google_genai import ChatGoogleGenerativeAI

from app.core.config import settings
from app.utils.text_formatter import clean_ai_response

from .state import AgentState, create_initial_state
from .workflow import WorkflowBuilder

logger = logging.getLogger(__name__)

# Memory threshold in MB
MEMORY_THRESHOLD = 300  # MB

class MemoryManager:
    @staticmethod
    def get_memory_usage() -> float:
        """Get current process memory usage in MB"""
        process = psutil.Process(os.getpid())
        return process.memory_info().rss / (1024 * 1024)  # Convert to MB

    @staticmethod
    def check_memory() -> bool:
        """Check if memory usage is below threshold"""
        return MemoryManager.get_memory_usage() < MEMORY_THRESHOLD

    @staticmethod
    def free_memory():
        """Force garbage collection"""
        gc.collect()


class LangGraphCoordinator:
    """LangGraph coordinator with configurable model sizes and memory optimization.
    
    Available model sizes:
    - small: Faster, lower memory usage (default)
    - medium: Balanced performance and accuracy
    - large: Best accuracy, highest memory usage
    """
    
    MODEL_CONFIGS = {
        'small': {
            'model_name': 'gemini-3.0-flash',
            'max_tokens': 4096,
            'temperature': 0.1,
            'timeout': 60
        },
        'medium': {
            'model_name': 'gemini-3.0-pro',
            'max_tokens': 16384,
            'temperature': 0.2,
            'timeout': 90
        },
        'large': {
            'model_name': 'gemini-3.0-pro',
            'max_tokens': 32768,
            'temperature': 0.3,
            'timeout': 120
        }
    }

    def __init__(self, model_size: str = 'small'):
        """Initialize the coordinator with a specific model size.
        
        Args:
            model_size: One of 'small', 'medium', or 'large'
        """
        self.workflow_builder = None
        self.graph = None
        self._llm = None
        self.model_size = model_size.lower()
        if self.model_size not in self.MODEL_CONFIGS:
            logger.warning(f"Invalid model size '{model_size}'. Defaulting to 'small'")
            self.model_size = 'small'

    @property
    def llm(self):
        if self._llm is None:
            self._llm = self._create_llm()
        return self._llm

    def _create_llm(self):
        """Create the main LLM with configuration based on model size."""
        config = self.MODEL_CONFIGS[self.model_size]
        logger.info(f"Loading {self.model_size} model with config: {config}")
        
        return ChatGoogleGenerativeAI(
            model=config['model_name'],
            temperature=config['temperature'],
            google_api_key=settings.GEMINI_API_KEY,
            max_output_tokens=config['max_tokens'],
            request_timeout=config['timeout'],
        )

    def cleanup(self):
        """Clean up resources"""
        if self._llm is not None:
            del self._llm
            self._llm = None
        if self.graph is not None:
            del self.graph
            self.graph = None
        if self.workflow_builder is not None:
            del self.workflow_builder
            self.workflow_builder = None
        MemoryManager.free_memory()

    def get_daily_briefing(self, user_id: int) -> Dict[str, Any]:
        # Generate daily briefing using LangGraph multi-agent workflow
        try:
            logger.info(f"Starting LangGraph daily briefing for user {user_id}")

            # Build graph lazily if not yet initialized
            if self.graph is None:
                from app.services.langgraph.workflow import WorkflowBuilder
                self.workflow_builder = WorkflowBuilder()
                self.graph = self.workflow_builder.build_workflow()

            # Initialize state
            initial_state = create_initial_state(user_id)

            # Run the workflow
            result = self.graph.invoke(initial_state)

            briefing = {
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

            # Send SMS for urgent items
            import asyncio
            asyncio.create_task(self._send_urgent_sms(user_id, briefing))

            return briefing

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

    async def _send_urgent_sms(self, user_id: int, briefing: Dict[str, Any]) -> None:
        """Send SMS alerts for urgent priority items."""
        try:
            from app.db.session import SessionLocal
            from app.models.user import User
            from app.services.sms_service import send_urgent_alert

            db = SessionLocal()
            try:
                user = db.query(User).filter(User.id == user_id).first()
                if not user or not user.phone_number:
                    return

                priority = briefing.get("priority_recommendations", {})
                summary = priority.get("summary", "") or briefing.get("summary", "")

                # Check if urgent keywords present
                urgent_keywords = ["urgent", "critical", "immediate", "asap", "deadline today"]
                is_urgent = any(kw in summary.lower() for kw in urgent_keywords)

                if is_urgent:
                    await send_urgent_alert(
                        phone_number=user.phone_number,
                        task_title="Urgent Task Detected",
                        task_description=summary,
                    )
            finally:
                db.close()
        except Exception as e:
            logger.error(f"Failed to send urgent SMS: {e}")

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
            if document_type == 'video':
               # Pass through to Gemini 3.0 Pro's video handling capabilities if implemented directly here,
               # otherwise just use the text prompt which describes the video URL or Context.
               # For now, we utilize the prompt.
               agent_type = "video"
               prompt = f"Analyze this video context:\n\n{content}"  
            messages = [HumanMessage(content=prompt)]
            response = self.llm.invoke(messages)

            return {
                "analysis": clean_ai_response(response.content),
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
            
            Keep your response brief and friendly (2-3 sentences max). Be casual and helpful."""
            
            response = self.llm.invoke([HumanMessage(content=prompt)])
            return clean_ai_response(response.content)
            
        except Exception as e:
            logger.error(f"Email agent chat failed: {e}")
            return f"I'm having trouble processing your request right now. Error: {str(e)}"

    def chat_with_calendar_agent(self, user_id: int, message: str) -> str:
        """Chat with the calendar agent"""
        try:
            logger.info(f"Calendar agent chat for user {user_id}: {message[:50]}...")
            
            prompt = f"""You are a Calendar Management Agent. Help the user with scheduling and time management.
            
            User message: {message}
            
            Keep your response brief and friendly (2-3 sentences max). Be casual and helpful."""
            
            response = self.llm.invoke([HumanMessage(content=prompt)])
            return clean_ai_response(response.content)
            
        except Exception as e:
            logger.error(f"Calendar agent chat failed: {e}")
            return f"I'm having trouble processing your request right now. Error: {str(e)}"

    def chat_with_priority_agent(self, user_id: int, message: str) -> str:
        """Chat with the priority agent"""
        try:
            logger.info(f"Priority agent chat for user {user_id}: {message[:50]}...")
            
            prompt = f"""You are a Priority Management Agent. Help the user prioritize tasks and manage their workload.
            
            User message: {message}
            
            Keep your response brief and friendly (2-3 sentences max). Be casual and helpful."""
            
            response = self.llm.invoke([HumanMessage(content=prompt)])
            return clean_ai_response(response.content)
            
        except Exception as e:
            logger.error(f"Priority agent chat failed: {e}")
            return f"I'm having trouble processing your request right now. Error: {str(e)}"

    def chat_with_social_agent(self, user_id: int, message: str) -> str:
        """Chat with the social agent"""
        try:
            logger.info(f"Social agent chat for user {user_id}: {message[:50]}...")
            
            prompt = f"""You are a Social Media Management Agent. Help the user with social media and messaging platforms.
            
            User message: {message}
            
            Keep your response brief and friendly (2-3 sentences max). Be casual and helpful."""
            
            response = self.llm.invoke([HumanMessage(content=prompt)])
            return clean_ai_response(response.content)
            
        except Exception as e:
            logger.error(f"Social agent chat failed: {e}")
            return f"I'm having trouble processing your request right now. Error: {str(e)}"

    def general_chat(self, user_id: int, message: str) -> str:
        """General chat functionality"""
        try:
            logger.info(f"General chat for user {user_id}: {message[:50]}...")
            
            prompt = f"""You are Londoolink AI, an intelligent personal assistant. Help the user with their request.
            
            User message: {message}
            
            Keep your response brief and friendly (2-3 sentences max). Be casual and helpful."""
            
            response = self.llm.invoke([HumanMessage(content=prompt)])
            return clean_ai_response(response.content)
            
        except Exception as e:
            logger.error(f"General chat failed: {e}")
            return f"I'm having trouble processing your request right now. Error: {str(e)}"


# Global LangGraph coordinator instance
langgraph_coordinator = LangGraphCoordinator()
