"""Tests for RAGPipeline graceful degradation when Backboard fails."""

from unittest.mock import Mock, patch, MagicMock
import pytest

from app.services.rag.pipeline import RAGPipeline
from app.services.backboard.backboard_service import (
    BackboardServiceError,
    BackboardAPIError,
    BackboardServiceUnavailableError
)


class TestRAGPipelineGracefulDegradation:
    """Test that RAGPipeline gracefully degrades when Backboard is unavailable."""
    
    @patch("app.services.rag.pipeline.settings")
    @patch("app.services.rag.pipeline.text_chunker")
    @patch("app.services.backboard.backboard_service.BackboardService")
    def test_add_text_returns_empty_on_backboard_failure(
        self, mock_backboard_service, mock_chunker, mock_settings
    ):
        """Test add_text returns empty list when Backboard fails."""
        mock_settings.USE_BACKBOARD = True
        mock_settings.BACKBOARD_API_KEY = "espr_test_key"
        mock_settings.BACKBOARD_BASE_URL = None
        
        mock_chunker.chunk_with_metadata.return_value = [
            ("chunk1", {"user_id": 1, "source": "test"}),
        ]
        
        mock_backend_instance = MagicMock()
        mock_backend_instance.add_documents_batch.side_effect = BackboardServiceError(
            "Backboard service unavailable"
        )
        mock_backboard_service.return_value = mock_backend_instance
        
        pipeline = RAGPipeline()
        result = pipeline.add_text("test text", {"user_id": 1, "source": "test"})
        
        # Should return empty list instead of raising exception
        assert result == []
        mock_backend_instance.add_documents_batch.assert_called_once()
    
    @patch("app.services.rag.pipeline.settings")
    @patch("app.services.backboard.backboard_service.BackboardService")
    def test_query_texts_returns_empty_on_backboard_failure(
        self, mock_backboard_service, mock_settings
    ):
        """Test query_texts returns empty list when Backboard fails."""
        mock_settings.USE_BACKBOARD = True
        mock_settings.BACKBOARD_API_KEY = "espr_test_key"
        mock_settings.BACKBOARD_BASE_URL = None
        
        mock_backend_instance = MagicMock()
        mock_backend_instance.search_documents.side_effect = BackboardServiceUnavailableError(
            "Service temporarily unavailable", status_code=503
        )
        mock_backboard_service.return_value = mock_backend_instance
        
        pipeline = RAGPipeline()
        result = pipeline.query_texts("test query", n_results=5)
        
        # Should return empty list instead of raising exception
        assert result == []
        mock_backend_instance.search_documents.assert_called_once()
    
    @patch("app.services.rag.pipeline.settings")
    @patch("app.services.backboard.backboard_service.BackboardService")
    def test_delete_documents_returns_zero_on_backboard_failure(
        self, mock_backboard_service, mock_settings
    ):
        """Test delete_documents returns 0 when Backboard fails."""
        mock_settings.USE_BACKBOARD = True
        mock_settings.BACKBOARD_API_KEY = "espr_test_key"
        mock_settings.BACKBOARD_BASE_URL = None
        
        mock_backend_instance = MagicMock()
        mock_backend_instance.delete_documents.side_effect = BackboardAPIError(
            "API error", status_code=500
        )
        mock_backboard_service.return_value = mock_backend_instance
        
        pipeline = RAGPipeline()
        result = pipeline.delete_documents({"user_id": 1})
        
        # Should return 0 instead of raising exception
        assert result == 0
        mock_backend_instance.delete_documents.assert_called_once()
    
    @patch("app.services.rag.pipeline.settings")
    @patch("app.services.backboard.backboard_service.BackboardService")
    def test_get_user_documents_returns_empty_on_backboard_failure(
        self, mock_backboard_service, mock_settings
    ):
        """Test get_user_documents returns empty list when Backboard fails."""
        mock_settings.USE_BACKBOARD = True
        mock_settings.BACKBOARD_API_KEY = "espr_test_key"
        mock_settings.BACKBOARD_BASE_URL = None
        
        mock_backend_instance = MagicMock()
        mock_backend_instance.search_documents.side_effect = ConnectionError(
            "Network connection failed"
        )
        mock_backboard_service.return_value = mock_backend_instance
        
        pipeline = RAGPipeline()
        result = pipeline.get_user_documents(user_id=1, n_results=50)
        
        # Should return empty list instead of raising exception
        assert result == []
        mock_backend_instance.search_documents.assert_called_once()
    
    @patch("app.services.rag.pipeline.settings")
    @patch("app.services.backboard.backboard_service.BackboardService")
    def test_search_by_content_type_returns_empty_on_backboard_failure(
        self, mock_backboard_service, mock_settings
    ):
        """Test search_by_content_type returns empty list when Backboard fails."""
        mock_settings.USE_BACKBOARD = True
        mock_settings.BACKBOARD_API_KEY = "espr_test_key"
        mock_settings.BACKBOARD_BASE_URL = None
        
        mock_backend_instance = MagicMock()
        mock_backend_instance.search_documents.side_effect = BackboardServiceError(
            "Service error"
        )
        mock_backboard_service.return_value = mock_backend_instance
        
        pipeline = RAGPipeline()
        result = pipeline.search_by_content_type("email", query="", n_results=10)
        
        # Should return empty list instead of raising exception
        assert result == []
        mock_backend_instance.search_documents.assert_called_once()
    
    @patch("app.services.rag.pipeline.settings")
    @patch("app.services.backboard.backboard_service.BackboardService")
    def test_get_recent_documents_returns_empty_on_backboard_failure(
        self, mock_backboard_service, mock_settings
    ):
        """Test get_recent_documents returns empty list when Backboard fails."""
        mock_settings.USE_BACKBOARD = True
        mock_settings.BACKBOARD_API_KEY = "espr_test_key"
        mock_settings.BACKBOARD_BASE_URL = None
        
        mock_backend_instance = MagicMock()
        mock_backend_instance.search_documents.side_effect = TimeoutError(
            "Request timeout"
        )
        mock_backboard_service.return_value = mock_backend_instance
        
        pipeline = RAGPipeline()
        result = pipeline.get_recent_documents(days=7, limit=50)
        
        # Should return empty list instead of raising exception
        assert result == []
        mock_backend_instance.search_documents.assert_called_once()
    
    @patch("app.services.rag.pipeline.settings")
    @patch("app.services.rag.pipeline.text_chunker")
    @patch("app.services.backboard.backboard_service.BackboardService")
    @patch("app.services.rag.pipeline.logger")
    def test_add_text_logs_error_on_failure(
        self, mock_logger, mock_backboard_service, mock_chunker, mock_settings
    ):
        """Test that add_text logs error when Backboard fails."""
        mock_settings.USE_BACKBOARD = True
        mock_settings.BACKBOARD_API_KEY = "espr_test_key"
        mock_settings.BACKBOARD_BASE_URL = None
        
        mock_chunker.chunk_with_metadata.return_value = [
            ("chunk1", {"user_id": 1, "source": "test"}),
        ]
        
        mock_backend_instance = MagicMock()
        error = BackboardServiceError("Service unavailable")
        mock_backend_instance.add_documents_batch.side_effect = error
        mock_backboard_service.return_value = mock_backend_instance
        
        pipeline = RAGPipeline()
        result = pipeline.add_text("test text", {"user_id": 1, "source": "test"})
        
        # Verify error logging
        assert mock_logger.error.called
        assert mock_logger.warning.called
        error_call = mock_logger.error.call_args[0][0]
        assert "Backboard add_text failed" in error_call
        assert "degraded mode" in error_call
        
        warning_call = mock_logger.warning.call_args[0][0]
        assert "Operating in degraded mode" in warning_call
        assert "Backboard unavailable" in warning_call
    
    @patch("app.services.rag.pipeline.settings")
    @patch("app.services.backboard.backboard_service.BackboardService")
    @patch("app.services.rag.pipeline.logger")
    def test_query_texts_logs_error_on_failure(
        self, mock_logger, mock_backboard_service, mock_settings
    ):
        """Test that query_texts logs error when Backboard fails."""
        mock_settings.USE_BACKBOARD = True
        mock_settings.BACKBOARD_API_KEY = "espr_test_key"
        mock_settings.BACKBOARD_BASE_URL = None
        
        mock_backend_instance = MagicMock()
        error = BackboardServiceUnavailableError("Service unavailable", status_code=503)
        mock_backend_instance.search_documents.side_effect = error
        mock_backboard_service.return_value = mock_backend_instance
        
        pipeline = RAGPipeline()
        result = pipeline.query_texts("test query", n_results=5)
        
        # Verify error logging
        assert mock_logger.error.called
        assert mock_logger.warning.called
        error_call = mock_logger.error.call_args[0][0]
        assert "Backboard query_texts failed" in error_call
        assert "degraded mode" in error_call
        
        warning_call = mock_logger.warning.call_args[0][0]
        assert "Operating in degraded mode" in warning_call
        assert "Backboard unavailable" in warning_call
