import logging
from typing import List, Union

from langchain_ollama import OllamaEmbeddings

from app.core.config import settings

logger = logging.getLogger(__name__)


class EmbeddingManager:
    # Manages embeddings using Ollama

    def __init__(self):
        self.embedding_model = None
        self._initialize()

    def _initialize(self):
        # Initialize Ollama embeddings model
        try:
            self.embedding_model = OllamaEmbeddings(
                model="llama3", base_url=settings.OLLAMA_BASE_URL
            )
            logger.info("Ollama embeddings initialized successfully with llama3 model")
        except Exception as e:
            logger.error(f"Failed to initialize Ollama embeddings: {e}")
            raise

    def embed_query(self, text: str) -> List[float]:
        # Embed a single query text
        try:
            return self.embedding_model.embed_query(text)
        except Exception as e:
            logger.error(f"Failed to embed query: {e}")
            raise

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        # Embed multiple documents
        try:
            return self.embedding_model.embed_documents(texts)
        except Exception as e:
            logger.error(f"Failed to embed documents: {e}")
            raise


class ChromaEmbeddingFunction:
    # ChromaDB-compatible embedding function wrapper

    def __init__(self, embedding_manager: EmbeddingManager):
        self.embedding_manager = embedding_manager

    def name(self) -> str:
        # Required by ChromaDB
        return "ollama_embeddings"

    def __call__(
        self, input: Union[str, List[str]]
    ) -> Union[List[float], List[List[float]]]:
        # Handle both single strings and lists of strings for ChromaDB
        if isinstance(input, str):
            return self.embedding_manager.embed_query(input)
        elif isinstance(input, list):
            return self.embedding_manager.embed_documents(input)
        else:
            raise ValueError(f"Unsupported input type: {type(input)}")


# Global embedding manager instance
embedding_manager = EmbeddingManager()
