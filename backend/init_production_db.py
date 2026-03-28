#!/usr/bin/env python3
"""
Initialize production database with all tables.
Run this once on Render to create tables if migrations fail.
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.db.base import Base, engine
from app.models.user import User
from app.models.consent import UserConsent
from app.models.connected_service import ConnectedService
from app.models.audit_log import AuditLog

def init_db():
    """Create all database tables."""
    try:
        print("Creating database tables...")
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully!")
        
        # Test connection
        from app.db.base import SessionLocal
        db = SessionLocal()
        result = db.execute("SELECT 1")
        db.close()
        print("✅ Database connection verified!")
        
        return True
    except Exception as e:
        print(f"❌ Error creating tables: {e}")
        return False

if __name__ == "__main__":
    success = init_db()
    sys.exit(0 if success else 1)
