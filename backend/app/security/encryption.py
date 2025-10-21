from cryptography.fernet import Fernet
from app.core.config import settings
import base64


def get_fernet_key() -> Fernet:
    """
    Get Fernet encryption instance using the encryption key from settings.
    
    Returns:
        Fernet encryption instance
    """
    # Convert hex string to bytes and then to base64 for Fernet
    key_bytes = bytes.fromhex(settings.ENCRYPTION_KEY)
    # Fernet requires a 32-byte key encoded in base64
    fernet_key = base64.urlsafe_b64encode(key_bytes[:32])
    return Fernet(fernet_key)


def encrypt(data: str) -> str:
    """
    Encrypt a string using AES encryption.
    
    Args:
        data: String to encrypt
        
    Returns:
        Encrypted string (base64 encoded)
    """
    if not data:
        return ""
    
    fernet = get_fernet_key()
    encrypted_data = fernet.encrypt(data.encode())
    return base64.b64encode(encrypted_data).decode()


def decrypt(encrypted_data: str) -> str:
    """
    Decrypt an encrypted string.
    
    Args:
        encrypted_data: Base64 encoded encrypted string
        
    Returns:
        Decrypted string
    """
    if not encrypted_data:
        return ""
    
    try:
        fernet = get_fernet_key()
        decoded_data = base64.b64decode(encrypted_data.encode())
        decrypted_data = fernet.decrypt(decoded_data)
        return decrypted_data.decode()
    except Exception as e:
        raise ValueError(f"Failed to decrypt data: {str(e)}")
