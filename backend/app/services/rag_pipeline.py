import chromadb
from chromadb.config import Settings as ChromaSettings
from typing import List, Dict, Any, Optional
from datetime import datetime
import hashlib
import logging
from langchain_ollama import OllamaEmbeddings

from app.core.config import settings

logger = logging.getLogger(__name__)


class RAGPipeline:
    """
    Retrieval-Augmented Generation pipeline using ChromaDB for vector storage
    and semantic search capabilities.
    """
    
    def __init__(self):
        self.client = None
        self.collection = None
        self.embedding_model = None
        self._initialize_chroma()
    
    def _initialize_chroma(self):
        """Initializing ChromaDB client and collection."""
        try:
            # Initializing ChromaDB client
            self.client = chromadb.PersistentClient(
                path=settings.CHROMA_DB_PATH,
                settings=ChromaSettings(
                    anonymized_telemetry=False,
                    allow_reset=True
                )
            )
            
            # Initialize embeddings first
            self._initialize_embeddings()
            
            # Create embedding function for ChromaDB
            class OllamaEmbeddingFunction:
                def __init__(self, embedding_model):
                    self.embedding_model = embedding_model
                
                def __call__(self, input):
                    # Handle both single strings and lists of strings
                    if isinstance(input, str):
                        return self.embedding_model.embed_query(input)
                    elif isinstance(input, list):
                        return self.embedding_model.embed_documents(input)
                    else:
                        raise ValueError(f"Unsupported input type: {type(input)}")
            
            # Get or create collection with custom embedding function
            self.collection = self.client.get_or_create_collection(
                name="londoolink_documents",
                metadata={"description": "Londoolink AI document embeddings"},
                embedding_function=OllamaEmbeddingFunction(self.embedding_model)
            )
            
            logger.info(f"ChromaDB initialized with {self.collection.count()} documents")
            
        except Exception as e:
            logger.error(f"Failed to initialize ChromaDB: {e}")
            raise
    
    def _initialize_embeddings(self):
        """Initializing Ollama embeddings model."""
        try:
            # Use Ollama embeddings with llama3 model
            self.embedding_model = OllamaEmbeddings(
                model="llama3",
                base_url=settings.OLLAMA_BASE_URL
            )
            logger.info("Ollama embeddings initialized successfully with llama3 model")
        except Exception as e:
            logger.error(f"Failed to initialize Ollama embeddings: {e}")
            raise
    
    def _chunk_text(self, text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
        """
        Split text into overlapping chunks for better retrieval.
        """
        if len(text) <= chunk_size:
            return [text]
        
        chunks = []
        start = 0
        
        while start < len(text):
            end = start + chunk_size
            
            # Try to break at sentence boundary
            if end < len(text):
                # Look for sentence endings
                sentence_end = text.rfind('.', start, end)
                if sentence_end > start + chunk_size // 2:
                    end = sentence_end + 1
            
            chunk = text[start:end].strip()
            if chunk:
                chunks.append(chunk)
            
            start = end - overlap
        
        return chunks
    
    def _generate_id(self, text: str, metadata: Dict[str, Any]) -> str:
        """Generate unique ID for document chunk."""
        content = f"{text}_{metadata.get('source', '')}_{metadata.get('timestamp', '')}"
        return hashlib.md5(content.encode()).hexdigest()
    
    def add_text(self, text: str, metadata: Dict[str, Any]) -> List[str]:
        """
        Add text to the vector database with chunking and embedding.
        
        Args:
            text: Text content to add
            metadata: Metadata about the text (source, timestamp, etc.)
            
        Returns:
            List of document IDs that were added
        """
        try:
            # Chunk the text
            chunks = self._chunk_text(text)
            
            # Prepare data for ChromaDB
            ids = []
            documents = []
            metadatas = []
            
            for i, chunk in enumerate(chunks):
                # Create unique ID for each chunk
                chunk_metadata = {
                    **metadata,
                    'chunk_index': i,
                    'total_chunks': len(chunks),
                    'added_at': datetime.utcnow().isoformat()
                }
                
                doc_id = self._generate_id(chunk, chunk_metadata)
                
                ids.append(doc_id)
                documents.append(chunk)
                metadatas.append(chunk_metadata)
            
            # Add to ChromaDB (it will generate embeddings automatically)
            self.collection.add(
                ids=ids,
                documents=documents,
                metadatas=metadatas
            )
            
            logger.info(f"Added {len(chunks)} chunks to vector database")
            return ids
            
        except Exception as e:
            logger.error(f"Failed to add text to RAG pipeline: {e}")
            raise
    
    def query_texts(self, query: str, n_results: int = 5, filter_metadata: Optional[Dict] = None) -> List[Dict[str, Any]]:
        """
        Query the vector database for relevant documents.
        
        Args:
            query: Search query
            n_results: Number of results to return
            filter_metadata: Optional metadata filters
            
        Returns:
            List of relevant documents with metadata and scores
        """
        try:
            # Query ChromaDB
            results = self.collection.query(
                query_texts=[query],
                n_results=n_results,
                where=filter_metadata
            )
            
            # Format results
            formatted_results = []
            
            if results['documents'] and results['documents'][0]:
                for i in range(len(results['documents'][0])):
                    result = {
                        'id': results['ids'][0][i],
                        'content': results['documents'][0][i],
                        'metadata': results['metadatas'][0][i],
                        'distance': results['distances'][0][i] if results['distances'] else None
                    }
                    formatted_results.append(result)
            
            logger.info(f"Retrieved {len(formatted_results)} results for query: {query[:50]}...")
            return formatted_results
            
        except Exception as e:
            logger.error(f"Failed to query RAG pipeline: {e}")
            raise
    
    def get_collection_stats(self) -> Dict[str, Any]:
        """Get statistics about the document collection."""
        try:
            count = self.collection.count()
            return {
                'total_documents': count,
                'collection_name': self.collection.name,
                'database_path': settings.CHROMA_DB_PATH
            }
        except Exception as e:
            logger.error(f"Failed to get collection stats: {e}")
            return {'error': str(e)}
    
    def delete_documents(self, filter_metadata: Dict[str, Any]) -> int:
        """
        Delete documents matching the filter criteria.
        
        Args:
            filter_metadata: Metadata filters to match documents for deletion
            
        Returns:
            Number of documents deleted
        """
        try:
            # Get documents matching the filter
            results = self.collection.get(where=filter_metadata)
            
            if results['ids']:
                # Delete the documents
                self.collection.delete(ids=results['ids'])
                deleted_count = len(results['ids'])
                logger.info(f"Deleted {deleted_count} documents")
                return deleted_count
            
            return 0
            
        except Exception as e:
            logger.error(f"Failed to delete documents: {e}")
            raise


# Global RAG pipeline instance
rag_pipeline = RAGPipeline()
