"""Unit tests for BackboardService class structure."""

import pytest
from unittest.mock import Mock, patch
from app.services.backboard import (
    BackboardService,
    BackboardError,
    BackboardServiceError,
    BackboardAPIError,
    BackboardAuthError,
    BackboardNotFoundError,
    BackboardRateLimitError,
    BackboardServiceUnavailableError,
)


class TestBackboardServiceInit:
    """Test BackboardService initialization."""
    
    def test_init_with_valid_api_key(self):
        """Test successful initialization with valid API key."""
        service = BackboardService(api_key="espr_test_key_123")
        
        assert service.api_key == "espr_test_key_123"
        assert service.base_url == "https://app.backboard.io/api"
    
    def test_init_with_custom_base_url(self):
        """Test initialization with custom base URL."""
        service = BackboardService(
            api_key="espr_test_key_123",
            base_url="https://test.backboard.io/v1"
        )
        
        assert service.base_url == "https://test.backboard.io/v1"
    
    def test_init_raises_error_on_missing_api_key(self):
        """Test that initialization fails with missing API key."""
        with pytest.raises(BackboardServiceError) as exc_info:
            BackboardService(api_key="")
        
        assert "BACKBOARD_API_KEY is required" in str(exc_info.value)
    
    def test_init_raises_error_on_invalid_api_key_prefix(self):
        """Test that initialization fails with invalid API key prefix."""
        with pytest.raises(BackboardServiceError) as exc_info:
            BackboardService(api_key="invalid_key_123")
        
        assert "must start with 'espr_' prefix" in str(exc_info.value)


class TestExceptionHierarchy:
    """Test exception hierarchy structure."""
    
    def test_backboard_error_is_base_exception(self):
        """Test that BackboardError is the base exception."""
        error = BackboardError("test error")
        assert isinstance(error, Exception)
    
    def test_service_error_inherits_from_base(self):
        """Test that BackboardServiceError inherits from BackboardError."""
        error = BackboardServiceError("service error")
        assert isinstance(error, BackboardError)
    
    def test_api_error_has_status_code(self):
        """Test that BackboardAPIError stores status code."""
        error = BackboardAPIError("api error", status_code=500)
        assert error.status_code == 500
        assert isinstance(error, BackboardError)
    
    def test_auth_error_inherits_from_api_error(self):
        """Test that BackboardAuthError inherits from BackboardAPIError."""
        error = BackboardAuthError("auth error", status_code=401)
        assert error.status_code == 401
        assert isinstance(error, BackboardAPIError)
        assert isinstance(error, BackboardError)
    
    def test_not_found_error_inherits_from_api_error(self):
        """Test that BackboardNotFoundError inherits from BackboardAPIError."""
        error = BackboardNotFoundError("not found", status_code=404)
        assert error.status_code == 404
        assert isinstance(error, BackboardAPIError)
    
    def test_rate_limit_error_has_retry_after(self):
        """Test that BackboardRateLimitError stores retry_after."""
        error = BackboardRateLimitError("rate limit", status_code=429, retry_after=60)
        assert error.status_code == 429
        assert error.retry_after == 60
        assert isinstance(error, BackboardAPIError)
    
    def test_service_unavailable_error_inherits_from_api_error(self):
        """Test that BackboardServiceUnavailableError inherits from BackboardAPIError."""
        error = BackboardServiceUnavailableError("unavailable", status_code=503)
        assert error.status_code == 503
        assert isinstance(error, BackboardAPIError)


