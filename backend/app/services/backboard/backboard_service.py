"""Backboard.io service layer for RAG, memory, and thread operations."""

import logging
import time
import requests
from typing import Any, Callable, Dict, List, Optional, Tuple

logger = logging.getLogger(__name__)


# Exception Hierarchy
class BackboardError(Exception):
    """Base exception for Backboard-related errors."""
    pass


class BackboardServiceError(BackboardError):
    """Service-level errors (initialization, configuration)."""
    pass


class BackboardAPIError(BackboardError):
    """API-level errors."""
    
    def __init__(self, message: str, status_code: int):
        super().__init__(message)
        self.status_code = status_code


class BackboardAuthError(BackboardAPIError):
    """Authentication/authorization errors."""
    pass


class BackboardNotFoundError(BackboardAPIError):
    """Resource not found errors."""
    pass


class BackboardRateLimitError(BackboardAPIError):
    """Rate limiting errors."""
    
    def __init__(self, message: str, status_code: int, retry_after: int):
        super().__init__(message, status_code)
        self.retry_after = retry_after


class BackboardServiceUnavailableError(BackboardAPIError):
    """Service unavailable errors."""
    pass


class BackboardService:
    """Service layer for Backboard.io API operations.
    
    Provides methods for:
    - Document operations (add, search, delete)
    - Assistant operations (create, query_memory, add_preference)
    - Thread operations (create, add_message, get_history)
    """
    
    MAX_RETRIES = 3
    INITIAL_BACKOFF = 1.0  # seconds
    MAX_BACKOFF = 10.0     # seconds
    
    def __init__(self, api_key: str, base_url: Optional[str] = None):
        """Initialize Backboard client with API credentials.
        
        Args:
            api_key: Backboard API key (must start with 'espr_')
            base_url: Optional base URL override for testing
            
        Raises:
            BackboardServiceError: If API key is invalid or missing
        """
        if not api_key:
            raise BackboardServiceError("BACKBOARD_API_KEY is required")
        
        if not api_key.startswith("espr_"):
            raise BackboardServiceError(
                "BACKBOARD_API_KEY must start with 'espr_' prefix"
            )
        
        self.api_key = api_key
        self.base_url = base_url or "https://app.backboard.io/api"
        self.headers = {"X-API-Key": self.api_key}
        
        logger.info(f"Initialized BackboardService with base_url={self.base_url}")
    
    def _call_with_retry(
        self,
        operation: Callable,
        *args,
        **kwargs
    ) -> Any:
        """Execute operation with exponential backoff retry.
        
        Retries on:
        - Network errors (ConnectionError, Timeout)
        - Transient API errors (429 Rate Limit, 503 Service Unavailable)
        
        Does not retry on:
        - Authentication errors (401, 403)
        - Client errors (400, 404)
        """
        last_exception = None
        backoff = self.INITIAL_BACKOFF
        
        for attempt in range(self.MAX_RETRIES):
            try:
                return operation(*args, **kwargs)
            except (ConnectionError, requests.exceptions.Timeout) as e:
                last_exception = e
                logger.warning(
                    f"Network error on attempt {attempt + 1}/{self.MAX_RETRIES}: {e}"
                )
            except BackboardAPIError as e:
                if e.status_code in (429, 503):
                    last_exception = e
                    logger.warning(
                        f"Transient API error on attempt {attempt + 1}/{self.MAX_RETRIES}: {e}"
                    )
                else:
                    # Don't retry client errors or auth errors
                    raise
            
            if attempt < self.MAX_RETRIES - 1:
                time.sleep(backoff)
                backoff = min(backoff * 2, self.MAX_BACKOFF)
        
        # All retries exhausted
        raise BackboardServiceError(
            f"Operation failed after {self.MAX_RETRIES} attempts"
        ) from last_exception
    
    def _handle_response(self, response: requests.Response) -> Dict[str, Any]:
        """Handle API response and raise appropriate exceptions."""
        
        if response.status_code == 200:
            return response.json()
        
        elif response.status_code == 400:
            raise BackboardAPIError(
                f"Bad request: {response.text}",
                status_code=400
            )
        
        elif response.status_code == 401:
            raise BackboardAuthError(
                "Invalid API key",
                status_code=401
            )
        
        elif response.status_code == 403:
            raise BackboardAuthError(
                "Insufficient permissions",
                status_code=403
            )
        
        elif response.status_code == 404:
            raise BackboardNotFoundError(
                f"Resource not found: {response.text}",
                status_code=404
            )
        
        elif response.status_code == 429:
            retry_after = response.headers.get("Retry-After", "60")
            raise BackboardRateLimitError(
                f"Rate limit exceeded. Retry after {retry_after} seconds",
                status_code=429,
                retry_after=int(retry_after)
            )
        
        elif response.status_code == 503:
            raise BackboardServiceUnavailableError(
                "Backboard service temporarily unavailable",
                status_code=503
            )
        
        else:
            raise BackboardAPIError(
                f"Unexpected error: {response.status_code} - {response.text}",
                status_code=response.status_code
            )
    
    # Document Operations
    def add_document(
        self, 
        content: str, 
        metadata: Dict[str, Any]
    ) -> str:
        """Add a document to Backboard with metadata.
        
        Args:
            content: Document text content
            metadata: Document metadata (user_id, source, timestamp, etc.)
            
        Returns:
            Document ID from Backboard
            
        Raises:
            BackboardAPIError: If API call fails
        """
        # Validate required metadata fields
        if "user_id" not in metadata:
            raise BackboardServiceError("metadata must include 'user_id' field")
        
        if "source" not in metadata:
            raise BackboardServiceError("metadata must include 'source' field")
        
        def _add_doc():
            response = requests.post(
                f"{self.base_url}/documents",
                headers=self.headers,
                json={
                    "content": content,
                    "metadata": metadata
                },
                timeout=30
            )
            result = self._handle_response(response)
            return result.get("document_id")
        
        doc_id = self._call_with_retry(_add_doc)
        logger.info(f"Added document to Backboard: doc_id={doc_id}, user_id={metadata.get('user_id')}")
        return doc_id
    
    def add_documents_batch(
        self, 
        documents: List[Tuple[str, Dict[str, Any]]]
    ) -> List[str]:
        """Add multiple documents in a single batch operation.
        
        Args:
            documents: List of (content, metadata) tuples
            
        Returns:
            List of document IDs from Backboard
            
        Raises:
            BackboardAPIError: If API call fails
        """
        # Validate all documents have required metadata
        for i, (content, metadata) in enumerate(documents):
            if "user_id" not in metadata:
                raise BackboardServiceError(
                    f"Document at index {i} missing required 'user_id' in metadata"
                )
            if "source" not in metadata:
                raise BackboardServiceError(
                    f"Document at index {i} missing required 'source' in metadata"
                )
        
        def _add_batch():
            response = requests.post(
                f"{self.base_url}/documents/batch",
                headers=self.headers,
                json={
                    "documents": [
                        {"content": content, "metadata": metadata}
                        for content, metadata in documents
                    ]
                },
                timeout=60
            )
            result = self._handle_response(response)
            return result.get("document_ids", [])
        
        doc_ids = self._call_with_retry(_add_batch)
        logger.info(f"Added {len(doc_ids)} documents to Backboard in batch")
        return doc_ids
    
    def search_documents(
        self,
        query: str,
        n_results: int = 5,
        filter_metadata: Optional[Dict] = None
    ) -> List[Dict[str, Any]]:
        """Search for relevant documents using semantic search.
        
        Args:
            query: Search query text
            n_results: Maximum number of results to return
            filter_metadata: Metadata filters (e.g., {"user_id": 123, "source": "email"})
            
        Returns:
            List of documents with content, metadata, and relevance scores
            
        Raises:
            BackboardAPIError: If API call fails
        """
        def _search():
            params = {
                "query": query,
                "n_results": n_results
            }
            
            if filter_metadata:
                params["filter"] = filter_metadata
            
            response = requests.get(
                f"{self.base_url}/documents/search",
                headers=self.headers,
                params=params,
                timeout=30
            )
            result = self._handle_response(response)
            return result.get("results", [])
        
        results = self._call_with_retry(_search)
        logger.info(f"Searched documents: query='{query}', found {len(results)} results")
        return results
    
    def delete_documents(
        self,
        filter_metadata: Dict[str, Any]
    ) -> int:
        """Delete documents matching filter criteria.
        
        Args:
            filter_metadata: Metadata filters for documents to delete
            
        Returns:
            Number of documents deleted
            
        Raises:
            BackboardAPIError: If API call fails
        """
        if not filter_metadata:
            raise BackboardServiceError("filter_metadata cannot be empty for delete operation")
        
        def _delete():
            response = requests.delete(
                f"{self.base_url}/documents",
                headers=self.headers,
                json={"filter": filter_metadata},
                timeout=30
            )
            result = self._handle_response(response)
            return result.get("deleted_count", 0)
        
        deleted_count = self._call_with_retry(_delete)
        logger.info(f"Deleted {deleted_count} documents matching filter: {filter_metadata}")
        return deleted_count
    
    # Assistant Operations
    def create_assistant(
        self,
        user_id: int,
        name: str,
        instructions: str
    ) -> str:
        """Create a Backboard assistant for a user.
        
        Args:
            user_id: User identifier
            name: Assistant name
            instructions: System instructions for the assistant
            
        Returns:
            Assistant ID
            
        Raises:
            BackboardAPIError: If API call fails
        """
        def _create():
            response = requests.post(
                f"{self.base_url}/assistants",
                headers=self.headers,
                json={
                    "name": name,
                    "system_prompt": instructions,
                    "metadata": {"user_id": user_id}
                },
                timeout=30
            )
            result = self._handle_response(response)
            return result.get("assistant_id")
        
        assistant_id = self._call_with_retry(_create)
        logger.info(f"Created assistant for user {user_id}: assistant_id={assistant_id}")
        return assistant_id
    
    def get_or_create_assistant(
        self,
        user_id: int
    ) -> str:
        """Get existing assistant or create new one for user.
        
        Args:
            user_id: User identifier
            
        Returns:
            Assistant ID
            
        Raises:
            BackboardAPIError: If API call fails
        """
        def _list_assistants():
            response = requests.get(
                f"{self.base_url}/assistants",
                headers=self.headers,
                params={"metadata.user_id": user_id},
                timeout=30
            )
            result = self._handle_response(response)
            return result.get("assistants", [])
        
        # Try to find existing assistant for this user
        assistants = self._call_with_retry(_list_assistants)
        
        if assistants:
            assistant_id = assistants[0].get("assistant_id")
            logger.info(f"Found existing assistant for user {user_id}: assistant_id={assistant_id}")
            return assistant_id
        
        # Create new assistant if none exists
        logger.info(f"No assistant found for user {user_id}, creating new one")
        return self.create_assistant(
            user_id=user_id,
            name=f"Londoolink AI Assistant for User {user_id}",
            instructions="You are a helpful AI assistant that helps users manage their daily tasks, emails, calendar events, and priorities. You remember user preferences and provide personalized assistance."
        )
    
    def add_memory(
        self,
        assistant_id: str,
        memory_content: str,
        memory_type: str = "preference"
    ) -> None:
        """Add a memory entry to assistant's memory.
        
        Args:
            assistant_id: Assistant identifier
            memory_content: Memory content text
            memory_type: Type of memory (preference, pattern, context)
            
        Raises:
            BackboardAPIError: If API call fails
        """
        def _add():
            response = requests.post(
                f"{self.base_url}/assistants/{assistant_id}/memory",
                headers=self.headers,
                json={
                    "content": memory_content,
                    "metadata": {"type": memory_type}
                },
                timeout=30
            )
            self._handle_response(response)
        
        self._call_with_retry(_add)
        logger.info(f"Added memory to assistant {assistant_id}: type={memory_type}")
    
    def query_memory(
        self,
        assistant_id: str,
        query: str
    ) -> List[Dict[str, Any]]:
        """Query assistant's memory for relevant information.
        
        Args:
            assistant_id: Assistant identifier
            query: Query text
            
        Returns:
            List of memory entries with content and relevance scores
            
        Raises:
            BackboardAPIError: If API call fails
        """
        def _query():
            response = requests.get(
                f"{self.base_url}/assistants/{assistant_id}/memory/search",
                headers=self.headers,
                params={"query": query},
                timeout=30
            )
            result = self._handle_response(response)
            return result.get("memories", [])
        
        memories = self._call_with_retry(_query)
        logger.info(f"Queried memory for assistant {assistant_id}: query='{query}', found {len(memories)} results")
        return memories
    
    def get_all_memories(
        self,
        assistant_id: str
    ) -> List[Dict[str, Any]]:
        """Retrieve all memory entries for an assistant.
        
        Args:
            assistant_id: Assistant identifier
            
        Returns:
            List of all memory entries
            
        Raises:
            BackboardAPIError: If API call fails
        """
        def _get_all():
            response = requests.get(
                f"{self.base_url}/assistants/{assistant_id}/memory",
                headers=self.headers,
                timeout=30
            )
            result = self._handle_response(response)
            return result.get("memories", [])
        
        memories = self._call_with_retry(_get_all)
        logger.info(f"Retrieved all memories for assistant {assistant_id}: count={len(memories)}")
        return memories
    
    # Thread Operations
    def create_thread(
        self,
        user_id: int,
        thread_type: str,
        initial_message: Optional[str] = None
    ) -> str:
        """Create a new conversation thread.
        
        Args:
            user_id: User identifier
            thread_type: Type of thread (daily, urgent, weekly)
            initial_message: Optional first message in thread
            
        Returns:
            Thread ID
            
        Raises:
            BackboardAPIError: If API call fails
        """
        def _create():
            payload = {
                "metadata": {
                    "user_id": user_id,
                    "thread_type": thread_type
                }
            }
            
            if initial_message:
                payload["initial_message"] = {
                    "role": "assistant",
                    "content": initial_message
                }
            
            response = requests.post(
                f"{self.base_url}/threads",
                headers=self.headers,
                json=payload,
                timeout=30
            )
            result = self._handle_response(response)
            return result.get("thread_id")
        
        thread_id = self._call_with_retry(_create)
        logger.info(f"Created thread for user {user_id}: thread_id={thread_id}, type={thread_type}")
        return thread_id
    
    def add_message(
        self,
        thread_id: str,
        role: str,
        content: str
    ) -> str:
        """Add a message to an existing thread.
        
        Args:
            thread_id: Thread identifier
            role: Message role (user, assistant, system)
            content: Message content
            
        Returns:
            Message ID
            
        Raises:
            BackboardAPIError: If API call fails
        """
        def _add():
            response = requests.post(
                f"{self.base_url}/threads/{thread_id}/messages",
                headers=self.headers,
                json={
                    "role": role,
                    "content": content
                },
                timeout=30
            )
            result = self._handle_response(response)
            return result.get("message_id")
        
        message_id = self._call_with_retry(_add)
        logger.info(f"Added message to thread {thread_id}: message_id={message_id}, role={role}")
        return message_id
    
    def get_thread_history(
        self,
        thread_id: str,
        limit: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """Retrieve message history for a thread.
        
        Args:
            thread_id: Thread identifier
            limit: Optional limit on number of messages to retrieve
            
        Returns:
            List of messages with role, content, and timestamp
            
        Raises:
            BackboardAPIError: If API call fails
        """
        def _get_history():
            params = {}
            if limit is not None:
                params["limit"] = limit
            
            response = requests.get(
                f"{self.base_url}/threads/{thread_id}/messages",
                headers=self.headers,
                params=params,
                timeout=30
            )
            result = self._handle_response(response)
            return result.get("messages", [])
        
        messages = self._call_with_retry(_get_history)
        logger.info(f"Retrieved thread history for {thread_id}: {len(messages)} messages")
        return messages
    
    def list_threads(
        self,
        user_id: int,
        thread_type: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """List all threads for a user, optionally filtered by type.
        
        Args:
            user_id: User identifier
            thread_type: Optional thread type filter
            
        Returns:
            List of threads with metadata
            
        Raises:
            BackboardAPIError: If API call fails
        """
        def _list():
            params = {"metadata.user_id": user_id}
            
            if thread_type:
                params["metadata.thread_type"] = thread_type
            
            response = requests.get(
                f"{self.base_url}/threads",
                headers=self.headers,
                params=params,
                timeout=30
            )
            result = self._handle_response(response)
            return result.get("threads", [])
        
        threads = self._call_with_retry(_list)
        logger.info(f"Listed threads for user {user_id}: found {len(threads)} threads")
        return threads
