import pytest
from unittest.mock import Mock, patch

from app.services.agents.email_agent import EmailAgent
from app.services.agents.calendar_agent import CalendarAgent
from app.services.agents.social_agent import SocialAgent
from app.services.agents.priority_agent import PriorityAgent
from app.services.coordinator import AICoordinator
from app.services.tools import get_all_tools


class TestEmailAgent:
    def test_email_agent_init(self, mock_langchain_agent):
        # Test email agent initialization
        tools = []
        agent = EmailAgent(tools)
        
        assert agent.tools == tools
        assert agent.agent is not None
    
    def test_email_agent_analyze(self, mock_langchain_agent):
        # Test email analysis
        tools = []
        agent = EmailAgent(tools)
        prompt = "Analyze this email for urgency"
        
        result = agent.analyze(prompt)
        
        assert isinstance(result, dict)
        assert "analysis" in result
        assert "status" in result
        assert "agent_type" in result
        assert result["agent_type"] == "email"
        assert result["status"] == "completed"
    
    def test_email_agent_analyze_error(self, mock_langchain_agent):
        # Test email analysis with error
        tools = []
        agent = EmailAgent(tools)
        
        # Mock agent to raise exception
        agent.agent.invoke.side_effect = Exception("Test error")
        
        result = agent.analyze("test prompt")
        
        assert result["status"] == "error"
        assert "Test error" in result["analysis"]
    
    def test_email_agent_daily_insights(self, mock_langchain_agent):
        # Test getting daily email insights
        tools = []
        agent = EmailAgent(tools)
        
        result = agent.get_daily_insights()
        
        assert isinstance(result, dict)
        assert "analysis" in result
        assert result["agent_type"] == "email"


class TestCalendarAgent:
    def test_calendar_agent_init(self, mock_langchain_agent):
        # Test calendar agent initialization
        tools = []
        agent = CalendarAgent(tools)
        
        assert agent.tools == tools
        assert agent.agent is not None
    
    def test_calendar_agent_analyze(self, mock_langchain_agent):
        # Test calendar analysis
        tools = []
        agent = CalendarAgent(tools)
        prompt = "Analyze this calendar event"
        
        result = agent.analyze(prompt)
        
        assert isinstance(result, dict)
        assert "analysis" in result
        assert "status" in result
        assert "agent_type" in result
        assert result["agent_type"] == "calendar"
        assert result["status"] == "completed"
    
    def test_calendar_agent_daily_insights(self, mock_langchain_agent):
        # Test getting daily calendar insights
        tools = []
        agent = CalendarAgent(tools)
        
        result = agent.get_daily_insights()
        
        assert isinstance(result, dict)
        assert "analysis" in result
        assert result["agent_type"] == "calendar"


class TestSocialAgent:
    def test_social_agent_init(self, mock_langchain_agent):
        # Test social agent initialization
        tools = []
        agent = SocialAgent(tools)
        
        assert agent.tools == tools
        assert agent.agent is not None
    
    def test_social_agent_analyze(self, mock_langchain_agent):
        # Test social message analysis
        tools = []
        agent = SocialAgent(tools)
        prompt = "Analyze this social message"
        
        result = agent.analyze(prompt)
        
        assert isinstance(result, dict)
        assert "analysis" in result
        assert "status" in result
        assert "agent_type" in result
        assert result["agent_type"] == "social"
        assert result["status"] == "completed"
    
    def test_social_agent_analyze_message(self, mock_langchain_agent):
        # Test analyzing specific message
        tools = []
        agent = SocialAgent(tools)
        content = "Hey, how are you?"
        platform = "whatsapp"
        
        result = agent.analyze_message(content, platform)
        
        assert isinstance(result, dict)
        assert "analysis" in result
        assert result["agent_type"] == "social"
    
    def test_social_agent_daily_insights(self, mock_langchain_agent):
        # Test getting daily social insights
        tools = []
        agent = SocialAgent(tools)
        
        result = agent.get_daily_insights()
        
        assert isinstance(result, dict)
        assert "analysis" in result
        assert result["agent_type"] == "social"


