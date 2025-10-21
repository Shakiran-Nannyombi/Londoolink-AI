from langchain.agents import create_agent
from langchain_groq import ChatGroq
from typing import List, Dict, Any
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)


class CalendarAgent:
    # Calendar Analysis Agent for analyzing meetings and events
    
    def __init__(self, tools: List):
        self.tools = tools
        self.agent = self._create_agent()
    
    def _create_agent(self):
        # Create the calendar analysis agent
        try:
            llm = ChatGroq(
                model="llama3-70b-8192",
                temperature=0.1,
                api_key=settings.GROQ_API_KEY,
                max_tokens=4096
            )
            
            system_prompt = """You are a Calendar Analysis Agent for Londoolink AI. Your role is to:
            1. Analyze upcoming meetings and events
            2. Identify scheduling conflicts
            3. Suggest optimal time management
            4. Highlight important deadlines and commitments
            
            Use the available tools to search through calendar events and provide insights.
            Focus on helping the user manage their time effectively."""
            
            agent = create_agent(
                model=llm,
                tools=self.tools,
                system_prompt=system_prompt
            )
            
            logger.info("Calendar agent created successfully")
            return agent
            
        except Exception as e:
            logger.error(f"Failed to create calendar agent: {e}")
            raise
    
    def analyze(self, prompt: str) -> Dict[str, Any]:
        # Analyze calendar events based on the given prompt
        try:
            result = self.agent.invoke({
                "messages": [{
                    "role": "user", 
                    "content": prompt
                }]
            })
            
            return {
                'analysis': result.get('messages', [{}])[-1].get('content', 'No analysis available'),
                'status': 'completed',
                'agent_type': 'calendar'
            }
            
        except Exception as e:
            logger.error(f"Calendar analysis failed: {e}")
            return {
                'analysis': f'Calendar analysis failed: {str(e)}',
                'status': 'error',
                'agent_type': 'calendar'
            }
    
    def get_daily_insights(self) -> Dict[str, Any]:
        # Get daily calendar insights
        prompt = "Analyze upcoming calendar events, meetings, and deadlines. Identify any conflicts or important items requiring attention."
        return self.analyze(prompt)
