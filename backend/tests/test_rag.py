import pytest
from unittest.mock import Mock, patch
from datetime import datetime

from app.services.rag.pipeline import RAGPipeline
from app.services.rag.chunker import TextChunker
from app.services.rag.embeddings import EmbeddingManager, ChromaEmbeddingFunction
from app.services.rag.vector_store import VectorStore


class TestTextChunker:
    def test_chunk_text_small(self):
        # Test chunking small text
        chunker = TextChunker(chunk_size=100, overlap=20)
        text = "This is a small text that should not be chunked."
        
        chunks = chunker.chunk_text(text)
        
        assert len(chunks) == 1
        assert chunks[0] == text
    
    def test_chunk_text_large(self):
        # Test chunking large text
        chunker = TextChunker(chunk_size=50, overlap=10)
        text = "This is a very long text that needs to be chunked into smaller pieces. " * 10
        
        chunks = chunker.chunk_text(text)
        
        assert len(chunks) > 1
        assert all(len(chunk) <= 60 for chunk in chunks)  # Allow some flexibility for sentence boundaries
    
    def test_chunk_with_metadata(self):
        # Test chunking with metadata
        chunker = TextChunker(chunk_size=50, overlap=10)
        text = "This is a test text for chunking with metadata."
        base_metadata = {"source": "test", "user_id": 1}
        
        chunk_data = chunker.chunk_with_metadata(text, base_metadata)
        
        assert len(chunk_data) == 1
        chunk_text, chunk_metadata = chunk_data[0]
        
        assert chunk_text == text
        assert chunk_metadata["source"] == "test"
        assert chunk_metadata["user_id"] == 1
        assert "chunk_index" in chunk_metadata
        assert "total_chunks" in chunk_metadata
        assert "chunk_size" in chunk_metadata


class TestEmbeddingManager:
    def test_embedding_manager_init(self, mock_ollama_embeddings):
        # Test embedding manager initialization
        manager = EmbeddingManager()
        
        assert manager.embedding_model is not None
    
    def test_embed_query(self, mock_ollama_embeddings):
        # Test query embedding
        manager = EmbeddingManager()
        text = "Test query text"
        
        embeddings = manager.embed_query(text)
        
        assert isinstance(embeddings, list)
        assert len(embeddings) == 5  # Mock returns 5 dimensions
        assert all(isinstance(x, float) for x in embeddings)
    
    def test_embed_documents(self, mock_ollama_embeddings):
        # Test document embedding
        manager = EmbeddingManager()
        texts = ["Document 1", "Document 2"]
        
        embeddings = manager.embed_documents(texts)
        
        assert isinstance(embeddings, list)
        assert len(embeddings) == 1  # Mock returns single embedding list
        assert isinstance(embeddings[0], list)


class TestChromaEmbeddingFunction:
    def test_embedding_function_string(self, mock_ollama_embeddings):
        # Test embedding function with string input
        manager = EmbeddingManager()
        embedding_func = ChromaEmbeddingFunction(manager)
        
        result = embedding_func("Test string")
        
        assert isinstance(result, list)
        assert len(result) == 5
    
    def test_embedding_function_list(self, mock_ollama_embeddings):
        # Test embedding function with list input
        manager = EmbeddingManager()
        embedding_func = ChromaEmbeddingFunction(manager)
        
        result = embedding_func(["Text 1", "Text 2"])
        
        assert isinstance(result, list)
    
    def test_embedding_function_invalid_input(self, mock_ollama_embeddings):
        # Test embedding function with invalid input
        manager = EmbeddingManager()
        embedding_func = ChromaEmbeddingFunction(manager)
        
        with pytest.raises(ValueError):
            embedding_func(123)  # Invalid input type


class TestVectorStore:
    def test_vector_store_init(self, mock_chromadb, mock_ollama_embeddings):
        # Test vector store initialization
        store = VectorStore()
        
        assert store.client is not None
        assert store.collection is not None
        assert store.collection_name == "londoolink_documents"
    
    def test_add_documents(self, mock_chromadb, mock_ollama_embeddings):
        # Test adding documents to vector store
        store = VectorStore()
        documents = ["Document 1", "Document 2"]
        metadatas = [{"source": "test1"}, {"source": "test2"}]
        
        ids = store.add_documents(documents, metadatas)
        
        assert isinstance(ids, list)
        assert len(ids) == 2
        mock_chromadb.add.assert_called_once()
    
    def test_query_documents(self, mock_chromadb, mock_ollama_embeddings):
        # Test querying documents from vector store
        store = VectorStore()
        query = "test query"
        
        results = store.query_documents(query, n_results=2)
        
        assert isinstance(results, list)
        assert len(results) == 2
        assert all("id" in result for result in results)
        assert all("content" in result for result in results)
        assert all("metadata" in result for result in results)
        mock_chromadb.query.assert_called_once()
    
    def test_get_all_documents(self, mock_chromadb, mock_ollama_embeddings):
        # Test getting all documents from vector store
        store = VectorStore()
        
        results = store.get_all_documents()
        
        assert isinstance(results, list)
        assert len(results) == 2
        mock_chromadb.get.assert_called_once()
    
    def test_delete_documents(self, mock_chromadb, mock_ollama_embeddings):
        # Test deleting documents from vector store
        store = VectorStore()
        filter_metadata = {"source": "test"}
        
        deleted_count = store.delete_documents(filter_metadata)
        
        assert isinstance(deleted_count, int)
        assert deleted_count >= 0
    
    def test_get_stats(self, mock_chromadb, mock_ollama_embeddings):
        # Test getting vector store statistics
        store = VectorStore()
        
        stats = store.get_stats()
        
        assert isinstance(stats, dict)
        assert "total_documents" in stats
        assert "collection_name" in stats
        assert "database_path" in stats


