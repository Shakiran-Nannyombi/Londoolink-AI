import logging
from datetime import datetime, timedelta
from typing import List

from langchain.tools import tool

from app.services.rag import rag_pipeline

logger = logging.getLogger(__name__)


@tool
def semantic_search(query: str) -> str:
    """Search through user's emails, calendar events, and other documents using semantic similarity."""
    try:
        results = rag_pipeline.query_texts(query, n_results=5)

        if not results:
            return "No relevant documents found."

        formatted_results = []
        for result in results:
            metadata = result["metadata"]
            source = metadata.get("source", "unknown")
            timestamp = metadata.get("timestamp", "unknown")
            content_preview = (
                result["content"][:200] + "..."
                if len(result["content"]) > 200
                else result["content"]
            )

            formatted_results.append(
                f"Source: {source} | Time: {timestamp}\nContent: {content_preview}\n"
            )

        return "\n".join(formatted_results)

    except Exception as e:
        logger.error(f"Semantic search tool error: {e}")
        return f"Error performing search: {str(e)}"


@tool
def get_recent_documents(days: str = "7") -> str:
    """Get recently added documents from the last N days."""
    try:
        days_int = int(days)
        cutoff_date = (datetime.utcnow() - timedelta(days=days_int)).isoformat()

        # Query all documents and filter by timestamp
        all_results = rag_pipeline.query_texts(
            "", n_results=50
        )  # Get more results to filter

        recent_results = []
        for result in all_results:
            metadata = result.get("metadata", {})
            doc_timestamp = metadata.get("timestamp", metadata.get("added_at", ""))

            if doc_timestamp and doc_timestamp >= cutoff_date:
                recent_results.append(result)

        if not recent_results:
            return f"No documents found from the last {days} days."

        # Format the recent documents
        formatted_results = []
        for result in recent_results[:10]:  # Limit to 10 most recent
            metadata = result["metadata"]
            source = metadata.get("source", "unknown")
            timestamp = metadata.get("timestamp", "unknown")
            content_preview = (
                result["content"][:150] + "..."
                if len(result["content"]) > 150
                else result["content"]
            )

            formatted_results.append(
                f"Source: {source} | Time: {timestamp}\nContent: {content_preview}\n"
            )

        return (
            f"Found {len(recent_results)} documents from the last {days} days:\n\n"
            + "\n".join(formatted_results)
        )

    except Exception as e:
        logger.error(f"Recent documents tool error: {e}")
        return f"Error retrieving recent documents: {str(e)}"


@tool
def get_document_stats(_: str = "") -> str:
    """Get statistics about the user's document collection."""
    try:
        stats = rag_pipeline.get_collection_stats()
        return f"Document collection stats: {stats}"
    except Exception as e:
        logger.error(f"Document stats tool error: {e}")
        return f"Error getting document stats: {str(e)}"


def get_all_tools() -> List:
    # Get all available tools for agents
    return [semantic_search, get_recent_documents, get_document_stats]
