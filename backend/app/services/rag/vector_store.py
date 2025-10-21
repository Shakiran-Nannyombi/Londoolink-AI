import hashlib
import logging
from datetime import datetime
from typing import Any, Dict, List, Optional

import chromadb
from chromadb.config import Settings as ChromaSettings

from app.core.config import settings

from .embeddings import ChromaEmbeddingFunction, embedding_manager

logger = logging.getLogger(__name__)


class VectorStore:
    # Manages ChromaDB vector storage operations

    def __init__(self, collection_name: str = "londoolink_documents"):
        self.client = None
        self.collection = None
        self.collection_name = collection_name
        self._initialize()

    def _initialize(self):
        # Initialize ChromaDB client and collection
        try:
            # Initialize ChromaDB client
            self.client = chromadb.PersistentClient(
                path=settings.CHROMA_DB_PATH,
                settings=ChromaSettings(anonymized_telemetry=False, allow_reset=True),
            )

            # Create embedding function
            embedding_function = ChromaEmbeddingFunction(embedding_manager)

            # Get or create collection with custom embedding function
            self.collection = self.client.get_or_create_collection(
                name=self.collection_name,
                metadata={"description": "Londoolink AI document embeddings"},
                embedding_function=embedding_function,
            )

            logger.info(
                f"ChromaDB initialized with {self.collection.count()} documents"
            )

        except Exception as e:
            logger.error(f"Failed to initialize ChromaDB: {e}")
            raise

    def add_documents(
        self,
        documents: List[str],
        metadatas: List[Dict[str, Any]],
        ids: Optional[List[str]] = None,
    ) -> List[str]:
        # Add documents to the vector store
        try:
            if ids is None:
                ids = [
                    self._generate_id(doc, meta)
                    for doc, meta in zip(documents, metadatas)
                ]

            # Ensure all metadata has timestamp
            for metadata in metadatas:
                if "added_at" not in metadata:
                    metadata["added_at"] = datetime.utcnow().isoformat()

            # Add to ChromaDB
            self.collection.add(ids=ids, documents=documents, metadatas=metadatas)

            logger.info(f"Added {len(documents)} documents to vector store")
            return ids

        except Exception as e:
            logger.error(f"Failed to add documents to vector store: {e}")
            raise

    def query_documents(
        self, query: str, n_results: int = 5, filter_metadata: Optional[Dict] = None
    ) -> List[Dict[str, Any]]:
        # Query the vector store for relevant documents
        try:
            # Query ChromaDB
            results = self.collection.query(
                query_texts=[query], n_results=n_results, where=filter_metadata
            )

            # Format results
            formatted_results = []

            if results["documents"] and results["documents"][0]:
                for i in range(len(results["documents"][0])):
                    result = {
                        "id": results["ids"][0][i],
                        "content": results["documents"][0][i],
                        "metadata": results["metadatas"][0][i],
                        "distance": (
                            results["distances"][0][i] if results["distances"] else None
                        ),
                    }
                    formatted_results.append(result)

            logger.info(
                f"Retrieved {len(formatted_results)} results for query: {query[:50]}..."
            )
            return formatted_results

        except Exception as e:
            logger.error(f"Failed to query vector store: {e}")
            raise

    def get_all_documents(self, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        # Get all documents from the collection
        try:
            results = self.collection.get(limit=limit)

            formatted_results = []
            if results["documents"]:
                for i in range(len(results["documents"])):
                    result = {
                        "id": results["ids"][i],
                        "content": results["documents"][i],
                        "metadata": (
                            results["metadatas"][i] if results["metadatas"] else {}
                        ),
                    }
                    formatted_results.append(result)

            return formatted_results

        except Exception as e:
            logger.error(f"Failed to get all documents: {e}")
            raise

    def delete_documents(self, filter_metadata: Dict[str, Any]) -> int:
        # Delete documents matching the filter criteria
        try:
            # Get documents matching the filter
            results = self.collection.get(where=filter_metadata)

            if results["ids"]:
                # Delete the documents
                self.collection.delete(ids=results["ids"])
                deleted_count = len(results["ids"])
                logger.info(f"Deleted {deleted_count} documents")
                return deleted_count

            return 0

        except Exception as e:
            logger.error(f"Failed to delete documents: {e}")
            raise

    def get_stats(self) -> Dict[str, Any]:
        # Get statistics about the document collection
        try:
            count = self.collection.count()
            return {
                "total_documents": count,
                "collection_name": self.collection.name,
                "database_path": settings.CHROMA_DB_PATH,
            }
        except Exception as e:
            logger.error(f"Failed to get collection stats: {e}")
            return {"error": str(e)}

    def _generate_id(self, text: str, metadata: Dict[str, Any]) -> str:
        # Generate unique ID for document
        content = f"{text}_{metadata.get('source', '')}_{metadata.get('timestamp', '')}"
        return hashlib.md5(content.encode()).hexdigest()


# Global vector store instance
vector_store = VectorStore()
