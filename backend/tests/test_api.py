import pytest
from unittest.mock import patch, Mock
from fastapi import status

from app.schemas.user import UserCreate, UserLogin
from app.schemas.message import EmailMessage, CalendarEvent, WhatsAppMessage


class TestAuthEndpoints:
    def test_register_user_success(self, client, db_session):
        # Test successful user registration
        user_data = {
            "email": "newuser@example.com",
            "password": "strongpassword123"
        }
        
        response = client.post("/api/v1/auth/register", json=user_data)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["email"] == user_data["email"]
        assert "user_id" in data
        assert data["message"] == "User registered successfully"
    
    def test_register_user_duplicate_email(self, client, test_user):
        # Test registration with existing email
        user_data = {
            "email": test_user.email,
            "password": "strongpassword123"
        }
        
        response = client.post("/api/v1/auth/register", json=user_data)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Email already registered" in response.json()["detail"]
    
    def test_login_user_success(self, client, test_user):
        # Test successful user login
        login_data = {
            "email": test_user.email,
            "password": "testpassword123"
        }
        
        response = client.post("/api/v1/auth/login", json=login_data)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
    
    def test_login_user_invalid_credentials(self, client, test_user):
        # Test login with invalid credentials
        login_data = {
            "email": test_user.email,
            "password": "wrongpassword"
        }
        
        response = client.post("/api/v1/auth/login", json=login_data)
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert "Incorrect email or password" in response.json()["detail"]
    
    def test_login_user_nonexistent(self, client):
        # Test login with non-existent user
        login_data = {
            "email": "nonexistent@example.com",
            "password": "password123"
        }
        
        response = client.post("/api/v1/auth/login", json=login_data)
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


class TestAgentEndpoints:
    def test_health_check(self, client):
        # Test agent health check endpoint
        response = client.get("/api/v1/agent/health")
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["status"] == "ok"
        assert data["service"] == "Londoolink AI Agent"
    
    @patch('app.api.endpoints.agent.ai_coordinator')
    def test_get_daily_briefing_success(self, mock_coordinator, client, auth_headers):
        # Test successful daily briefing retrieval
        mock_coordinator.get_daily_briefing.return_value = {
            "user_id": 1,
            "summary": "Test briefing",
            "email_insights": {"analysis": "Email analysis"},
            "calendar_insights": {"analysis": "Calendar analysis"},
            "social_insights": {"analysis": "Social analysis"}
        }
        
        response = client.get("/api/v1/agent/briefing/daily", headers=auth_headers)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "briefing" in data
        assert data["briefing"]["summary"] == "Test briefing"
    
    def test_get_daily_briefing_unauthorized(self, client):
        # Test daily briefing without authentication
        response = client.get("/api/v1/agent/briefing/daily")
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_get_current_user_info(self, client, auth_headers, test_user):
        # Test getting current user information
        response = client.get("/api/v1/agent/users/me", headers=auth_headers)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["email"] == test_user.email
        assert data["id"] == test_user.id
    
    @patch('app.api.endpoints.agent.rag_pipeline')
    def test_get_rag_stats(self, mock_rag, client, auth_headers):
        # Test getting RAG statistics
        mock_rag.get_collection_stats.return_value = {
            "total_documents": 10,
            "collection_name": "test_collection"
        }
        
        response = client.get("/api/v1/agent/rag/stats", headers=auth_headers)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "rag_stats" in data
        assert data["rag_stats"]["total_documents"] == 10
    
    @patch('app.api.endpoints.agent.rag_pipeline')
    def test_semantic_search_success(self, mock_rag, client, auth_headers):
        # Test successful semantic search
        mock_rag.query_texts.return_value = [
            {
                "id": "doc1",
                "content": "Test document",
                "metadata": {"source": "test"}
            }
        ]
        
        search_data = {
            "query": "test query",
            "n_results": 5
        }
        
        response = client.post("/api/v1/agent/rag/search", json=search_data, headers=auth_headers)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "results" in data
        assert len(data["results"]) == 1
    
    def test_semantic_search_missing_query(self, client, auth_headers):
        # Test semantic search without query
        search_data = {}
        
        response = client.post("/api/v1/agent/rag/search", json=search_data, headers=auth_headers)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Query is required" in response.json()["detail"]
    
    @patch('app.api.endpoints.agent.ai_coordinator')
    def test_analyze_document_success(self, mock_coordinator, client, auth_headers):
        # Test successful document analysis
        mock_coordinator.analyze_document.return_value = {
            "analysis": "Document analysis result",
            "status": "completed",
            "agent_type": "email"
        }
        
        document_data = {
            "content": "Test document content",
            "type": "email"
        }
        
        response = client.post("/api/v1/agent/analyze/document", json=document_data, headers=auth_headers)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "analysis" in data
        assert data["analysis"]["status"] == "completed"
    
    def test_analyze_document_missing_content(self, client, auth_headers):
        # Test document analysis without content
        document_data = {"type": "email"}
        
        response = client.post("/api/v1/agent/analyze/document", json=document_data, headers=auth_headers)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Document content is required" in response.json()["detail"]