class TestBackboardServiceStructure:
    """Test BackboardService class structure and method signatures."""
    
    def test_service_has_document_methods(self):
        """Test that service has all document operation methods."""
        service = BackboardService(api_key="espr_test_key")
        
        assert hasattr(service, "add_document")
        assert hasattr(service, "add_documents_batch")
        assert hasattr(service, "search_documents")
        assert hasattr(service, "delete_documents")
    
    def test_service_has_assistant_methods(self):
        """Test that service has all assistant operation methods."""
        service = BackboardService(api_key="espr_test_key")
        
        assert hasattr(service, "create_assistant")
        assert hasattr(service, "get_or_create_assistant")
        assert hasattr(service, "add_memory")
        assert hasattr(service, "query_memory")
        assert hasattr(service, "get_all_memories")
    
    def test_service_has_thread_methods(self):
        """Test that service has all thread operation methods."""
        service = BackboardService(api_key="espr_test_key")
        
        assert hasattr(service, "create_thread")
        assert hasattr(service, "add_message")
        assert hasattr(service, "get_thread_history")
        assert hasattr(service, "list_threads")



class TestDocumentOperations:
    """Unit tests for document operations with mocked API calls."""
    
    @patch("requests.post")
    def test_add_document_success(self, mock_post):
        """Test successful document addition."""
        mock_post.return_value.status_code = 200
        mock_post.return_value.json.return_value = {"document_id": "doc_123"}
        
        service = BackboardService(api_key="espr_test")
        doc_id = service.add_document(
            content="Test email content",
            metadata={"user_id": 1, "source": "email", "timestamp": "2024-01-01T00:00:00Z"}
        )
        
        assert doc_id == "doc_123"
        assert mock_post.called
        
        # Verify API call parameters
        call_args = mock_post.call_args
        assert call_args[0][0] == "https://app.backboard.io/api/documents"
        assert call_args[1]["json"]["content"] == "Test email content"
        assert call_args[1]["json"]["metadata"]["user_id"] == 1
    
    def test_add_document_validates_user_id(self):
        """Test that add_document validates user_id in metadata."""
        service = BackboardService(api_key="espr_test")
        
        with pytest.raises(BackboardServiceError) as exc_info:
            service.add_document(
                content="Test",
                metadata={"source": "email"}  # Missing user_id
            )
        
        assert "user_id" in str(exc_info.value)
    
    def test_add_document_validates_source(self):
        """Test that add_document validates source in metadata."""
        service = BackboardService(api_key="espr_test")
        
        with pytest.raises(BackboardServiceError) as exc_info:
            service.add_document(
                content="Test",
                metadata={"user_id": 1}  # Missing source
            )
        
        assert "source" in str(exc_info.value)
    
    @patch("requests.post")
    def test_add_document_handles_auth_error(self, mock_post):
        """Test authentication error handling."""
        mock_post.return_value.status_code = 401
        mock_post.return_value.text = "Invalid API key"
        
        service = BackboardService(api_key="espr_invalid")
        
        with pytest.raises(BackboardAuthError) as exc_info:
            service.add_document(
                content="Test",
                metadata={"user_id": 1, "source": "email"}
            )
        
        assert exc_info.value.status_code == 401
    
    @patch("requests.post")
    def test_add_documents_batch_success(self, mock_post):
        """Test successful batch document addition."""
        mock_post.return_value.status_code = 200
        mock_post.return_value.json.return_value = {
            "document_ids": ["doc_1", "doc_2", "doc_3"]
        }
        
        service = BackboardService(api_key="espr_test")
        documents = [
            ("Email 1", {"user_id": 1, "source": "email"}),
            ("Email 2", {"user_id": 1, "source": "email"}),
            ("Calendar event", {"user_id": 1, "source": "calendar"})
        ]
        
        doc_ids = service.add_documents_batch(documents)
        
        assert len(doc_ids) == 3
        assert doc_ids == ["doc_1", "doc_2", "doc_3"]
        assert mock_post.called
        
        # Verify batch endpoint was called
        call_args = mock_post.call_args
        assert "batch" in call_args[0][0]
    
    def test_add_documents_batch_validates_metadata(self):
        """Test that batch operation validates all documents."""
        service = BackboardService(api_key="espr_test")
        
        documents = [
            ("Email 1", {"user_id": 1, "source": "email"}),
            ("Email 2", {"source": "email"}),  # Missing user_id
        ]
        
        with pytest.raises(BackboardServiceError) as exc_info:
            service.add_documents_batch(documents)
        
        assert "index 1" in str(exc_info.value)
        assert "user_id" in str(exc_info.value)
    
    @patch("requests.get")
    def test_search_documents_success(self, mock_get):
        """Test successful document search."""
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = {
            "results": [
                {
                    "document_id": "doc_1",
                    "content": "Email about project deadline",
                    "metadata": {"user_id": 1, "source": "email"},
                    "score": 0.95
                },
                {
                    "document_id": "doc_2",
                    "content": "Meeting about project",
                    "metadata": {"user_id": 1, "source": "calendar"},
                    "score": 0.87
                }
            ]
        }
        
        service = BackboardService(api_key="espr_test")
        results = service.search_documents(
            query="project deadline",
            n_results=5,
            filter_metadata={"user_id": 1}
        )
        
        assert len(results) == 2
        assert results[0]["document_id"] == "doc_1"
        assert results[0]["score"] == 0.95
        assert mock_get.called
    
    @patch("requests.get")
    def test_search_documents_with_filters(self, mock_get):
        """Test document search with metadata filters."""
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = {"results": []}
        
        service = BackboardService(api_key="espr_test")
        service.search_documents(
            query="urgent",
            filter_metadata={"user_id": 1, "source": "email"}
        )
        
        # Verify filter was passed in params
        call_args = mock_get.call_args
        assert "filter" in call_args[1]["params"]
        assert call_args[1]["params"]["filter"]["user_id"] == 1
        assert call_args[1]["params"]["filter"]["source"] == "email"
    
    @patch("requests.delete")
    def test_delete_documents_success(self, mock_delete):
        """Test successful document deletion."""
        mock_delete.return_value.status_code = 200
        mock_delete.return_value.json.return_value = {"deleted_count": 5}
        
        service = BackboardService(api_key="espr_test")
        deleted_count = service.delete_documents(
            filter_metadata={"user_id": 999, "source": "test"}
        )
        
        assert deleted_count == 5
        assert mock_delete.called
    
    def test_delete_documents_validates_filter(self):
        """Test that delete_documents requires non-empty filter."""
        service = BackboardService(api_key="espr_test")
        
        with pytest.raises(BackboardServiceError) as exc_info:
            service.delete_documents(filter_metadata={})
        
        assert "cannot be empty" in str(exc_info.value)
    
    @patch("time.sleep")
    @patch("requests.post")
    def test_retry_on_rate_limit(self, mock_post, mock_sleep):
        """Test retry logic on rate limit error."""
        # First call returns 429, second call succeeds
        mock_response_429 = Mock()
        mock_response_429.status_code = 429
        mock_response_429.headers = {"Retry-After": "1"}
        mock_response_429.text = "Rate limit exceeded"
        
        mock_response_200 = Mock()
        mock_response_200.status_code = 200
        mock_response_200.json.return_value = {"document_id": "doc_123"}
        
        mock_post.side_effect = [mock_response_429, mock_response_200]
        
        service = BackboardService(api_key="espr_test")
        doc_id = service.add_document(
            content="Test",
            metadata={"user_id": 1, "source": "test"}
        )
        
        assert doc_id == "doc_123"
        assert mock_post.call_count == 2
        assert mock_sleep.called
    
    @patch("time.sleep")
    @patch("requests.post")
    def test_retry_exhaustion_raises_error(self, mock_post, mock_sleep):
        """Test that exhausted retries raise BackboardServiceError."""
        # All calls return 503
        mock_post.return_value.status_code = 503
        mock_post.return_value.text = "Service unavailable"
        
        service = BackboardService(api_key="espr_test")
        
        with pytest.raises(BackboardServiceError) as exc_info:
            service.add_document(
                content="Test",
                metadata={"user_id": 1, "source": "test"}
            )
        
        assert "failed after" in str(exc_info.value)
        assert mock_post.call_count == 3  # MAX_RETRIES
    
    @patch("requests.post")
    def test_no_retry_on_client_errors(self, mock_post):
        """Test that client errors (400, 404) are not retried."""
        mock_post.return_value.status_code = 400
        mock_post.return_value.text = "Bad request"
        
        service = BackboardService(api_key="espr_test")
        
        with pytest.raises(BackboardAPIError):
            service.add_document(
                content="Test",
                metadata={"user_id": 1, "source": "test"}
            )
        
        # Should only be called once (no retries)
        assert mock_post.call_count == 1


