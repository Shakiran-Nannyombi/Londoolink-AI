from typing import List, Dict, Any, Optional
from datetime import datetime
import logging

from .chunker import text_chunker
from .vector_store import vector_store
from .embeddings import embedding_manager

logger = logging.getLogger(__name__)


class RAGPipeline:
    # Modern RAG pipeline with modular components
    
    def __init__(self):
        self.chunker = text_chunker
        self.vector_store = vector_store
        self.embedding_manager = embedding_manager
        logger.info("RAG Pipeline initialized with modular components")
    
    def add_text(self, text: str, metadata: Dict[str, Any]) -> List[str]:
        # Add text to the RAG pipeline with automatic chunking and embedding
        try:
            # Enhance metadata with timestamp if not present
            if 'timestamp' not in metadata:
                metadata['timestamp'] = datetime.utcnow().isoformat()
            
            # Chunk the text with metadata
            chunk_data = self.chunker.chunk_with_metadata(text, metadata)
            
            # Prepare data for vector store
            documents = []
            metadatas = []
            
            for chunk_text, chunk_metadata in chunk_data:
                documents.append(chunk_text)
                metadatas.append(chunk_metadata)
            
            # Add to vector store
            document_ids = self.vector_store.add_documents(documents, metadatas)
            
            logger.info(f"Added {len(chunk_data)} chunks to RAG pipeline")
            return document_ids
            
        except Exception as e:
            logger.error(f"Failed to add text to RAG pipeline: {e}")
            raise
    
    def query_texts(self, query: str, n_results: int = 5, filter_metadata: Optional[Dict] = None) -> List[Dict[str, Any]]:
        # Query the RAG pipeline for relevant documents
        try:
            return self.vector_store.query_documents(query, n_results, filter_metadata)
        except Exception as e:
            logger.error(f"Failed to query RAG pipeline: {e}")
            raise
    
    def get_recent_documents(self, days: int = 7, limit: int = 50) -> List[Dict[str, Any]]:
        # Get recent documents from the last N days
        try:
            from datetime import timedelta
            
            cutoff_date = (datetime.utcnow() - timedelta(days=days)).isoformat()
            
            # Get all documents and filter by timestamp
            all_docs = self.vector_store.get_all_documents(limit=limit)
            
            recent_docs = []
            for doc in all_docs:
                metadata = doc.get('metadata', {})
                doc_timestamp = metadata.get('timestamp', metadata.get('added_at', ''))
                
                if doc_timestamp and doc_timestamp >= cutoff_date:
                    recent_docs.append(doc)
            
            # Sort by timestamp (newest first)
            recent_docs.sort(
                key=lambda x: x.get('metadata', {}).get('timestamp', ''),
                reverse=True
            )
            
            return recent_docs[:limit]
            
        except Exception as e:
            logger.error(f"Failed to get recent documents: {e}")
            raise
    
    def delete_documents(self, filter_metadata: Dict[str, Any]) -> int:
        # Delete documents matching the filter criteria
        try:
            return self.vector_store.delete_documents(filter_metadata)
        except Exception as e:
            logger.error(f"Failed to delete documents: {e}")
            raise
    
    def get_collection_stats(self) -> Dict[str, Any]:
        # Get statistics about the document collection
        try:
            return self.vector_store.get_stats()
        except Exception as e:
            logger.error(f"Failed to get collection stats: {e}")
            return {'error': str(e)}
    
    def search_by_content_type(self, content_type: str, query: str = "", n_results: int = 10) -> List[Dict[str, Any]]:
        # Search for documents by content type (email, calendar, social, etc.)
        try:
            filter_metadata = {'source': content_type}
            
            if query:
                return self.query_texts(query, n_results, filter_metadata)
            else:
                # Get all documents of this type
                all_docs = self.vector_store.get_all_documents()
                filtered_docs = [
                    doc for doc in all_docs 
                    if doc.get('metadata', {}).get('source') == content_type
                ]
                return filtered_docs[:n_results]
                
        except Exception as e:
            logger.error(f"Failed to search by content type: {e}")
            raise
    
    def get_user_documents(self, user_id: int, n_results: int = 50) -> List[Dict[str, Any]]:
        # Get all documents for a specific user
        try:
            filter_metadata = {'user_id': user_id}
            
            # Get all documents for this user
            all_docs = self.vector_store.get_all_documents()
            user_docs = [
                doc for doc in all_docs 
                if doc.get('metadata', {}).get('user_id') == user_id
            ]
            
            return user_docs[:n_results]
            
        except Exception as e:
            logger.error(f"Failed to get user documents: {e}")
            raise


# Global RAG pipeline instance
rag_pipeline = RAGPipeline()
