from typing import Annotated, Any, Dict, List, Optional, TypedDict

from langchain_core.messages import BaseMessage


class AgentState(TypedDict):
    # The main state that flows through our multi-agent system
    messages: Annotated[List[BaseMessage], "The conversation messages"]
    user_id: int
    user_query: str
    email_analysis: Dict[str, Any]
    calendar_analysis: Dict[str, Any]
    social_analysis: Dict[str, Any]
    notion_analysis: Dict[str, Any]
    priority_recommendations: Dict[str, Any]
    final_briefing: str
    current_step: str
    error: str
    auth0_sub: str
    step_up_token: Optional[str]


def create_initial_state(
    user_id: int, user_query: str = "Generate daily briefing", auth0_sub: str = ""
) -> AgentState:
    # Create initial state for workflow
    return AgentState(
        messages=[],
        user_id=user_id,
        user_query=user_query,
        email_analysis={},
        calendar_analysis={},
        social_analysis={},
        notion_analysis={},
        priority_recommendations={},
        final_briefing="",
        current_step="start",
        error="",
        auth0_sub=auth0_sub,
        step_up_token=None,
    )