class TestAssistantOperations:
    """Unit tests for assistant operations with mocked API calls."""
    
    @patch("requests.post")
    def test_create_assistant_success(self, mock_post):
        """Test successful assistant creation."""
        mock_post.return_value.status_code = 200
        mock_post.return_value.json.return_value = {"assistant_id": "asst_123"}
        
        service = BackboardService(api_key="espr_test")
        assistant_id = service.create_assistant(
            user_id=1,
            name="Test Assistant",
            instructions="Test instructions"
        )
        
        assert assistant_id == "asst_123"
        assert mock_post.called
        
        # Verify API call parameters
        call_args = mock_post.call_args
        assert call_args[0][0] == "https://app.backboard.io/api/assistants"
        assert call_args[1]["json"]["name"] == "Test Assistant"
        assert call_args[1]["json"]["system_prompt"] == "Test instructions"
        assert call_args[1]["json"]["metadata"]["user_id"] == 1
    
    @patch("requests.get")
    @patch("requests.post")
    def test_get_or_create_assistant_finds_existing(self, mock_post, mock_get):
        """Test get_or_create_assistant returns existing assistant."""
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = {
            "assistants": [{"assistant_id": "asst_existing"}]
        }
        
        service = BackboardService(api_key="espr_test")
        assistant_id = service.get_or_create_assistant(user_id=1)
        
        assert assistant_id == "asst_existing"
        assert mock_get.called
        assert not mock_post.called  # Should not create new assistant
    
    @patch("requests.get")
    @patch("requests.post")
    def test_get_or_create_assistant_creates_new(self, mock_post, mock_get):
        """Test get_or_create_assistant creates new assistant when none exists."""
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = {"assistants": []}
        
        mock_post.return_value.status_code = 200
        mock_post.return_value.json.return_value = {"assistant_id": "asst_new"}
        
        service = BackboardService(api_key="espr_test")
        assistant_id = service.get_or_create_assistant(user_id=1)
        
        assert assistant_id == "asst_new"
        assert mock_get.called
        assert mock_post.called  # Should create new assistant
    
    @patch("requests.post")
    def test_add_memory_success(self, mock_post):
        """Test successful memory addition."""
        mock_post.return_value.status_code = 200
        mock_post.return_value.json.return_value = {}
        
        service = BackboardService(api_key="espr_test")
        service.add_memory(
            assistant_id="asst_123",
            memory_content="User prefers morning meetings",
            memory_type="preference"
        )
        
        assert mock_post.called
        
        # Verify API call parameters
        call_args = mock_post.call_args
        assert "asst_123" in call_args[0][0]
        assert "memory" in call_args[0][0]
        assert call_args[1]["json"]["content"] == "User prefers morning meetings"
        assert call_args[1]["json"]["metadata"]["type"] == "preference"
    
    @patch("requests.get")
    def test_query_memory_success(self, mock_get):
        """Test successful memory query."""
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = {
            "memories": [
                {
                    "memory_id": "mem_1",
                    "content": "User prefers morning meetings",
                    "score": 0.95
                },
                {
                    "memory_id": "mem_2",
                    "content": "User likes concise summaries",
                    "score": 0.87
                }
            ]
        }
        
        service = BackboardService(api_key="espr_test")
        memories = service.query_memory(
            assistant_id="asst_123",
            query="meeting preferences"
        )
        
        assert len(memories) == 2
        assert memories[0]["memory_id"] == "mem_1"
        assert memories[0]["score"] == 0.95
        assert mock_get.called
    
    @patch("requests.get")
    def test_get_all_memories_success(self, mock_get):
        """Test successful retrieval of all memories."""
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = {
            "memories": [
                {"memory_id": "mem_1", "content": "Memory 1"},
                {"memory_id": "mem_2", "content": "Memory 2"},
                {"memory_id": "mem_3", "content": "Memory 3"}
            ]
        }
        
        service = BackboardService(api_key="espr_test")
        memories = service.get_all_memories(assistant_id="asst_123")
        
        assert len(memories) == 3
        assert memories[0]["memory_id"] == "mem_1"
        assert mock_get.called
        
        # Verify API call parameters
        call_args = mock_get.call_args
        assert "asst_123" in call_args[0][0]
        assert "memory" in call_args[0][0]



