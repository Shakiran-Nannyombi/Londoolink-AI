from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.sql import func

from app.db.base import Base


class BackboardThread(Base):
    """Track Backboard thread IDs for briefings."""
    __tablename__ = "backboard_threads"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    thread_id = Column(String(255), nullable=False, unique=True, index=True)
    thread_type = Column(String(50), nullable=False)  # daily, urgent, weekly
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    last_message_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    def __repr__(self):
        return f"<BackboardThread(id={self.id}, user_id={self.user_id}, thread_id={self.thread_id}, thread_type={self.thread_type})>"
