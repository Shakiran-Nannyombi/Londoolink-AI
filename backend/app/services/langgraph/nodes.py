from datetime import datetime
import logging
from langchain_core.messages import HumanMessage
from langchain_groq import ChatGroq

from app.core.config import settings
from .state import AgentState

logger = logging.getLogger(__name__)


class AgentNodes:
    # Collection of agent nodes for LangGraph workflow
    
    def __init__(self):
        self.llm = ChatGroq(
            model="llama3-70b-8192",
            temperature=0.1,
            api_key=settings.GROQ_API_KEY,
            max_tokens=4096
        )
    
    def coordinator_node(self, state: AgentState) -> AgentState:
        # Main coordinator node that orchestrates the multi-agent workflow
        logger.info(f"Coordinator processing step: {state.get('current_step', 'start')}")
        
        current_step = state.get("current_step", "start")
        
        if current_step == "start":
            state["current_step"] = "email"
            state["messages"] = [
                HumanMessage(content=f"Generate daily briefing for user {state['user_id']}")
            ]
        elif current_step == "email_done":
            state["current_step"] = "calendar"
        elif current_step == "calendar_done":
            state["current_step"] = "social"
        elif current_step == "social_done":
            state["current_step"] = "priority"
        elif current_step == "priority_done":
            state["current_step"] = "end"
        
        return state
    
    def email_agent_node(self, state: AgentState) -> AgentState:
        # Email analysis agent node
        logger.info("Running email agent analysis")
        
        try:
            email_prompt = """You are an Email Triage Agent for Londoolink AI. 
            Analyze recent emails for:
            1. Urgent emails requiring immediate attention
            2. Important action items and deadlines
            3. Key communications from important contacts
            4. Email volume and patterns
            
            Use the available tools to search through emails and provide insights.
            Focus on actionable items and time-sensitive communications."""
            
            messages = [HumanMessage(content=email_prompt)]
            response = self.llm.invoke(messages)
            
            state["email_analysis"] = {
                "analysis": response.content,
                "status": "completed",
                "agent_type": "email",
                "timestamp": datetime.utcnow().isoformat()
            }
            state["current_step"] = "email_done"
            
        except Exception as e:
            logger.error(f"Email agent failed: {e}")
            state["email_analysis"] = {
                "analysis": f"Email analysis failed: {str(e)}",
                "status": "error",
                "agent_type": "email"
            }
            state["current_step"] = "email_done"
        
        return state
    
    def calendar_agent_node(self, state: AgentState) -> AgentState:
        # Calendar analysis agent node
        logger.info("Running calendar agent analysis")
        
        try:
            calendar_prompt = """You are a Calendar Analysis Agent for Londoolink AI.
            Analyze upcoming calendar events for:
            1. Today's meetings and appointments
            2. Upcoming deadlines and important events
            3. Scheduling conflicts or overlaps
            4. Meeting preparation requirements
            5. Travel time and logistics
            
            Use available tools to search calendar events and provide insights.
            Focus on time management and preparation needs."""
            
            messages = [HumanMessage(content=calendar_prompt)]
            response = self.llm.invoke(messages)
            
            state["calendar_analysis"] = {
                "analysis": response.content,
                "status": "completed", 
                "agent_type": "calendar",
                "timestamp": datetime.utcnow().isoformat()
            }
            state["current_step"] = "calendar_done"
            
        except Exception as e:
            logger.error(f"Calendar agent failed: {e}")
            state["calendar_analysis"] = {
                "analysis": f"Calendar analysis failed: {str(e)}",
                "status": "error",
                "agent_type": "calendar"
            }
            state["current_step"] = "calendar_done"
        
        return state
    
    def social_agent_node(self, state: AgentState) -> AgentState:
        # Social media analysis agent node
        logger.info("Running social agent analysis")
        
        try:
            social_prompt = """You are a Social Media & Messaging Agent for Londoolink AI.
            Analyze recent messages from various platforms for:
            1. Urgent messages requiring immediate replies
            2. Important conversations (work, family, opportunities)
            3. Messages from key contacts
            4. Social media mentions or notifications
            5. Time-sensitive social interactions
            
            Use available tools to search through social messages and provide insights.
            Focus on relationship management and urgent communications."""
            
            messages = [HumanMessage(content=social_prompt)]
            response = self.llm.invoke(messages)
            
            state["social_analysis"] = {
                "analysis": response.content,
                "status": "completed",
                "agent_type": "social", 
                "timestamp": datetime.utcnow().isoformat()
            }
            state["current_step"] = "social_done"
            
        except Exception as e:
            logger.error(f"Social agent failed: {e}")
            state["social_analysis"] = {
                "analysis": f"Social analysis failed: {str(e)}",
                "status": "error",
                "agent_type": "social"
            }
            state["current_step"] = "social_done"
        
        return state
    
    def priority_agent_node(self, state: AgentState) -> AgentState:
        # Priority synthesis and briefing agent node
        logger.info("Running priority agent synthesis")
        
        try:
            # Gather all analyses
            email_analysis = state.get("email_analysis", {}).get("analysis", "No email analysis")
            calendar_analysis = state.get("calendar_analysis", {}).get("analysis", "No calendar analysis")
            social_analysis = state.get("social_analysis", {}).get("analysis", "No social analysis")
            
            priority_prompt = f"""You are the Master Prioritization Agent for Londoolink AI.
            
            Based on the following analyses from specialized agents, create a comprehensive daily briefing:
            
            EMAIL ANALYSIS:
            {email_analysis}
            
            CALENDAR ANALYSIS:
            {calendar_analysis}
            
            SOCIAL ANALYSIS:
            {social_analysis}
            
            Create a prioritized daily briefing that includes:
            1. TOP PRIORITIES: Most urgent items requiring immediate attention
            2. TODAY'S SCHEDULE: Key meetings and time blocks
            3. ACTION ITEMS: Specific tasks with deadlines
            4. COMMUNICATIONS: Important messages to respond to
            5. PREPARATION NEEDED: Items requiring advance preparation
            6. STRATEGIC INSIGHTS: Patterns and recommendations
            
            Be concise but comprehensive. Focus on actionable items."""
            
            messages = [HumanMessage(content=priority_prompt)]
            response = self.llm.invoke(messages)
            
            state["priority_recommendations"] = {
                "analysis": response.content,
                "status": "completed",
                "agent_type": "priority",
                "timestamp": datetime.utcnow().isoformat()
            }
            
            state["final_briefing"] = response.content
            state["current_step"] = "priority_done"
            
        except Exception as e:
            logger.error(f"Priority agent failed: {e}")
            state["priority_recommendations"] = {
                "analysis": f"Priority synthesis failed: {str(e)}",
                "status": "error",
                "agent_type": "priority"
            }
            state["final_briefing"] = f"Briefing generation failed: {str(e)}"
            state["current_step"] = "priority_done"
        
        return state
