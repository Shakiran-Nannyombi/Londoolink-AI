#!/usr/bin/env python3
"""Test login functionality"""
import sys
from app.db.base import SessionLocal
from app.models.user import User
from app.security.password import verify_password, hash_password

def test_user_login(email: str, password: str):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        
        if not user:
            print(f"❌ User {email} not found in database")
            return False
        
        print(f"✓ User found: {email}")
        print(f"  - Has password: {user.hashed_password is not None}")
        print(f"  - Password hash (first 50 chars): {user.hashed_password[:50] if user.hashed_password else 'None'}")
        
        if not user.hashed_password:
            print(f"❌ User has no password set (OAuth user?)")
            return False
        
        # Test password verification
        is_valid = verify_password(password, user.hashed_password)
        
        if is_valid:
            print(f"✅ Password verification PASSED")
            return True
        else:
            print(f"❌ Password verification FAILED")
            
            # Test if we can hash and verify a new password
            print("\nTesting password hashing...")
            test_hash = hash_password(password)
            test_verify = verify_password(password, test_hash)
            print(f"  - New hash works: {test_verify}")
            
            return False
            
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python3 test_login.py <email> <password>")
        print("\nAvailable users:")
        db = SessionLocal()
        users = db.query(User).all()
        for u in users:
            print(f"  - {u.email}")
        db.close()
        sys.exit(1)
    
    email = sys.argv[1]
    password = sys.argv[2]
    
    print(f"Testing login for: {email}")
    print("=" * 50)
    
    success = test_user_login(email, password)
    sys.exit(0 if success else 1)