class TestThreadOperations:
    """Unit tests for thread operations with mocked API calls."""
    
    @patch("requests.post")
    def test_create_thread_success(self, mock_post):
        """Test successful thread creation."""
        mock_post.return_value.status_code = 200
        mock_post.return_value.json.return_value = {"thread_id": "thread_123"}
        
        service = BackboardService(api_key="espr_test")
        thread_id = service.create_thread(
            user_id=1,
            thread_type="daily"
        )
        
        assert thread_id == "thread_123"
        assert mock_post.called
        
        # Verify API call parameters
        call_args = mock_post.call_args
        assert call_args[0][0] == "https://app.backboard.io/api/threads"
        assert call_args[1]["json"]["metadata"]["user_id"] == 1
        assert call_args[1]["json"]["metadata"]["thread_type"] == "daily"
        assert "initial_message" not in call_args[1]["json"]
    
    @patch("requests.post")
    def test_create_thread_with_initial_message(self, mock_post):
        """Test thread creation with initial message."""
        mock_post.return_value.status_code = 200
        mock_post.return_value.json.return_value = {"thread_id": "thread_123"}
        
        service = BackboardService(api_key="espr_test")
        thread_id = service.create_thread(
            user_id=1,
            thread_type="daily",
            initial_message="Here is your daily briefing"
        )
        
        assert thread_id == "thread_123"
        assert mock_post.called
        
        # Verify initial message was included
        call_args = mock_post.call_args
        assert "initial_message" in call_args[1]["json"]
        assert call_args[1]["json"]["initial_message"]["role"] == "assistant"
        assert call_args[1]["json"]["initial_message"]["content"] == "Here is your daily briefing"
    
    @patch("requests.post")
    def test_create_thread_different_types(self, mock_post):
        """Test thread creation with different thread types."""
        mock_post.return_value.status_code = 200
        mock_post.return_value.json.return_value = {"thread_id": "thread_123"}
        
        service = BackboardService(api_key="espr_test")
        
        # Test daily thread
        service.create_thread(user_id=1, thread_type="daily")
        assert mock_post.call_args[1]["json"]["metadata"]["thread_type"] == "daily"
        
        # Test urgent thread
        service.create_thread(user_id=1, thread_type="urgent")
        assert mock_post.call_args[1]["json"]["metadata"]["thread_type"] == "urgent"
        
        # Test weekly thread
        service.create_thread(user_id=1, thread_type="weekly")
        assert mock_post.call_args[1]["json"]["metadata"]["thread_type"] == "weekly"
    
    @patch("requests.post")
    def test_add_message_success(self, mock_post):
        """Test successful message addition to thread."""
        mock_post.return_value.status_code = 200
        mock_post.return_value.json.return_value = {"message_id": "msg_123"}
        
        service = BackboardService(api_key="espr_test")
        message_id = service.add_message(
            thread_id="thread_123",
            role="user",
            content="Tell me more about the first item"
        )
        
        assert message_id == "msg_123"
        assert mock_post.called
        
        # Verify API call parameters
        call_args = mock_post.call_args
        assert call_args[0][0] == "https://app.backboard.io/api/threads/thread_123/messages"
        assert call_args[1]["json"]["role"] == "user"
        assert call_args[1]["json"]["content"] == "Tell me more about the first item"
    
    @patch("requests.post")
    def test_add_message_different_roles(self, mock_post):
        """Test adding messages with different roles."""
        mock_post.return_value.status_code = 200
        mock_post.return_value.json.return_value = {"message_id": "msg_123"}
        
        service = BackboardService(api_key="espr_test")
        
        # Test user message
        service.add_message(thread_id="thread_123", role="user", content="User question")
        assert mock_post.call_args[1]["json"]["role"] == "user"
        
        # Test assistant message
        service.add_message(thread_id="thread_123", role="assistant", content="Assistant response")
        assert mock_post.call_args[1]["json"]["role"] == "assistant"
        
        # Test system message
        service.add_message(thread_id="thread_123", role="system", content="System message")
        assert mock_post.call_args[1]["json"]["role"] == "system"
    
    @patch("requests.get")
    def test_get_thread_history_success(self, mock_get):
        """Test successful thread history retrieval."""
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = {
            "messages": [
                {
                    "message_id": "msg_1",
                    "role": "assistant",
                    "content": "Initial briefing",
                    "timestamp": "2024-01-01T08:00:00Z"
                },
                {
                    "message_id": "msg_2",
                    "role": "user",
                    "content": "Tell me more",
                    "timestamp": "2024-01-01T08:05:00Z"
                },
                {
                    "message_id": "msg_3",
                    "role": "assistant",
                    "content": "Here are more details",
                    "timestamp": "2024-01-01T08:05:30Z"
                }
            ]
        }
        
        service = BackboardService(api_key="espr_test")
        messages = service.get_thread_history(thread_id="thread_123")
        
        assert len(messages) == 3
        assert messages[0]["message_id"] == "msg_1"
        assert messages[0]["role"] == "assistant"
        assert messages[1]["role"] == "user"
        assert messages[2]["role"] == "assistant"
        assert mock_get.called
        
        # Verify API call parameters
        call_args = mock_get.call_args
        assert call_args[0][0] == "https://app.backboard.io/api/threads/thread_123/messages"
    
    @patch("requests.get")
    def test_get_thread_history_with_limit(self, mock_get):
        """Test thread history retrieval with limit parameter."""
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = {"messages": []}
        
        service = BackboardService(api_key="espr_test")
        service.get_thread_history(thread_id="thread_123", limit=10)
        
        # Verify limit was passed in params
        call_args = mock_get.call_args
        assert "limit" in call_args[1]["params"]
        assert call_args[1]["params"]["limit"] == 10
    
    @patch("requests.get")
    def test_get_thread_history_without_limit(self, mock_get):
        """Test thread history retrieval without limit parameter."""
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = {"messages": []}
        
        service = BackboardService(api_key="espr_test")
        service.get_thread_history(thread_id="thread_123")
        
        # Verify params is empty when no limit
        call_args = mock_get.call_args
        assert call_args[1]["params"] == {}
    
    @patch("requests.get")
    def test_list_threads_success(self, mock_get):
        """Test successful thread listing."""
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = {
            "threads": [
                {
                    "thread_id": "thread_1",
                    "metadata": {"user_id": 1, "thread_type": "daily"},
                    "created_at": "2024-01-01T08:00:00Z",
                    "message_count": 5
                },
                {
                    "thread_id": "thread_2",
                    "metadata": {"user_id": 1, "thread_type": "urgent"},
                    "created_at": "2024-01-02T10:00:00Z",
                    "message_count": 3
                }
            ]
        }
        
        service = BackboardService(api_key="espr_test")
        threads = service.list_threads(user_id=1)
        
        assert len(threads) == 2
        assert threads[0]["thread_id"] == "thread_1"
        assert threads[0]["metadata"]["thread_type"] == "daily"
        assert threads[1]["thread_id"] == "thread_2"
        assert threads[1]["metadata"]["thread_type"] == "urgent"
        assert mock_get.called
        
        # Verify API call parameters
        call_args = mock_get.call_args
        assert call_args[0][0] == "https://app.backboard.io/api/threads"
        assert call_args[1]["params"]["metadata.user_id"] == 1
    
    @patch("requests.get")
    def test_list_threads_with_type_filter(self, mock_get):
        """Test thread listing with thread_type filter."""
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = {"threads": []}
        
        service = BackboardService(api_key="espr_test")
        service.list_threads(user_id=1, thread_type="daily")
        
        # Verify thread_type filter was passed
        call_args = mock_get.call_args
        assert "metadata.thread_type" in call_args[1]["params"]
        assert call_args[1]["params"]["metadata.thread_type"] == "daily"
    
    @patch("requests.get")
    def test_list_threads_without_type_filter(self, mock_get):
        """Test thread listing without thread_type filter."""
        mock_get.return_value.status_code = 200
        mock_get.return_value.json.return_value = {"threads": []}
        
        service = BackboardService(api_key="espr_test")
        service.list_threads(user_id=1)
        
        # Verify only user_id filter was passed
        call_args = mock_get.call_args
        assert "metadata.user_id" in call_args[1]["params"]
        assert "metadata.thread_type" not in call_args[1]["params"]
    
    @patch("requests.post")
    def test_create_thread_handles_auth_error(self, mock_post):
        """Test authentication error handling in thread creation."""
        mock_post.return_value.status_code = 401
        mock_post.return_value.text = "Invalid API key"
        
        service = BackboardService(api_key="espr_invalid")
        
        with pytest.raises(BackboardAuthError) as exc_info:
            service.create_thread(user_id=1, thread_type="daily")
        
        assert exc_info.value.status_code == 401
    
    @patch("requests.post")
    def test_add_message_handles_not_found_error(self, mock_post):
        """Test not found error handling when thread doesn't exist."""
        mock_post.return_value.status_code = 404
        mock_post.return_value.text = "Thread not found"
        
        service = BackboardService(api_key="espr_test")
        
        with pytest.raises(BackboardNotFoundError) as exc_info:
            service.add_message(
                thread_id="nonexistent_thread",
                role="user",
                content="Test message"
            )
        
        assert exc_info.value.status_code == 404
    
    @patch("requests.get")
    def test_get_thread_history_handles_not_found_error(self, mock_get):
        """Test not found error handling when thread doesn't exist."""
        mock_get.return_value.status_code = 404
        mock_get.return_value.text = "Thread not found"
        
        service = BackboardService(api_key="espr_test")
        
        with pytest.raises(BackboardNotFoundError) as exc_info:
            service.get_thread_history(thread_id="nonexistent_thread")
        
        assert exc_info.value.status_code == 404
    
    @patch("time.sleep")
    @patch("requests.post")
    def test_create_thread_retries_on_rate_limit(self, mock_post, mock_sleep):
        """Test retry logic on rate limit error for thread creation."""
        # First call returns 429, second call succeeds
        mock_response_429 = Mock()
        mock_response_429.status_code = 429
        mock_response_429.headers = {"Retry-After": "1"}
        mock_response_429.text = "Rate limit exceeded"
        
        mock_response_200 = Mock()
        mock_response_200.status_code = 200
        mock_response_200.json.return_value = {"thread_id": "thread_123"}
        
        mock_post.side_effect = [mock_response_429, mock_response_200]
        
        service = BackboardService(api_key="espr_test")
        thread_id = service.create_thread(user_id=1, thread_type="daily")
        
        assert thread_id == "thread_123"
        assert mock_post.call_count == 2
        assert mock_sleep.called
    
    @patch("time.sleep")
    @patch("requests.get")
    def test_list_threads_retries_on_service_unavailable(self, mock_get, mock_sleep):
        """Test retry logic on service unavailable error."""
        # First call returns 503, second call succeeds
        mock_response_503 = Mock()
        mock_response_503.status_code = 503
        mock_response_503.text = "Service unavailable"
        
        mock_response_200 = Mock()
        mock_response_200.status_code = 200
        mock_response_200.json.return_value = {"threads": []}
        
        mock_get.side_effect = [mock_response_503, mock_response_200]
        
        service = BackboardService(api_key="espr_test")
        threads = service.list_threads(user_id=1)
        
        assert threads == []
        assert mock_get.call_count == 2
        assert mock_sleep.called
