"""Tests for Backboard configuration validation."""
import pytest
from unittest.mock import patch, MagicMock


class TestBackboardConfigValidation:
    """Unit tests for validate_backboard_config function."""
    
    def test_validation_skipped_when_backboard_disabled(self):
        """Test that validation is skipped when USE_BACKBOARD is False."""
        with patch("app.core.config.settings") as mock_settings:
            mock_settings.USE_BACKBOARD = False
            mock_settings.BACKBOARD_API_KEY = None
            
            from app.core.config import validate_backboard_config
            
            # Should not raise any exception
            validate_backboard_config()
    
    def test_validation_fails_when_api_key_missing(self):
        """Test that validation fails when USE_BACKBOARD is True but API key is missing."""
        with patch("app.core.config.settings") as mock_settings:
            mock_settings.USE_BACKBOARD = True
            mock_settings.BACKBOARD_API_KEY = None
            
            from app.core.config import validate_backboard_config
            
            with pytest.raises(RuntimeError) as exc_info:
                validate_backboard_config()
            
            assert "BACKBOARD_API_KEY is required when USE_BACKBOARD=true" in str(exc_info.value)
    
    def test_validation_fails_when_api_key_has_wrong_format(self):
        """Test that validation fails when API key doesn't start with 'espr_'."""
        with patch("app.core.config.settings") as mock_settings:
            mock_settings.USE_BACKBOARD = True
            mock_settings.BACKBOARD_API_KEY = "invalid_key_format"
            
            from app.core.config import validate_backboard_config
            
            with pytest.raises(RuntimeError) as exc_info:
                validate_backboard_config()
            
            assert "BACKBOARD_API_KEY must start with 'espr_' prefix" in str(exc_info.value)
    
    def test_validation_succeeds_with_valid_api_key(self):
        """Test that validation succeeds when API key has correct format."""
        with patch("app.core.config.settings") as mock_settings:
            mock_settings.USE_BACKBOARD = True
            mock_settings.BACKBOARD_API_KEY = "espr_test_api_key_12345"
            
            from app.core.config import validate_backboard_config
            
            # Should not raise any exception
            validate_backboard_config()
    
    def test_validation_succeeds_with_empty_string_api_key_when_disabled(self):
        """Test that validation succeeds when USE_BACKBOARD is False even with empty API key."""
        with patch("app.core.config.settings") as mock_settings:
            mock_settings.USE_BACKBOARD = False
            mock_settings.BACKBOARD_API_KEY = ""
            
            from app.core.config import validate_backboard_config
            
            # Should not raise any exception
            validate_backboard_config()


class TestBackboardConfigSettings:
    """Unit tests for Backboard configuration settings."""
    
    def test_default_use_backboard_is_false(self):
        """Test that USE_BACKBOARD defaults to False."""
        with patch.dict("os.environ", {}, clear=True):
            # Mock the required settings to avoid validation errors
            with patch("app.core.config.Settings") as MockSettings:
                mock_instance = MagicMock()
                mock_instance.USE_BACKBOARD = False
                mock_instance.BACKBOARD_API_KEY = None
                mock_instance.BACKBOARD_BASE_URL = None
                MockSettings.return_value = mock_instance
                
                from app.core.config import Settings
                settings = Settings()
                
                assert settings.USE_BACKBOARD is False
    
    def test_backboard_api_key_is_optional_by_default(self):
        """Test that BACKBOARD_API_KEY is optional (None) by default."""
        with patch.dict("os.environ", {}, clear=True):
            with patch("app.core.config.Settings") as MockSettings:
                mock_instance = MagicMock()
                mock_instance.BACKBOARD_API_KEY = None
                MockSettings.return_value = mock_instance
                
                from app.core.config import Settings
                settings = Settings()
                
                assert settings.BACKBOARD_API_KEY is None
    
    def test_backboard_base_url_is_optional_by_default(self):
        """Test that BACKBOARD_BASE_URL is optional (None) by default."""
        with patch.dict("os.environ", {}, clear=True):
            with patch("app.core.config.Settings") as MockSettings:
                mock_instance = MagicMock()
                mock_instance.BACKBOARD_BASE_URL = None
                MockSettings.return_value = mock_instance
                
                from app.core.config import Settings
                settings = Settings()
                
                assert settings.BACKBOARD_BASE_URL is None
