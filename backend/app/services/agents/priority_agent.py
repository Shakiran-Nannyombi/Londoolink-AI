import logging
from typing import Any, Dict, List, Optional


from langchain_google_genai import ChatGoogleGenerativeAI

from app.core.config import settings
from app.services.backboard.backboard_service import (
    BackboardService,
    BackboardServiceError,
)

logger = logging.getLogger(__name__)


class PriorityAgent:
    # Master Prioritization Agent for synthesizing insights and creating daily briefings

    def __init__(self, tools: List):
        self.tools = tools
        self.agent = self._create_agent()
        
        # Initialize Backboard service if enabled
        self.backboard = None
        if settings.USE_BACKBOARD and settings.BACKBOARD_API_KEY:
            try:
                self.backboard = BackboardService(
                    api_key=settings.BACKBOARD_API_KEY,
                    base_url=settings.BACKBOARD_BASE_URL
                )
                logger.info("Priority Agent initialized with Backboard support")
            except BackboardServiceError as e:
                logger.error(f"Failed to initialize Backboard service: {e}")
                # Continue without Backboard support

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
        self,
        user_id: int,
        email_analysis: str,
        calendar_analysis: str,
        social_analysis: str,
        notion_analysis: str = ""
    ) -> Dict[str, Any]:
        """Create a comprehensive daily briefing from all agent analyses.
        
        Args:
            user_id: User identifier for querying preferences
            email_analysis: Analysis from Email Agent
            calendar_analysis: Analysis from Calendar Agent
            social_analysis: Analysis from Social Agent
            notion_analysis: Optional analysis from Notion Agent
            
        Returns:
            Dictionary containing briefing analysis, thread_id, status, and degraded flag
        """
        # Query user preferences from Backboard memory
        user_preferences = []
        if self.backboard:
            try:
                assistant_id = self.backboard.get_or_create_assistant(user_id)
                memories = self.backboard.query_memory(
                    assistant_id,
                    "user preferences and priorities"
                )
                user_preferences = [m["content"] for m in memories]
                logger.info(f"Retrieved {len(user_preferences)} user preferences for user {user_id}")
            except BackboardServiceError as e:
                logger.error(f"Failed to query user memory: {e}")
                # Continue without preferences
        
        # Build context with all analyses
        context = f"""
        Email Analysis: {email_analysis}
        Calendar Analysis: {calendar_analysis}
        Social Messaging Analysis: {social_analysis}
        """
        
        if notion_analysis:
            context += f"\nNotion Analysis: {notion_analysis}"
        
        # Add user preferences to context if available
        if user_preferences:
            preferences_text = "\n".join(f"- {pref}" for pref in user_preferences)
            context += f"\n\nUser Preferences:\n{preferences_text}"
            prompt = f"""Based on the following analysis and user preferences, create a prioritized daily briefing with actionable recommendations.
            
Pay special attention to the user's stated preferences when prioritizing items.

{context}"""
        else:
            prompt = f"Based on the following analysis, create a prioritized daily briefing with actionable recommendations:\n{context}"
        
        # Generate briefing
        briefing_result = self.analyze(prompt)
        briefing_content = briefing_result.get("analysis", "")
        
        # Create thread for follow-up questions
        thread_id = None
        if self.backboard:
            try:
                thread_id = self.backboard.create_thread(
                    user_id=user_id,
                    thread_type="daily",
                    initial_message=briefing_content
                )
                logger.info(f"Created thread for briefing: thread_id={thread_id}")
            except BackboardServiceError as e:
                logger.error(f"Failed to create thread: {e}")
                # Continue without thread support
        
        # Return briefing with thread information
        return {
            "analysis": briefing_content,
            "thread_id": thread_id,
            "status": briefing_result.get("status", "completed"),
            "degraded": thread_id is None and self.backboard is not None,  # Indicate degraded service
            "agent_type": "priority"
        }

    def answer_followup(
        self,
        thread_id: str,
        question: str
    ) -> str:
        """Answer follow-up question using thread context.
        
        Args:
            thread_id: Thread identifier for retrieving conversation history
            question: User's follow-up question
            
        Returns:
            Generated response to the follow-up question
            
        Raises:
            ValueError: If Backboard is not initialized or thread_id is invalid
        """
        if not self.backboard:
            raise ValueError("Backboard service is not initialized. Cannot answer follow-up questions.")
        
        try:
            # Retrieve thread history for context
            thread_history = self.backboard.get_thread_history(thread_id)
            
            if not thread_history:
                raise ValueError(f"No thread history found for thread_id: {thread_id}")
            
            # Build context from thread history
            context_messages = []
            for msg in thread_history:
                role = msg.get("role", "unknown")
                content = msg.get("content", "")
                context_messages.append(f"{role.capitalize()}: {content}")
            
            context = "\n\n".join(context_messages)
            
            # Generate response using thread context
            prompt = f"""Based on the following conversation history, answer the user's follow-up question.

Conversation History:
{context}

User's Follow-up Question: {question}

Please provide a helpful and contextual response based on the conversation history above."""
            
            response_result = self.analyze(prompt)
            response_content = response_result.get("analysis", "")
            
            # Add user question to thread
            self.backboard.add_message(
                thread_id=thread_id,
                role="user",
                content=question
            )
            
            # Add assistant response to thread
            self.backboard.add_message(
                thread_id=thread_id,
                role="assistant",
                content=response_content
            )
            
            logger.info(f"Answered follow-up question for thread {thread_id}")
            return response_content
            
        except BackboardServiceError as e:
            logger.error(f"Failed to answer follow-up question: {e}")
            raise ValueError(f"Failed to retrieve thread history or add messages: {str(e)}")

    def analyze_document(
        self, content: str, document_type: str = "general"
    ) -> Dict[str, Any]:
        # Analyze a general document and provide insights
        prompt = (
            f"Analyze this {document_type} document and provide insights:\n\n{content}"
        )
        return self.analyze(prompt)