class TestPriorityAgent:
    def test_priority_agent_init(self, mock_langchain_agent):
        # Test priority agent initialization
        tools = []
        agent = PriorityAgent(tools)
        
        assert agent.tools == tools
        assert agent.agent is not None
    
    def test_priority_agent_analyze(self, mock_langchain_agent):
        # Test priority analysis
        tools = []
        agent = PriorityAgent(tools)
        prompt = "Prioritize these tasks"
        
        result = agent.analyze(prompt)
        
        assert isinstance(result, dict)
        assert "analysis" in result
        assert "status" in result
        assert "agent_type" in result
        assert result["agent_type"] == "priority"
        assert result["status"] == "completed"
    
    def test_priority_agent_create_briefing(self, mock_langchain_agent):
        # Test creating daily briefing
        tools = []
        agent = PriorityAgent(tools)
        
        email_analysis = "Email analysis results"
        calendar_analysis = "Calendar analysis results"
        social_analysis = "Social analysis results"
        
        result = agent.create_briefing(email_analysis, calendar_analysis, social_analysis)
        
        assert isinstance(result, dict)
        assert "analysis" in result
        assert result["agent_type"] == "priority"
    
    def test_priority_agent_analyze_document(self, mock_langchain_agent):
        # Test document analysis
        tools = []
        agent = PriorityAgent(tools)
        content = "This is a test document"
        document_type = "general"
        
        result = agent.analyze_document(content, document_type)
        
        assert isinstance(result, dict)
        assert "analysis" in result
        assert result["agent_type"] == "priority"


class TestAICoordinator:
    @patch('app.services.coordinator.get_all_tools')
    @patch('app.services.coordinator.EmailAgent')
    @patch('app.services.coordinator.CalendarAgent')
    @patch('app.services.coordinator.SocialAgent')
    @patch('app.services.coordinator.PriorityAgent')
    def test_coordinator_init(self, mock_priority, mock_social, mock_calendar, mock_email, mock_tools):
        # Test AI coordinator initialization
        mock_tools.return_value = []
        
        coordinator = AICoordinator()
        
        assert coordinator.tools == []
        mock_email.assert_called_once()
        mock_calendar.assert_called_once()
        mock_social.assert_called_once()
        mock_priority.assert_called_once()
    
    @patch('app.services.coordinator.get_all_tools')
    @patch('app.services.coordinator.EmailAgent')
    @patch('app.services.coordinator.CalendarAgent')
    @patch('app.services.coordinator.SocialAgent')
    @patch('app.services.coordinator.PriorityAgent')
    def test_coordinator_get_daily_briefing(self, mock_priority, mock_social, mock_calendar, mock_email, mock_tools):
        # Test getting daily briefing from coordinator
        mock_tools.return_value = []
        
        # Mock agent responses
        mock_email_instance = Mock()
        mock_email_instance.get_daily_insights.return_value = {
            'analysis': 'Email insights',
            'status': 'completed',
            'agent_type': 'email'
        }
        mock_email.return_value = mock_email_instance
        
        mock_calendar_instance = Mock()
        mock_calendar_instance.get_daily_insights.return_value = {
            'analysis': 'Calendar insights',
            'status': 'completed',
            'agent_type': 'calendar'
        }
        mock_calendar.return_value = mock_calendar_instance
        
        mock_social_instance = Mock()
        mock_social_instance.get_daily_insights.return_value = {
            'analysis': 'Social insights',
            'status': 'completed',
            'agent_type': 'social'
        }
        mock_social.return_value = mock_social_instance
        
        mock_priority_instance = Mock()
        mock_priority_instance.create_briefing.return_value = {
            'analysis': 'Priority briefing',
            'status': 'completed',
            'agent_type': 'priority'
        }
        mock_priority.return_value = mock_priority_instance
        
        coordinator = AICoordinator()
        user_id = 1
        
        result = coordinator.get_daily_briefing(user_id)
        
        assert isinstance(result, dict)
        assert result['user_id'] == user_id
        assert 'generated_at' in result
        assert 'email_insights' in result
        assert 'calendar_insights' in result
        assert 'social_insights' in result
        assert 'priority_recommendations' in result
        assert 'summary' in result
    
    @patch('app.services.coordinator.get_all_tools')
    @patch('app.services.coordinator.EmailAgent')
    @patch('app.services.coordinator.CalendarAgent')
    @patch('app.services.coordinator.SocialAgent')
    @patch('app.services.coordinator.PriorityAgent')
    def test_coordinator_analyze_document_email(self, mock_priority, mock_social, mock_calendar, mock_email, mock_tools):
        # Test document analysis for email
        mock_tools.return_value = []
        
        mock_email_instance = Mock()
        mock_email_instance.analyze.return_value = {
            'analysis': 'Email analysis',
            'status': 'completed',
            'agent_type': 'email'
        }
        mock_email.return_value = mock_email_instance
        
        coordinator = AICoordinator()
        content = "Test email content"
        document_type = "email"
        
        result = coordinator.analyze_document(content, document_type)
        
        assert isinstance(result, dict)
        assert result['agent_type'] == 'email'
        mock_email_instance.analyze.assert_called_once()
    
    @patch('app.services.coordinator.get_all_tools')
    @patch('app.services.coordinator.EmailAgent')
    @patch('app.services.coordinator.CalendarAgent')
    @patch('app.services.coordinator.SocialAgent')
    @patch('app.services.coordinator.PriorityAgent')
    def test_coordinator_analyze_document_social(self, mock_priority, mock_social, mock_calendar, mock_email, mock_tools):
        # Test document analysis for social message
        mock_tools.return_value = []
        
        mock_social_instance = Mock()
        mock_social_instance.analyze_message.return_value = {
            'analysis': 'Social analysis',
            'status': 'completed',
            'agent_type': 'social'
        }
        mock_social.return_value = mock_social_instance
        
        coordinator = AICoordinator()
        content = "Test social message"
        document_type = "whatsapp"
        
        result = coordinator.analyze_document(content, document_type)
        
        assert isinstance(result, dict)
        assert result['agent_type'] == 'social'
        mock_social_instance.analyze_message.assert_called_once_with(content, document_type)
    
    @patch('app.services.coordinator.get_all_tools')
    @patch('app.services.coordinator.EmailAgent')
    @patch('app.services.coordinator.CalendarAgent')
    @patch('app.services.coordinator.SocialAgent')
    @patch('app.services.coordinator.PriorityAgent')
    def test_coordinator_analyze_document_general(self, mock_priority, mock_social, mock_calendar, mock_email, mock_tools):
        # Test document analysis for general document
        mock_tools.return_value = []
        
        mock_priority_instance = Mock()
        mock_priority_instance.analyze_document.return_value = {
            'analysis': 'General analysis',
            'status': 'completed',
            'agent_type': 'priority'
        }
        mock_priority.return_value = mock_priority_instance
        
        coordinator = AICoordinator()
        content = "Test general document"
        document_type = "general"
        
        result = coordinator.analyze_document(content, document_type)
        
        assert isinstance(result, dict)
        assert result['agent_type'] == 'priority'
        mock_priority_instance.analyze_document.assert_called_once_with(content, document_type)


