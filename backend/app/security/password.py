import logging

from pwdlib import PasswordHash

logger = logging.getLogger(__name__)

# Create password hash instance with recommended Argon2 settings
# Falls back to bcrypt if Argon2 is not available
try:
    password_hash = PasswordHash.recommended()
    logger.info("Password hashing initialized with Argon2")
except Exception as e:
    logger.warning(f"Argon2 not available, falling back to bcrypt: {e}")
    from passlib.context import CryptContext

    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    password_hash = None


def hash_password(password: str) -> str:
    # Hash a password
    if password_hash:
        return password_hash.hash(password)
    else:
        # Fallback to bcrypt
        return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    # Verify a password
    if password_hash:
        return password_hash.verify(plain_password, hashed_password)
    else:
        # Fallback to bcrypt
        return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    # Alias for hash_password for compatibility with FastAPI examples
    return hash_password(password)
