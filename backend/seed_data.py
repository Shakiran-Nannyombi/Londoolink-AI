from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.user import User
from app.models.connected_service import ConnectedService
from app.security.password import get_password_hash
import json

def seed_data():
    db: Session = SessionLocal()
    try:
        # Check if test user exists
        user_email = "user@example.com"
        user = db.query(User).filter(User.email == user_email).first()
        
        if not user:
            print(f"Creating test user: {user_email}")
            user = User(
                email=user_email,
                full_name="Test User",
                hashed_password=get_password_hash("password123"),
                is_active=True,
                phone_number="+1234567890",
                timezone="America/New_York",
                language_preference="en",
                notification_preferences=json.dumps({
                    "email": True,
                    "push": True,
                    "inApp": True,
                    "dailyBriefing": True,
                    "urgentOnly": False
                })
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        else:
            print(f"User {user_email} already exists.")

        # Seed Connected Services
        services = [
            {
                "service_type": "gmail",
                "service_identifier": user_email,
                "is_active": True
            },
            {
                "service_type": "whatsapp",
                "service_identifier": "+1234567890",
                "is_active": True
            }
        ]

        for service_data in services:
            existing_service = db.query(ConnectedService).filter(
                ConnectedService.user_id == user.id,
                ConnectedService.service_type == service_data["service_type"]
            ).first()

            if not existing_service:
                print(f"Adding connected service: {service_data['service_type']}")
                service = ConnectedService(
                    user_id=user.id,
                    service_type=service_data["service_type"],
                    service_identifier=service_data["service_identifier"],
                    is_active=service_data["is_active"],
                    encrypted_credentials="fake_encrypted_token" 
                )
                db.add(service)
            else:
                 print(f"Service {service_data['service_type']} already connected.")

        db.commit()
        print("Seeding complete!")

    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