class TestIngestEndpoints:
    @patch('app.api.endpoints.ingest.rag_pipeline')
    def test_ingest_email_success(self, mock_rag, client, auth_headers, sample_email_data):
        # Test successful email ingestion
        mock_rag.add_text.return_value = ["doc_id_1"]
        
        response = client.post("/api/v1/ingest/email", json=sample_email_data, headers=auth_headers)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["status"] == "success"
        assert "document_ids" in data
        mock_rag.add_text.assert_called_once()
    
    @patch('app.api.endpoints.ingest.rag_pipeline')
    def test_ingest_calendar_success(self, mock_rag, client, auth_headers, sample_calendar_data):
        # Test successful calendar ingestion
        mock_rag.add_text.return_value = ["doc_id_1"]
        
        response = client.post("/api/v1/ingest/calendar", json=sample_calendar_data, headers=auth_headers)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["status"] == "success"
        assert "document_ids" in data
        mock_rag.add_text.assert_called_once()
    
    @patch('app.api.endpoints.ingest.rag_pipeline')
    def test_ingest_whatsapp_success(self, mock_rag, client, auth_headers):
        # Test successful WhatsApp message ingestion
        mock_rag.add_text.return_value = ["doc_id_1"]
        
        whatsapp_data = {
            "content": "Hello from WhatsApp",
            "sender": "John Doe",
            "phone_number": "+1234567890",
            "contact_name": "John",
            "chat_name": "Personal Chat",
            "timestamp": "2025-10-21T16:00:00Z",
            "message_type": "text",
            "is_group_chat": False
        }
        
        response = client.post("/api/v1/ingest/whatsapp", json=whatsapp_data, headers=auth_headers)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["status"] == "success"
        mock_rag.add_text.assert_called_once()
    
    @patch('app.api.endpoints.ingest.rag_pipeline')
    def test_ingest_instagram_success(self, mock_rag, client, auth_headers):
        # Test successful Instagram message ingestion
        mock_rag.add_text.return_value = ["doc_id_1"]
        
        instagram_data = {
            "content": "Hello from Instagram",
            "username": "johndoe",
            "timestamp": "2025-10-21T16:00:00Z",
            "message_type": "text",
            "is_story_reply": False
        }
        
        response = client.post("/api/v1/ingest/instagram", json=instagram_data, headers=auth_headers)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["status"] == "success"
        mock_rag.add_text.assert_called_once()
    
    @patch('app.api.endpoints.ingest.rag_pipeline')
    def test_ingest_telegram_success(self, mock_rag, client, auth_headers):
        # Test successful Telegram message ingestion
        mock_rag.add_text.return_value = ["doc_id_1"]
        
        telegram_data = {
            "content": "Hello from Telegram",
            "sender": "John Doe",
            "username": "johndoe",
            "chat_name": "Personal Chat",
            "timestamp": "2025-10-21T16:00:00Z",
            "message_type": "text",
            "is_group_chat": False,
            "is_bot_message": False
        }
        
        response = client.post("/api/v1/ingest/telegram", json=telegram_data, headers=auth_headers)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["status"] == "success"
        mock_rag.add_text.assert_called_once()
    
    @patch('app.api.endpoints.ingest.rag_pipeline')
    def test_ingest_generic_message_success(self, mock_rag, client, auth_headers):
        # Test successful generic message ingestion
        mock_rag.add_text.return_value = ["doc_id_1"]
        
        generic_data = {
            "content": "Generic message content",
            "source": "custom_platform",
            "sender": "User",
            "timestamp": "2025-10-21T16:00:00Z",
            "message_type": "text"
        }
        
        response = client.post("/api/v1/ingest/message", json=generic_data, headers=auth_headers)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["status"] == "success"
        mock_rag.add_text.assert_called_once()
    
    def test_ingest_email_unauthorized(self, client, sample_email_data):
        # Test email ingestion without authentication
        response = client.post("/api/v1/ingest/email", json=sample_email_data)
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    @patch('app.api.endpoints.ingest.rag_pipeline')
    def test_delete_documents_success(self, mock_rag, client, auth_headers):
        # Test successful document deletion
        mock_rag.delete_documents.return_value = 5
        
        filter_data = {"source": "test"}
        
        response = client.post("/api/v1/ingest/delete", json=filter_data, headers=auth_headers)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["status"] == "success"
        assert data["deleted_count"] == 5


class TestSecurityEndpoints:
    @patch('app.api.endpoints.security.security_validator')
    def test_security_health_check(self, mock_validator, client, auth_headers):
        # Test security health check
        mock_validator.validate_all.return_value = {
            'is_secure': True,
            'issues': [],
            'warnings': [],
            'total_issues': 0,
            'total_warnings': 0
        }
        mock_validator.get_security_score.return_value = 95
        mock_validator.get_recommendations.return_value = []
        
        response = client.get("/api/v1/security/health", headers=auth_headers)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["is_secure"] is True
        assert data["security_score"] == 95
        assert data["status"] == "success"
    
    def test_security_health_check_unauthorized(self, client):
        # Test security health check without authentication
        response = client.get("/api/v1/security/health")
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    def test_generate_security_keys(self, client, auth_headers):
        # Test security key generation
        response = client.post("/api/v1/security/generate-keys", headers=auth_headers)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "keys" in data
        assert "SECRET_KEY" in data["keys"]
        assert "ENCRYPTION_KEY" in data["keys"]
        assert data["status"] == "success"
    
    @patch('app.api.endpoints.security.security_validator')
    def test_validate_security_config(self, mock_validator, client, auth_headers):
        # Test security configuration validation
        mock_validator.validate_all.return_value = {
            'is_secure': True,
            'issues': [],
            'warnings': ['Minor warning'],
            'total_issues': 0,
            'total_warnings': 1
        }
        mock_validator.get_security_score.return_value = 90
        mock_validator.get_recommendations.return_value = ["Fix minor warning"]
        
        response = client.get("/api/v1/security/config-validation", headers=auth_headers)
        
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "validation_results" in data
        assert data["security_score"] == 90
        assert len(data["recommendations"]) == 1
