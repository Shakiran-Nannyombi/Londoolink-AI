"""Integration tests for Backboard configuration at application startup."""
import pytest
from unittest.mock import patch


class TestBackboardStartupValidation:
    """Integration tests for Backboard configuration validation at startup."""
    
    def test_app_starts_with_backboard_disabled(self):
        """Test that application starts successfully when USE_BACKBOARD is False."""
        with patch("app.core.config.settings") as mock_settings:
            mock_settings.USE_BACKBOARD = False
            mock_settings.BACKBOARD_API_KEY = None
            mock_settings.ENVIRONMENT = "testing"
            
            # Import validate function after patching
            from app.core.config import validate_backboard_config
            
            # Should not raise any exception
            validate_backboard_config()
    
    def test_app_fails_to_start_with_invalid_backboard_config(self):
        """Test that application fails to start when USE_BACKBOARD is True but config is invalid."""
        with patch("app.core.config.settings") as mock_settings:
            mock_settings.USE_BACKBOARD = True
            mock_settings.BACKBOARD_API_KEY = None
            
            from app.core.config import validate_backboard_config
            
            with pytest.raises(RuntimeError) as exc_info:
                validate_backboard_config()
            
            assert "BACKBOARD_API_KEY is required" in str(exc_info.value)
    
    def test_app_starts_with_valid_backboard_config(self):
        """Test that application starts successfully with valid Backboard configuration."""
        with patch("app.core.config.settings") as mock_settings:
            mock_settings.USE_BACKBOARD = True
            mock_settings.BACKBOARD_API_KEY = "espr_valid_test_key_12345"
            mock_settings.BACKBOARD_BASE_URL = "https://api.backboard.io"
            
            from app.core.config import validate_backboard_config
            
            # Should not raise any exception
            validate_backboard_config()
    
    def test_validation_order_in_main(self):
        """Test that both Auth0 and Backboard validations are called at startup."""
        with (
            patch("app.core.config.validate_auth0_config") as mock_auth0,
            patch("app.core.config.validate_backboard_config") as mock_backboard,
            patch("app.core.config.settings") as mock_settings,
        ):
            mock_settings.ENVIRONMENT = "testing"
            
            # Import main to trigger startup validations
            # Note: This will execute the validation calls at module level
            import importlib
            import app.main
            importlib.reload(app.main)
            
            # Both validations should have been called
            assert mock_auth0.called
            assert mock_backboard.called
