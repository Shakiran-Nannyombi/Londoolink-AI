from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode

from app.services.tools import get_all_tools
from .state import AgentState
from .nodes import AgentNodes
from .routing import WorkflowRouting


class WorkflowBuilder:
    # Builds the LangGraph workflow
    
    def __init__(self):
        self.tools = get_all_tools()
        self.agent_nodes = AgentNodes()
        self.routing = WorkflowRouting()
    
    def build_workflow(self) -> StateGraph:
        # Create the LangGraph workflow for multi-agent coordination
        workflow = StateGraph(AgentState)
        
        # Add nodes for each agent
        workflow.add_node("email_agent", self.agent_nodes.email_agent_node)
        workflow.add_node("calendar_agent", self.agent_nodes.calendar_agent_node)
        workflow.add_node("social_agent", self.agent_nodes.social_agent_node)
        workflow.add_node("priority_agent", self.agent_nodes.priority_agent_node)
        workflow.add_node("coordinator", self.agent_nodes.coordinator_node)
        
        # Add tool node for RAG operations
        tool_node = ToolNode(self.tools)
        workflow.add_node("tools", tool_node)
        
        # Define the workflow edges
        workflow.set_entry_point("coordinator")
        
        # Coordinator decides which agents to run
        workflow.add_conditional_edges(
            "coordinator",
            self.routing.route_to_agents,
            {
                "email": "email_agent",
                "calendar": "calendar_agent", 
                "social": "social_agent",
                "priority": "priority_agent",
                "end": END
            }
        )
        
        # All agents can use tools or go to priority agent
        for agent in ["email_agent", "calendar_agent", "social_agent"]:
            workflow.add_conditional_edges(
                agent,
                self.routing.should_use_tools,
                {
                    "tools": "tools",
                    "priority": "priority_agent"
                }
            )
        
        # Tools go back to coordinator
        workflow.add_edge("tools", "coordinator")
        
        # Priority agent creates final briefing and ends
        workflow.add_edge("priority_agent", END)
        
        return workflow.compile()
