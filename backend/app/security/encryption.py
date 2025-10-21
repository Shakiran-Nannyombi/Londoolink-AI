from cryptography.fernet import Fernet, InvalidToken
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from app.core.config import settings
import base64
import os
import logging

logger = logging.getLogger(__name__)


def get_fernet_key() -> Fernet:
    # Get Fernet encryption instance using the encryption key from settings
    try:
        # Convert hex string to bytes
        key_bytes = bytes.fromhex(settings.ENCRYPTION_KEY)
        
        # Ensure we have exactly 32 bytes for Fernet
        if len(key_bytes) < 32:
            raise ValueError("Encryption key must be at least 32 bytes (64 hex characters)")
        
        # Use the first 32 bytes and encode for Fernet
        fernet_key = base64.urlsafe_b64encode(key_bytes[:32])
        return Fernet(fernet_key)
        
    except ValueError as e:
        logger.error(f"Invalid encryption key format: {e}")
        raise
    except Exception as e:
        logger.error(f"Failed to initialize Fernet encryption: {e}")
        raise ValueError(f"Encryption initialization failed: {str(e)}")


def encrypt(data: str) -> str:
    # Encrypt a string using Fernet (AES 128 in CBC mode with HMAC)
    if not data:
        return ""
    
    try:
        fernet = get_fernet_key()
        # Fernet handles the base64 encoding internally
        encrypted_data = fernet.encrypt(data.encode('utf-8'))
        return base64.b64encode(encrypted_data).decode('utf-8')
    except Exception as e:
        logger.error(f"Encryption failed: {e}")
        raise ValueError(f"Failed to encrypt data: {str(e)}")


def decrypt(encrypted_data: str) -> str:
    # Decrypt an encrypted string with proper error handling
    if not encrypted_data:
        return ""
    
    try:
        fernet = get_fernet_key()
        decoded_data = base64.b64decode(encrypted_data.encode('utf-8'))
        decrypted_data = fernet.decrypt(decoded_data)
        return decrypted_data.decode('utf-8')
    except InvalidToken:
        logger.error("Invalid token provided for decryption")
        raise ValueError("Invalid encrypted data or corrupted token")
    except Exception as e:
        logger.error(f"Decryption failed: {e}")
        raise ValueError(f"Failed to decrypt data: {str(e)}")


def generate_encryption_key() -> str:
    # Generate a new secure encryption key for Fernet
    key = Fernet.generate_key()
    # Convert base64 key to hex for storage
    key_bytes = base64.urlsafe_b64decode(key)
    return key_bytes.hex()


def encrypt_with_ttl(data: str, ttl_seconds: int) -> str:
    # Encrypt data with a time-to-live (TTL) for automatic expiration
    if not data:
        return ""
    
    try:
        import time
        fernet = get_fernet_key()
        current_time = int(time.time())
        encrypted_data = fernet.encrypt_at_time(data.encode('utf-8'), current_time)
        return base64.b64encode(encrypted_data).decode('utf-8')
    except Exception as e:
        logger.error(f"TTL encryption failed: {e}")
        raise ValueError(f"Failed to encrypt data with TTL: {str(e)}")


def decrypt_with_ttl(encrypted_data: str, ttl_seconds: int) -> str:
    # Decrypt data with TTL validation
    if not encrypted_data:
        return ""
    
    try:
        fernet = get_fernet_key()
        decoded_data = base64.b64decode(encrypted_data.encode('utf-8'))
        decrypted_data = fernet.decrypt(decoded_data, ttl=ttl_seconds)
        return decrypted_data.decode('utf-8')
    except InvalidToken:
        logger.error("Token expired or invalid for TTL decryption")
        raise ValueError("Encrypted data has expired or is invalid")
    except Exception as e:
        logger.error(f"TTL decryption failed: {e}")
        raise ValueError(f"Failed to decrypt data with TTL: {str(e)}")
