import secrets
import string
from typing import Optional
import logging

logger = logging.getLogger(__name__)


def generate_secret_key(length: int = 32) -> str:
    # Generate a cryptographically secure secret key
    return secrets.token_hex(length)


def generate_jwt_secret() -> str:
    # Generate a secure JWT secret key
    return generate_secret_key(32)


def generate_encryption_key() -> str:
    # Generate a secure encryption key for Fernet
    return generate_secret_key(32)


def validate_secret_key(key: str, min_length: int = 32) -> bool:
    # Validate that a secret key meets security requirements
    try:
        # Try to decode hex
        key_bytes = bytes.fromhex(key)
        
        # Check minimum length
        if len(key_bytes) < min_length:
            logger.warning(f"Secret key too short: {len(key_bytes)} bytes, minimum {min_length}")
            return False
            
        return True
        
    except ValueError:
        logger.error("Invalid hex format for secret key")
        return False


def generate_secure_password(length: int = 16, include_symbols: bool = True) -> str:
    # Generate a secure random password
    if length < 12:
        logger.warning("Password length should be at least 12 characters")
        length = 12
    
    # Define character sets
    lowercase = string.ascii_lowercase
    uppercase = string.ascii_uppercase
    digits = string.digits
    symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?" if include_symbols else ""
    
    # Ensure at least one character from each set
    password = [
        secrets.choice(lowercase),
        secrets.choice(uppercase),
        secrets.choice(digits)
    ]
    
    if include_symbols:
        password.append(secrets.choice(symbols))
    
    # Fill the rest with random characters from all sets
    all_chars = lowercase + uppercase + digits + symbols
    for _ in range(length - len(password)):
        password.append(secrets.choice(all_chars))
    
    # Shuffle the password
    secrets.SystemRandom().shuffle(password)
    
    return ''.join(password)


def is_password_strong(password: str) -> tuple[bool, list[str]]:
    # Check if a password meets strength requirements
    issues = []
    
    if len(password) < 8:
        issues.append("Password must be at least 8 characters long")
    
    if not any(c.islower() for c in password):
        issues.append("Password must contain at least one lowercase letter")
    
    if not any(c.isupper() for c in password):
        issues.append("Password must contain at least one uppercase letter")
    
    if not any(c.isdigit() for c in password):
        issues.append("Password must contain at least one digit")
    
    if not any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password):
        issues.append("Password should contain at least one special character")
    
    # Check for common patterns
    if password.lower() in ['password', '123456', 'qwerty', 'admin', 'letmein']:
        issues.append("Password is too common")
    
    return len(issues) == 0, issues


def sanitize_filename(filename: str) -> str:
    # Sanitize a filename to prevent path traversal attacks
    # Remove path separators and dangerous characters
    dangerous_chars = ['/', '\\', '..', '~', '$', '&', '|', ';', '`']
    
    sanitized = filename
    for char in dangerous_chars:
        sanitized = sanitized.replace(char, '_')
    
    # Remove leading/trailing whitespace and dots
    sanitized = sanitized.strip(' .')
    
    # Ensure filename is not empty
    if not sanitized:
        sanitized = 'unnamed_file'
    
    # Limit length
    if len(sanitized) > 255:
        name, ext = sanitized.rsplit('.', 1) if '.' in sanitized else (sanitized, '')
        max_name_length = 250 - len(ext)
        sanitized = name[:max_name_length] + ('.' + ext if ext else '')
    
    return sanitized


def constant_time_compare(a: str, b: str) -> bool:
    # Compare two strings in constant time to prevent timing attacks
    return secrets.compare_digest(a.encode('utf-8'), b.encode('utf-8'))


def generate_csrf_token() -> str:
    # Generate a CSRF token for form protection
    return secrets.token_urlsafe(32)


def generate_api_key(prefix: str = "lnk") -> str:
    # Generate an API key with optional prefix
    random_part = secrets.token_urlsafe(32)
    return f"{prefix}_{random_part}" if prefix else random_part
