import html
import re
from typing import Optional


def clean_ai_response(text: Optional[str]) -> str:
    """
    Clean and format AI response text for better display.
    
    Args:
        text: Raw AI response text
        
    Returns:
        Cleaned and formatted text
    """
    if not text:
        return ""
    
    # Decode HTML entities
    cleaned = html.unescape(text)
    
    # Remove excessive markdown formatting while preserving structure
    cleaned = re.sub(r'\*\*(.*?)\*\*', r'\1', cleaned)  # Remove bold markdown
    cleaned = re.sub(r'\*(.*?)\*', r'\1', cleaned)      # Remove italic markdown
    cleaned = re.sub(r'^#{1,6}\s+', '', cleaned, flags=re.MULTILINE)  # Remove headers
    
    # Convert markdown lists to simple bullets
    cleaned = re.sub(r'^\s*[-*+]\s+', '• ', cleaned, flags=re.MULTILINE)
    cleaned = re.sub(r'^\s*\d+\.\s+', '• ', cleaned, flags=re.MULTILINE)
    
    # Clean up excessive whitespace
    cleaned = re.sub(r'\n\s*\n\s*\n', '\n\n', cleaned)  # Max 2 consecutive newlines
    cleaned = cleaned.strip()
    
    return cleaned