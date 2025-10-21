from .state import AgentState


class WorkflowRouting:
    # Routing logic for LangGraph workflow
    
    @staticmethod
    def route_to_agents(state: AgentState) -> str:
        # Route to appropriate agent based on current step
        current_step = state.get("current_step", "start")
        
        if current_step == "email":
            return "email"
        elif current_step == "calendar":
            return "calendar"
        elif current_step == "social":
            return "social"
        elif current_step == "priority":
            return "priority"
        else:
            return "end"
    
    @staticmethod
    def should_use_tools(state: AgentState) -> str:
        # Determine if agent should use tools or proceed to next step
        # For now, we'll skip tool usage and go directly to priority
        # In a more sophisticated implementation, we could analyze the state
        # to determine if RAG search is needed
        return "priority"
