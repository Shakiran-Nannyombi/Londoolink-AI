"""Tests for RAGPipeline backend routing (ChromaDB vs Backboard)."""

from unittest.mock import Mock, patch, MagicMock
import pytest

from app.services.rag.pipeline import RAGPipeline


class TestRAGPipelineBackboardRouting:
    """Test that RAGPipeline correctly routes operations based on USE_BACKBOARD flag."""
    
    @patch("app.services.rag.pipeline.settings")
    @patch("app.services.rag.pipeline.text_chunker")
    @patch("app.services.rag.pipeline.vector_store")
    def test_init_with_chromadb_backend(self, mock_vector_store, mock_chunker, mock_settings):
        """Test RAGPipeline initializes with ChromaDB when USE_BACKBOARD=False."""
        mock_settings.USE_BACKBOARD = False
        
        pipeline = RAGPipeline()
        
        assert pipeline.use_backboard is False
        assert pipeline.backend is None
        assert pipeline.vector_store is not None
        assert pipeline.chunker is not None
    
    @patch("app.services.rag.pipeline.settings")
    @patch("app.services.rag.pipeline.BackboardService")
    def test_init_with_backboard_backend(self, mock_backboard_service, mock_settings):
        """Test RAGPipeline initializes with Backboard when USE_BACKBOARD=True."""
        mock_settings.USE_BACKBOARD = True
        mock_settings.BACKBOARD_API_KEY = "espr_test_key"
        mock_settings.BACKBOARD_BASE_URL = None
        
        pipeline = RAGPipeline()
        
        assert pipeline.use_backboard is True
        assert pipeline.backend is not None
        mock_backboard_service.assert_called_once_with(
            api_key="espr_test_key",
            base_url=None
        )
    
    @patch("app.services.rag.pipeline.settings")
    @patch("app.services.rag.pipeline.text_chunker")
    @patch("app.services.rag.pipeline.vector_store")
    def test_add_text_routes_to_chromadb(self, mock_vector_store, mock_chunker, mock_settings):
        """Test add_text routes to ChromaDB when USE_BACKBOARD=False."""
        mock_settings.USE_BACKBOARD = False
        mock_chunker.chunk_with_metadata.return_value = [
            ("chunk1", {"user_id": 1, "source": "test"}),
            ("chunk2", {"user_id": 1, "source": "test"})
        ]
        mock_vector_store.add_documents.return_value = ["id1", "id2"]
        
        pipeline = RAGPipeline()
        result = pipeline.add_text("test text", {"user_id": 1, "source": "test"})
        
        assert result == ["id1", "id2"]
        mock_vector_store.add_documents.assert_called_once()
    
    @patch("app.services.rag.pipeline.settings")
    @patch("app.services.rag.pipeline.text_chunker")
    @patch("app.services.rag.pipeline.BackboardService")
    def test_add_text_routes_to_backboard(self, mock_backboard_service, mock_chunker, mock_settings):
        """Test add_text routes to Backboard when USE_BACKBOARD=True."""
        mock_settings.USE_BACKBOARD = True
        mock_settings.BACKBOARD_API_KEY = "espr_test_key"
        mock_settings.BACKBOARD_BASE_URL = None
        
        mock_chunker.chunk_with_metadata.return_value = [
            ("chunk1", {"user_id": 1, "source": "test"}),
            ("chunk2", {"user_id": 1, "source": "test"})
        ]
        
        mock_backend_instance = MagicMock()
        mock_backend_instance.add_documents_batch.return_value = ["doc1", "doc2"]
        mock_backboard_service.return_value = mock_backend_instance
        
        pipeline = RAGPipeline()
        result = pipeline.add_text("test text", {"user_id": 1, "source": "test"})
        
        assert result == ["doc1", "doc2"]
        mock_backend_instance.add_documents_batch.assert_called_once()
    
    @patch("app.services.rag.pipeline.settings")
    @patch("app.services.rag.pipeline.vector_store")
    def test_query_texts_routes_to_chromadb(self, mock_vector_store, mock_settings):
        """Test query_texts routes to ChromaDB when USE_BACKBOARD=False."""
        mock_settings.USE_BACKBOARD = False
        mock_vector_store.query_documents.return_value = [
            {"id": "1", "content": "result1", "metadata": {}}
        ]
        
        pipeline = RAGPipeline()
        result = pipeline.query_texts("test query", n_results=5)
        
        assert len(result) == 1
        mock_vector_store.query_documents.assert_called_once_with("test query", 5, None)
    
    @patch("app.services.rag.pipeline.settings")
    @patch("app.services.rag.pipeline.BackboardService")
    def test_query_texts_routes_to_backboard(self, mock_backboard_service, mock_settings):
        """Test query_texts routes to Backboard when USE_BACKBOARD=True."""
        mock_settings.USE_BACKBOARD = True
        mock_settings.BACKBOARD_API_KEY = "espr_test_key"
        mock_settings.BACKBOARD_BASE_URL = None
        
        mock_backend_instance = MagicMock()
        mock_backend_instance.search_documents.return_value = [
            {"document_id": "1", "content": "result1", "metadata": {}}
        ]
        mock_backboard_service.return_value = mock_backend_instance
        
        pipeline = RAGPipeline()
        result = pipeline.query_texts("test query", n_results=5, filter_metadata={"user_id": 1})
        
        assert len(result) == 1
        mock_backend_instance.search_documents.assert_called_once_with(
            "test query", 5, {"user_id": 1}
        )
    
    @patch("app.services.rag.pipeline.settings")
    @patch("app.services.rag.pipeline.vector_store")
    def test_delete_documents_routes_to_chromadb(self, mock_vector_store, mock_settings):
        """Test delete_documents routes to ChromaDB when USE_BACKBOARD=False."""
        mock_settings.USE_BACKBOARD = False
        mock_vector_store.delete_documents.return_value = 5
        
        pipeline = RAGPipeline()
        result = pipeline.delete_documents({"user_id": 1})
        
        assert result == 5
        mock_vector_store.delete_documents.assert_called_once_with({"user_id": 1})
    
    @patch("app.services.rag.pipeline.settings")
    @patch("app.services.rag.pipeline.BackboardService")
    def test_delete_documents_routes_to_backboard(self, mock_backboard_service, mock_settings):
        """Test delete_documents routes to Backboard when USE_BACKBOARD=True."""
        mock_settings.USE_BACKBOARD = True
        mock_settings.BACKBOARD_API_KEY = "espr_test_key"
        mock_settings.BACKBOARD_BASE_URL = None
        
        mock_backend_instance = MagicMock()
        mock_backend_instance.delete_documents.return_value = 3
        mock_backboard_service.return_value = mock_backend_instance
        
        pipeline = RAGPipeline()
        result = pipeline.delete_documents({"user_id": 1})
        
        assert result == 3
        mock_backend_instance.delete_documents.assert_called_once_with({"user_id": 1})
    
    @patch("app.services.rag.pipeline.settings")
    @patch("app.services.rag.pipeline.BackboardService")
    def test_get_user_documents_routes_to_backboard(self, mock_backboard_service, mock_settings):
        """Test get_user_documents routes to Backboard when USE_BACKBOARD=True."""
        mock_settings.USE_BACKBOARD = True
        mock_settings.BACKBOARD_API_KEY = "espr_test_key"
        mock_settings.BACKBOARD_BASE_URL = None
        
        mock_backend_instance = MagicMock()
        mock_backend_instance.search_documents.return_value = [
            {"document_id": "1", "content": "doc1", "metadata": {"user_id": 1}}
        ]
        mock_backboard_service.return_value = mock_backend_instance
        
        pipeline = RAGPipeline()
        result = pipeline.get_user_documents(user_id=1, n_results=50)
        
        assert len(result) == 1
        mock_backend_instance.search_documents.assert_called_once_with(
            "", 50, {"user_id": 1}
        )
