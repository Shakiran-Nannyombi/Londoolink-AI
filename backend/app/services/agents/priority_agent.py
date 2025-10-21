from langchain.agents import create_agent
from langchain_groq import ChatGroq
from typing import List, Dict, Any
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)


class PriorityAgent:
    # Master Prioritization Agent for synthesizing insights and creating daily briefings
    
    def __init__(self, tools: List):
        self.tools = tools
        self.agent = self._create_agent()
    
    def _create_agent(self):
        # Create the master prioritization agent
        try:
            llm = ChatGroq(
                model="llama3-70b-8192",
                temperature=0.1,
                api_key=settings.GROQ_API_KEY,
                max_tokens=4096
            )
            
            system_prompt = """You are the Master Prioritization Agent for Londoolink AI. Your role is to:
            1. Synthesize insights from email, calendar, and social messaging analysis
            2. Create a prioritized daily briefing
            3. Identify the most important tasks and deadlines
            4. Provide actionable recommendations
            5. Balance professional and personal priorities
            
            You coordinate with other agents and create the final daily briefing.
            Be strategic and focus on what matters most to the user."""
            
            agent = create_agent(
                model=llm,
                tools=self.tools,
                system_prompt=system_prompt
            )
            
            logger.info("Priority agent created successfully")
            return agent
            
        except Exception as e:
            logger.error(f"Failed to create priority agent: {e}")
            raise
    
    def analyze(self, prompt: str) -> Dict[str, Any]:
        # Analyze and prioritize based on the given prompt
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
                'agent_type': 'priority'
            }
            
        except Exception as e:
            logger.error(f"Priority analysis failed: {e}")
            return {
                'analysis': f'Priority analysis failed: {str(e)}',
                'status': 'error',
                'agent_type': 'priority'
            }
    
    def create_briefing(self, email_analysis: str, calendar_analysis: str, social_analysis: str) -> Dict[str, Any]:
        # Create a comprehensive daily briefing from all agent analyses
        context = f"""
        Email Analysis: {email_analysis}
        Calendar Analysis: {calendar_analysis}
        Social Messaging Analysis: {social_analysis}
        """
        
        prompt = f"Based on the following analysis, create a prioritized daily briefing with actionable recommendations:\n{context}"
        return self.analyze(prompt)
    
    def analyze_document(self, content: str, document_type: str = "general") -> Dict[str, Any]:
        # Analyze a general document and provide insights
        prompt = f"Analyze this {document_type} document and provide insights:\n\n{content}"
        return self.analyze(prompt)
