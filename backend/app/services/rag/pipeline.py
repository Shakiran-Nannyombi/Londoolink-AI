import logging
from datetime import datetime
from typing import Any, Dict, List, Optional

from app.core.config import settings
from .chunker import text_chunker
from .embeddings import embedding_manager
from .vector_store import vector_store

logger = logging.getLogger(__name__)


class RAGPipeline:
    # Modern RAG pipeline with modular components and pluggable backend

    def __init__(self):
        self.use_backboard = settings.USE_BACKBOARD
        
        if self.use_backboard:
            # Import BackboardService only when needed
            from app.services.backboard.backboard_service import BackboardService
            
            self.backend = BackboardService(
                api_key=settings.BACKBOARD_API_KEY,
                base_url=settings.BACKBOARD_BASE_URL
            )
            logger.info("RAG Pipeline initialized with Backboard backend")
        else:
            # Use ChromaDB backend
            self.chunker = text_chunker
            self.vector_store = vector_store
            self.embedding_manager = embedding_manager
            self.backend = None
            logger.info("RAG Pipeline initialized with ChromaDB backend")

    def add_text(self, text: str, metadata: Dict[str, Any]) -> List[str]:
        # Add text to the RAG pipeline with automatic chunking and embedding
        try:
            # Enhance metadata with timestamp if not present
            if "timestamp" not in metadata:
                metadata["timestamp"] = datetime.utcnow().isoformat()

            if self.use_backboard:
                # Route to Backboard backend
                try:
                    # Chunk the text with metadata
                    chunk_data = text_chunker.chunk_with_metadata(text, metadata)
                    
                    # Add documents in batch to Backboard
                    documents_to_add = [
                        (chunk_text, chunk_metadata)
                        for chunk_text, chunk_metadata in chunk_data
                    ]
                    
                    document_ids = self.backend.add_documents_batch(documents_to_add)
                    logger.info(f"Added {len(chunk_data)} chunks to Backboard")
                    return document_ids
                except Exception as e:
                    # Graceful degradation: log error and return empty list
                    logger.error(f"Backboard add_text failed, operating in degraded mode: {e}", exc_info=True)
                    logger.warning("Operating in degraded mode: Backboard unavailable for document storage")
                    return []
            else:
                # Route to ChromaDB backend
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

                logger.info(f"Added {len(chunk_data)} chunks to ChromaDB")
                return document_ids

        except Exception as e:
            logger.error(f"Failed to add text to RAG pipeline: {e}")
            raise

    def query_texts(
        self, query: str, n_results: int = 5, filter_metadata: Optional[Dict] = None
    ) -> List[Dict[str, Any]]:
        # Query the RAG pipeline for relevant documents
        try:
            if self.use_backboard:
                # Route to Backboard backend
                try:
                    return self.backend.search_documents(query, n_results, filter_metadata)
                except Exception as e:
                    # Graceful degradation: log error and return empty results
                    logger.error(f"Backboard query_texts failed, operating in degraded mode: {e}", exc_info=True)
                    logger.warning("Operating in degraded mode: Backboard unavailable for document search")
                    return []
            else:
                # Route to ChromaDB backend
                return self.vector_store.query_documents(query, n_results, filter_metadata)
        except Exception as e:
            logger.error(f"Failed to query RAG pipeline: {e}")
            raise

    def get_recent_documents(
        self, days: int = 7, limit: int = 50
    ) -> List[Dict[str, Any]]:
        # Get recent documents from the last N days
        try:
            from datetime import timedelta

            cutoff_date = (datetime.utcnow() - timedelta(days=days)).isoformat()

            if self.use_backboard:
                # For Backboard, we need to query with a filter
                # Note: This is a simplified implementation
                # In production, you might want to add a date range filter to the Backboard API
                logger.warning("get_recent_documents with Backboard backend uses simplified filtering")
                try:
                    # Query all documents and filter client-side
                    # This is not optimal but maintains backward compatibility
                    all_docs = self.backend.search_documents(
                        query="",  # Empty query to get all documents
                        n_results=limit * 2  # Get more to account for filtering
                    )
                    
                    recent_docs = []
                    for doc in all_docs:
                        metadata = doc.get("metadata", {})
                        doc_timestamp = metadata.get("timestamp", metadata.get("added_at", ""))
                        
                        if doc_timestamp and doc_timestamp >= cutoff_date:
                            recent_docs.append(doc)
                    
                    # Sort by timestamp (newest first)
                    recent_docs.sort(
                        key=lambda x: x.get("metadata", {}).get("timestamp", ""), reverse=True
                    )
                    
                    return recent_docs[:limit]
                except Exception as e:
                    # Graceful degradation: log error and return empty results
                    logger.error(f"Backboard get_recent_documents failed, operating in degraded mode: {e}", exc_info=True)
                    logger.warning("Operating in degraded mode: Backboard unavailable for recent documents")
                    return []
            else:
                # ChromaDB backend
                # Get all documents and filter by timestamp
                all_docs = self.vector_store.get_all_documents(limit=limit)

                recent_docs = []
                for doc in all_docs:
                    metadata = doc.get("metadata", {})
                    doc_timestamp = metadata.get("timestamp", metadata.get("added_at", ""))

                    if doc_timestamp and doc_timestamp >= cutoff_date:
                        recent_docs.append(doc)

                # Sort by timestamp (newest first)
                recent_docs.sort(
                    key=lambda x: x.get("metadata", {}).get("timestamp", ""), reverse=True
                )

                return recent_docs[:limit]

        except Exception as e:
            logger.error(f"Failed to get recent documents: {e}")
            raise

    def delete_documents(self, filter_metadata: Dict[str, Any]) -> int:
        # Delete documents matching the filter criteria
        try:
            if self.use_backboard:
                # Route to Backboard backend
                try:
                    return self.backend.delete_documents(filter_metadata)
                except Exception as e:
                    # Graceful degradation: log error and return 0
                    logger.error(f"Backboard delete_documents failed, operating in degraded mode: {e}", exc_info=True)
                    logger.warning("Operating in degraded mode: Backboard unavailable for document deletion")
                    return 0
            else:
                # Route to ChromaDB backend
                return self.vector_store.delete_documents(filter_metadata)
        except Exception as e:
            logger.error(f"Failed to delete documents: {e}")
            raise

    def get_collection_stats(self) -> Dict[str, Any]:
        # Get statistics about the document collection
        try:
            if self.use_backboard:
                # Backboard doesn't have a direct stats API
                # Return a simplified stats response
                logger.warning("get_collection_stats with Backboard backend returns limited stats")
                return {
                    "backend": "backboard",
                    "message": "Stats not available for Backboard backend"
                }
            else:
                # ChromaDB backend
                return self.vector_store.get_stats()
        except Exception as e:
            logger.error(f"Failed to get collection stats: {e}")
            return {"error": str(e)}

    def search_by_content_type(
        self, content_type: str, query: str = "", n_results: int = 10
    ) -> List[Dict[str, Any]]:
        # Search for documents by content type (email, calendar, social, etc.)
        try:
            filter_metadata = {"source": content_type}

            if query:
                return self.query_texts(query, n_results, filter_metadata)
            else:
                if self.use_backboard:
                    # For Backboard, use search with filter but empty query
                    try:
                        return self.backend.search_documents(
                            query="",  # Empty query
                            n_results=n_results,
                            filter_metadata=filter_metadata
                        )
                    except Exception as e:
                        # Graceful degradation: log error and return empty results
                        logger.error(f"Backboard search_by_content_type failed, operating in degraded mode: {e}", exc_info=True)
                        logger.warning("Operating in degraded mode: Backboard unavailable for content type search")
                        return []
                else:
                    # ChromaDB backend - get all documents of this type
                    all_docs = self.vector_store.get_all_documents()
                    filtered_docs = [
                        doc
                        for doc in all_docs
                        if doc.get("metadata", {}).get("source") == content_type
                    ]
                    return filtered_docs[:n_results]

        except Exception as e:
            logger.error(f"Failed to search by content type: {e}")
            raise

    def get_user_documents(
        self, user_id: int, n_results: int = 50
    ) -> List[Dict[str, Any]]:
        # Get all documents for a specific user
        try:
            filter_metadata = {"user_id": user_id}

            if self.use_backboard:
                # For Backboard, use search with user_id filter
                try:
                    return self.backend.search_documents(
                        query="",  # Empty query to get all documents
                        n_results=n_results,
                        filter_metadata=filter_metadata
                    )
                except Exception as e:
                    # Graceful degradation: log error and return empty results
                    logger.error(f"Backboard get_user_documents failed, operating in degraded mode: {e}", exc_info=True)
                    logger.warning("Operating in degraded mode: Backboard unavailable for user documents")
                    return []
            else:
                # ChromaDB backend - get all documents for this user
                all_docs = self.vector_store.get_all_documents()
                user_docs = [
                    doc
                    for doc in all_docs
                    if doc.get("metadata", {}).get("user_id") == user_id
                ]

                return user_docs[:n_results]

        except Exception as e:
            logger.error(f"Failed to get user documents: {e}")
            raise


# Global RAG pipeline instance
rag_pipeline = RAGPipeline()
