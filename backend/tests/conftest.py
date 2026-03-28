import asyncio
from unittest.mock import Mock, patch

# Patch external services BEFORE any other imports to catch all modules
# using 'from ... import ...'
mock_groq_patcher = patch("langchain_groq.ChatGroq")
mock_ollama_patcher = patch("langchain_ollama.OllamaEmbeddings")
mock_chromadb_patcher = patch("app.services.rag.vector_store.chromadb")

mock_groq_patcher.start()
mock_ollama_patcher.start()
mock_chromadb_patcher.start()

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.base import Base
from app.db.session import get_db
from app.main import app
from app.models.user import User
from app.security.jwt import create_access_token
from app.security.password import hash_password

# Test database setup - use in-memory SQLite for faster tests
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session")
def event_loop():
    # Create event loop for async tests
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="function")
def db_session():
    # Create test database tables
    Base.metadata.create_all(bind=engine)

    # Create session
    session = TestingSessionLocal()

    try:
        yield session
    finally:
        session.close()
        # Drop all tables after test
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    # Override database dependency
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db

    # Create test client
    with TestClient(app) as test_client:
        yield test_client

    # Clean up
    app.dependency_overrides.clear()


@pytest.fixture
def test_user(db_session):
    # Create a test user
    user = User(
        email="test@example.com",
        hashed_password=hash_password("testpassword123"),
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def auth_headers(test_user):
    # Create authentication headers
    access_token = create_access_token(data={"sub": test_user.email})
    return {"Authorization": f"Bearer {access_token}"}


@pytest.fixture
def mock_groq_llm():
    # Mock Groq LLM for testing
    with patch("app.services.agents.email_agent.ChatGroq") as mock:
        mock_instance = Mock()
        mock_instance.invoke.return_value = {
            "messages": [{"content": "Test AI response"}]
        }
        mock.return_value = mock_instance
        yield mock_instance


@pytest.fixture
def mock_ollama_embeddings():
    # Mock Ollama embeddings for testing
    with patch("app.services.rag.embeddings.OllamaEmbeddings") as mock:
        mock_instance = Mock()
        mock_instance.embed_query.return_value = [0.1, 0.2, 0.3, 0.4, 0.5]
        mock_instance.embed_documents.return_value = [[0.1, 0.2, 0.3, 0.4, 0.5]]
        mock.return_value = mock_instance
        yield mock_instance


@pytest.fixture
def mock_chromadb():
    # Mock ChromaDB for testing
    with patch("app.services.rag.vector_store.chromadb") as mock:
        mock_client = Mock()
        mock_collection = Mock()

        # Mock collection methods
        mock_collection.add.return_value = None
        mock_collection.query.return_value = {
            "ids": [["doc1", "doc2"]],
            "documents": [["Test document 1", "Test document 2"]],
            "metadatas": [[{"source": "test"}, {"source": "test"}]],
            "distances": [[0.1, 0.2]],
        }
        mock_collection.get.return_value = {
            "ids": ["doc1", "doc2"],
            "documents": ["Test document 1", "Test document 2"],
            "metadatas": [{"source": "test"}, {"source": "test"}],
        }
        mock_collection.count.return_value = 2
        mock_collection.delete.return_value = None
        mock_collection.name = "test_collection"

        mock_client.get_or_create_collection.return_value = mock_collection
        mock.PersistentClient.return_value = mock_client

        yield mock_collection


@pytest.fixture
def sample_email_data():
    # Sample email data for testing
    return {
        "sender": "test@example.com",
        "recipient": "user@example.com",
        "subject": "Test Email",
        "body": "This is a test email body.",
        "timestamp": "2025-10-21T10:00:00Z",
    }


@pytest.fixture
def sample_calendar_data():
    # Sample calendar data for testing
    return {
        "title": "Test Meeting",
        "description": "This is a test meeting",
        "start_time": "2025-10-21T14:00:00Z",
        "end_time": "2025-10-21T15:00:00Z",
        "location": "Conference Room A",
        "attendees": ["user1@example.com", "user2@example.com"],
    }


@pytest.fixture
def sample_social_message():
    # Sample social media message for testing
    return {
        "content": "Hey, how are you doing?",
        "platform": "whatsapp",
        "sender": "John Doe",
        "timestamp": "2025-10-21T16:00:00Z",
        "message_type": "text",
        "is_group_chat": False,
    }


@pytest.fixture(autouse=True)
def mock_settings():
    # Mock settings for testing - must be applied before any imports
    # Patch both the config module and any modules that imported settings directly
    with (
        patch("app.core.config.settings") as mock,
        patch("app.security.encryption.settings") as enc_mock,
    ):
        _hex_key = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
        for m in (mock, enc_mock):
            m.SECRET_KEY = "test-secret-key-32-characters-long"
            m.JWT_ALGORITHM = "HS256"
            m.ACCESS_TOKEN_EXPIRE_MINUTES = 30
            m.ENCRYPTION_KEY = _hex_key
            m.GROQ_API_KEY = "test-groq-key"
            m.OLLAMA_BASE_URL = "http://localhost:11434"
            m.CHROMA_DB_PATH = "./test_chroma_db"
            m.DATABASE_URL = SQLALCHEMY_DATABASE_URL
            m.ENVIRONMENT = "testing"
        yield mock


@pytest.fixture(autouse=True)
def mock_global_instances():
    # Mock global instances across ALL modules that use them
    # This ensures that even if a module imported the instance before the patch,
    # the mock is still used.
    with (
        patch("app.services.rag.vector_store.vector_store") as mock_vs,
        patch("app.services.rag.pipeline.vector_store", mock_vs),
        patch("app.services.rag.embeddings.embedding_manager") as mock_em,
        patch("app.services.rag.pipeline.embedding_manager", mock_em),
        patch("app.services.rag.pipeline.rag_pipeline") as mock_rp,
        patch("app.services.tools.rag_pipeline", mock_rp),
        patch("app.api.endpoints.agent.rag_pipeline", mock_rp),
        patch("app.api.endpoints.ingest.rag_pipeline", mock_rp),
        patch("app.services.coordinator.ai_coordinator") as mock_coord,
    ):
        # Configure VectorStore mock
        mock_vs.add_documents.return_value = ["doc1"]
        mock_vs.query_documents.return_value = []
        mock_vs.get_stats.return_value = {"total_documents": 0, "collection_name": "test"}
        mock_vs.get_all_documents.return_value = []
        mock_vs.delete_documents.return_value = 0
        
        # Mock the collection inside the vector store just in case
        mock_coll = Mock()
        mock_vs.collection = mock_coll
        mock_coll.count.return_value = 0

        # Configure EmbeddingManager mock
        mock_em.embed_query.return_value = [0.1] * 5
        mock_em.embed_documents.side_effect = lambda texts: [[0.1] * 5 for _ in texts]

        # Configure RAGPipeline mock
        mock_rp.add_text.return_value = ["doc1"]
        mock_rp.query_texts.return_value = []
        mock_rp.get_collection_stats.return_value = {"total_documents": 0}
        mock_rp.get_recent_documents.return_value = []
        mock_rp.delete_documents.return_value = 0

        # Configure Coordinator mock
        mock_coord.get_daily_briefing.return_value = {"summary": "Test briefing"}
        mock_coord.analyze_document.return_value = {"analysis": "Test analysis"}

        yield {
            "vector_store": mock_vs,
            "embedding_manager": mock_em,
            "rag_pipeline": mock_rp,
            "ai_coordinator": mock_coord,
        }


@pytest.fixture(autouse=True)
def configure_global_mocks():
    # Configure the patches started at the top of the file
    mock_agent = Mock()
    mock_agent.invoke.return_value = {
        "messages": [{"role": "assistant", "content": "Test assistant response"}],
        "output": "Test assistant response",
    }
    
    # We need to get the actual mock objects from the patchers
    from langchain_groq import ChatGroq
    from langchain_ollama import OllamaEmbeddings

    mock_llm = Mock()
    mock_llm.invoke.return_value = Mock(content="Test LLM response")
    ChatGroq.return_value = mock_llm

    mock_emb = Mock()
    mock_emb.embed_query.return_value = [0.1, 0.2, 0.3, 0.4, 0.5]
    mock_emb.embed_documents.side_effect = lambda texts: [[0.1, 0.2, 0.3, 0.4, 0.5] for _ in texts]
    OllamaEmbeddings.return_value = mock_emb

    yield {
        "llm": mock_llm,
        "embeddings": mock_emb,
    }


@pytest.fixture
def mock_langchain_agent(configure_global_mocks):
    # Backward compatibility for existing tests
    return configure_global_mocks["agent"]
