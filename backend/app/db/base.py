from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.core.config import settings

# PostgreSQL needs pool_pre_ping to handle connection drops between deploys
_is_postgres = settings.DATABASE_URL.startswith("postgresql")
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=_is_postgres,
    pool_recycle=300 if _is_postgres else -1,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Note: Model imports are handled in alembic/env.py for migrations
# Do not import models here to avoid circular dependencies