class TestTools:
    @patch('app.services.tools.rag_pipeline')
    def test_get_all_tools(self, mock_rag):
        # Test getting all tools
        tools = get_all_tools()
        
        assert isinstance(tools, list)
        assert len(tools) == 3  # semantic_search, get_recent_documents, get_document_stats
    
    @patch('app.services.tools.rag_pipeline')
    def test_semantic_search_tool(self, mock_rag):
        # Test semantic search tool
        mock_rag.query_texts.return_value = [
            {
                'content': 'Test document',
                'metadata': {'source': 'test', 'timestamp': '2025-10-21T10:00:00Z'}
            }
        ]
        
        tools = get_all_tools()
        semantic_search_tool = tools[0]
        
        result = semantic_search_tool.invoke({"query": "test query"})
        
        assert isinstance(result, str)
        assert "Test document" in result
    
    @patch('app.services.tools.rag_pipeline')
    def test_get_recent_documents_tool(self, mock_rag):
        # Test get recent documents tool
        mock_rag.query_texts.return_value = [
            {
                'content': 'Recent document',
                'metadata': {'source': 'test', 'timestamp': '2025-10-21T10:00:00Z'}
            }
        ]
        
        tools = get_all_tools()
        recent_docs_tool = tools[1]
        
        result = recent_docs_tool.invoke({"days": "7"})
        
        assert isinstance(result, str)
    
    @patch('app.services.tools.rag_pipeline')
    def test_get_document_stats_tool(self, mock_rag):
        # Test get document stats tool
        mock_rag.get_collection_stats.return_value = {
            'total_documents': 10,
            'collection_name': 'test'
        }
        
        tools = get_all_tools()
        stats_tool = tools[2]
        
        result = stats_tool.invoke({"_": ""})
        
        assert isinstance(result, str)
        assert "total_documents" in result
