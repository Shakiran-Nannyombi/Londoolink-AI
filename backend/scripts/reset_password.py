#!/usr/bin/env python3
"""Reset user password"""
import sys
from app.db.base import SessionLocal
from app.models.user import User
from app.security.password import hash_password

def reset_password(email: str, new_password: str):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        
        if not user:
            print(f"❌ User {email} not found in database")
            return False
        
        print(f"✓ User found: {email}")
        
        # Hash the new password
        hashed = hash_password(new_password)
        user.hashed_password = hashed
        
        db.commit()
        print(f"✅ Password reset successfully for {email}")
        print(f"   New password: {new_password}")
        return True
            
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python3 reset_password.py <email> <new_password>")
        print("\nAvailable users:")
        db = SessionLocal()
        users = db.query(User).all()
        for u in users:
            print(f"  - {u.email}")
        db.close()
        sys.exit(1)
    
    email = sys.argv[1]
    new_password = sys.argv[2]
    
    print(f"Resetting password for: {email}")
    print("=" * 50)
    
    success = reset_password(email, new_password)
    sys.exit(0 if success else 1)
