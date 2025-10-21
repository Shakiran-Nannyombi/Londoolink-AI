from typing import List
import logging

logger = logging.getLogger(__name__)


class TextChunker:
    """Handles text chunking for better retrieval."""
    
    def __init__(self, chunk_size: int = 500, overlap: int = 50):
        self.chunk_size = chunk_size
        self.overlap = overlap
    
    def chunk_text(self, text: str) -> List[str]:
        """
        Split text into overlapping chunks for better retrieval.
        """
        if len(text) <= self.chunk_size:
            return [text]
        
        chunks = []
        start = 0
        
        while start < len(text):
            end = start + self.chunk_size
            
            # Try to break at sentence boundary
            if end < len(text):
                # Look for sentence endings
                sentence_end = text.rfind('.', start, end)
                if sentence_end > start + self.chunk_size // 2:
                    end = sentence_end + 1
            
            chunk = text[start:end].strip()
            if chunk:
                chunks.append(chunk)
            
            start = end - self.overlap
        
        return chunks
    
    def chunk_with_metadata(self, text: str, base_metadata: dict) -> List[tuple]:
        chunks = self.chunk_text(text)
        
        chunk_data = []
        for i, chunk in enumerate(chunks):
            chunk_metadata = {
                **base_metadata,
                'chunk_index': i,
                'total_chunks': len(chunks),
                'chunk_size': len(chunk)
            }
            chunk_data.append((chunk, chunk_metadata))
        
        return chunk_data


# Global chunker instance
text_chunker = TextChunker()