class TestRAGPipeline:
    def test_rag_pipeline_init(self, mock_chromadb, mock_ollama_embeddings):
        # Test RAG pipeline initialization
        pipeline = RAGPipeline()
        
        assert pipeline.chunker is not None
        assert pipeline.vector_store is not None
        assert pipeline.embedding_manager is not None
    
    def test_add_text(self, mock_chromadb, mock_ollama_embeddings):
        # Test adding text to RAG pipeline
        pipeline = RAGPipeline()
        text = "This is a test document for the RAG pipeline."
        metadata = {"source": "test", "user_id": 1}
        
        document_ids = pipeline.add_text(text, metadata)
        
        assert isinstance(document_ids, list)
        assert len(document_ids) > 0
    
    def test_add_text_with_timestamp(self, mock_chromadb, mock_ollama_embeddings):
        # Test adding text with automatic timestamp
        pipeline = RAGPipeline()
        text = "Test document without timestamp"
        metadata = {"source": "test", "user_id": 1}
        
        document_ids = pipeline.add_text(text, metadata)
        
        assert isinstance(document_ids, list)
        # Metadata should now have timestamp
        assert "timestamp" in metadata
    
    def test_query_texts(self, mock_chromadb, mock_ollama_embeddings):
        # Test querying texts from RAG pipeline
        pipeline = RAGPipeline()
        query = "test query"
        
        results = pipeline.query_texts(query, n_results=3)
        
        assert isinstance(results, list)
        assert len(results) <= 3
    
    def test_query_texts_with_filter(self, mock_chromadb, mock_ollama_embeddings):
        # Test querying texts with metadata filter
        pipeline = RAGPipeline()
        query = "test query"
        filter_metadata = {"source": "email"}
        
        results = pipeline.query_texts(query, n_results=3, filter_metadata=filter_metadata)
        
        assert isinstance(results, list)
    
    def test_get_recent_documents(self, mock_chromadb, mock_ollama_embeddings):
        # Test getting recent documents
        pipeline = RAGPipeline()
        
        results = pipeline.get_recent_documents(days=7, limit=10)
        
        assert isinstance(results, list)
        assert len(results) <= 10
    
    def test_delete_documents(self, mock_chromadb, mock_ollama_embeddings):
        # Test deleting documents from RAG pipeline
        pipeline = RAGPipeline()
        filter_metadata = {"source": "test"}
        
        deleted_count = pipeline.delete_documents(filter_metadata)
        
        assert isinstance(deleted_count, int)
        assert deleted_count >= 0
    
    def test_get_collection_stats(self, mock_chromadb, mock_ollama_embeddings):
        # Test getting collection statistics
        pipeline = RAGPipeline()
        
        stats = pipeline.get_collection_stats()
        
        assert isinstance(stats, dict)
    
    def test_search_by_content_type(self, mock_chromadb, mock_ollama_embeddings):
        # Test searching by content type
        pipeline = RAGPipeline()
        content_type = "email"
        query = "test query"
        
        results = pipeline.search_by_content_type(content_type, query, n_results=5)
        
        assert isinstance(results, list)
        assert len(results) <= 5
    
    def test_search_by_content_type_no_query(self, mock_chromadb, mock_ollama_embeddings):
        # Test searching by content type without query
        pipeline = RAGPipeline()
        content_type = "email"
        
        results = pipeline.search_by_content_type(content_type, n_results=5)
        
        assert isinstance(results, list)
    
    def test_get_user_documents(self, mock_chromadb, mock_ollama_embeddings):
        # Test getting user-specific documents
        pipeline = RAGPipeline()
        user_id = 1
        
        results = pipeline.get_user_documents(user_id, n_results=10)
        
        assert isinstance(results, list)
        assert len(results) <= 10
