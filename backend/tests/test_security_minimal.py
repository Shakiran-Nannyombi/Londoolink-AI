import os
from datetime import datetime, timedelta, timezone
from unittest.mock import Mock, patch

import pytest

# Set test environment variables before imports
os.environ["SECRET_KEY"] = "test-secret-key-32-characters-long"
os.environ["ENCRYPTION_KEY"] = (
    "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
)
os.environ["JWT_ALGORITHM"] = "HS256"
os.environ["ACCESS_TOKEN_EXPIRE_MINUTES"] = "30"

from fastapi import HTTPException

from app.schemas.token import TokenData
from app.security.encryption import decrypt, encrypt, generate_encryption_key
from app.security.jwt import create_access_token, verify_token
from app.security.password import hash_password, verify_password
from app.security.utils import (
    constant_time_compare,
    generate_secret_key,
    generate_secure_password,
    is_password_strong,
    sanitize_filename,
)


class TestJWTMinimal:
    def test_create_access_token(self):
        # Test JWT token creation
        data = {"sub": "test@example.com"}
        token = create_access_token(data)

        assert isinstance(token, str)
        assert len(token) > 0
        assert "." in token  # JWT has dots

    def test_verify_token_valid(self):
        # Test valid token verification
        data = {"sub": "test@example.com"}
        token = create_access_token(data)

        credentials_exception = HTTPException(status_code=401, detail="Invalid token")
        token_data = verify_token(token, credentials_exception)

        assert isinstance(token_data, TokenData)
        assert token_data.email == "test@example.com"

    def test_verify_token_invalid(self):
        # Test invalid token verification
        invalid_token = "invalid.token.here"
        credentials_exception = HTTPException(status_code=401, detail="Invalid token")

        with pytest.raises(HTTPException):
            verify_token(invalid_token, credentials_exception)


class TestPasswordMinimal:
    def test_hash_password(self):
        # Test password hashing
        password = "testpassword123"
        hashed = hash_password(password)

        assert isinstance(hashed, str)
        assert hashed != password
        assert len(hashed) > 0

    def test_verify_password_correct(self):
        # Test correct password verification
        password = "testpassword123"
        hashed = hash_password(password)

        assert verify_password(password, hashed) is True

    def test_verify_password_incorrect(self):
        # Test incorrect password verification
        password = "testpassword123"
        wrong_password = "wrongpassword"
        hashed = hash_password(password)

        assert verify_password(wrong_password, hashed) is False


class TestEncryptionMinimal:
    def test_encrypt_decrypt(self):
        # Test basic encryption and decryption
        data = "This is sensitive data"
        encrypted = encrypt(data)
        decrypted = decrypt(encrypted)

        assert encrypted != data
        assert decrypted == data

    def test_encrypt_empty_string(self):
        # Test encrypting empty string
        data = ""
        encrypted = encrypt(data)
        decrypted = decrypt(encrypted)

        assert encrypted == ""
        assert decrypted == ""

    def test_generate_encryption_key(self):
        # Test encryption key generation
        key = generate_encryption_key()

        assert isinstance(key, str)
        assert len(key) == 64  # 32 bytes in hex = 64 characters


class TestUtilsMinimal:
    def test_generate_secret_key(self):
        # Test secret key generation
        key = generate_secret_key()

        assert isinstance(key, str)
        assert len(key) == 64  # 32 bytes in hex = 64 characters

    def test_generate_secure_password(self):
        # Test secure password generation
        password = generate_secure_password()

        assert isinstance(password, str)
        assert len(password) == 16  # Default length

        # Check password strength
        is_strong, issues = is_password_strong(password)
        assert is_strong is True
        assert len(issues) == 0

    def test_is_password_strong_valid(self):
        # Test strong password validation
        strong_password = "StrongP@ssw0rd123"
        is_strong, issues = is_password_strong(strong_password)

        assert is_strong is True
        assert len(issues) == 0

    def test_is_password_strong_weak(self):
        # Test weak password validation
        weak_password = "weak"
        is_strong, issues = is_password_strong(weak_password)

        assert is_strong is False
        assert len(issues) > 0

    def test_sanitize_filename(self):
        # Test filename sanitization
        dangerous_filename = "../../../etc/passwd"
        safe_filename = sanitize_filename(dangerous_filename)

        assert "../" not in safe_filename
        # Just check that dangerous characters are removed, don't check exact output
        assert len(safe_filename) > 0
        assert "passwd" in safe_filename

    def test_constant_time_compare_equal(self):
        # Test constant time comparison with equal strings
        string1 = "secret_value"
        string2 = "secret_value"

        assert constant_time_compare(string1, string2) is True

    def test_constant_time_compare_different(self):
        # Test constant time comparison with different strings
        string1 = "secret_value"
        string2 = "different_value"

        assert constant_time_compare(string1, string2) is False
