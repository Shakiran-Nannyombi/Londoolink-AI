import pytest
import asyncio
from unittest.mock import Mock, patch
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.db.base import Base
from app.db.session import get_db
from app.models.user import User
from app.security.password import hash_password
from app.security.jwt import create_access_token


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
        is_active=True
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
    with patch('app.services.agents.email_agent.ChatGroq') as mock:
        mock_instance = Mock()
        mock_instance.invoke.return_value = {
            'messages': [{'content': 'Test AI response'}]
        }
        mock.return_value = mock_instance
        yield mock_instance


@pytest.fixture
def mock_ollama_embeddings():
    # Mock Ollama embeddings for testing
    with patch('app.services.rag.embeddings.OllamaEmbeddings') as mock:
        mock_instance = Mock()
        mock_instance.embed_query.return_value = [0.1, 0.2, 0.3, 0.4, 0.5]
        mock_instance.embed_documents.return_value = [[0.1, 0.2, 0.3, 0.4, 0.5]]
        mock.return_value = mock_instance
        yield mock_instance


@pytest.fixture
def mock_chromadb():
    # Mock ChromaDB for testing
    with patch('app.services.rag.vector_store.chromadb') as mock:
        mock_client = Mock()
        mock_collection = Mock()
        
        # Mock collection methods
        mock_collection.add.return_value = None
        mock_collection.query.return_value = {
            'ids': [['doc1', 'doc2']],
            'documents': [['Test document 1', 'Test document 2']],
            'metadatas': [[{'source': 'test'}, {'source': 'test'}]],
            'distances': [[0.1, 0.2]]
        }
        mock_collection.get.return_value = {
            'ids': ['doc1', 'doc2'],
            'documents': ['Test document 1', 'Test document 2'],
            'metadatas': [{'source': 'test'}, {'source': 'test'}]
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
        "timestamp": "2025-10-21T10:00:00Z"
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
        "attendees": ["user1@example.com", "user2@example.com"]
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
        "is_group_chat": False
    }


@pytest.fixture(autouse=True)
def mock_settings():
    # Mock settings for testing - must be applied before any imports
    with patch('app.core.config.settings') as mock:
        mock.SECRET_KEY = "test-secret-key-32-characters-long"
        mock.JWT_ALGORITHM = "HS256"
        mock.ACCESS_TOKEN_EXPIRE_MINUTES = 30
        mock.ENCRYPTION_KEY = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
        mock.GROQ_API_KEY = "test-groq-key"
        mock.OLLAMA_BASE_URL = "http://localhost:11434"
        mock.CHROMA_DB_PATH = "./test_chroma_db"
        mock.DATABASE_URL = SQLALCHEMY_DATABASE_URL
        mock.ENVIRONMENT = "testing"
        yield mock


@pytest.fixture(autouse=True)
def mock_global_instances():
    # Mock global instances to prevent initialization during tests
    with patch('app.services.rag.vector_store.vector_store') as mock_vs, \
         patch('app.services.rag.embeddings.embedding_manager') as mock_em, \
         patch('app.services.rag.pipeline.rag_pipeline') as mock_rp, \
         patch('app.services.coordinator.ai_coordinator') as mock_coord:
        
        # Configure mocks
        mock_vs.add_documents.return_value = ["doc1", "doc2"]
        mock_vs.query_documents.return_value = []
        mock_vs.get_stats.return_value = {"total_documents": 0}
        
        mock_em.embed_query.return_value = [0.1, 0.2, 0.3, 0.4, 0.5]
        mock_em.embed_documents.return_value = [[0.1, 0.2, 0.3, 0.4, 0.5]]
        
        mock_rp.add_text.return_value = ["doc1"]
        mock_rp.query_texts.return_value = []
        mock_rp.get_collection_stats.return_value = {"total_documents": 0}
        
        mock_coord.get_daily_briefing.return_value = {"summary": "Test briefing"}
        mock_coord.analyze_document.return_value = {"analysis": "Test analysis"}
        
        yield {
            'vector_store': mock_vs,
            'embedding_manager': mock_em,
            'rag_pipeline': mock_rp,
            'ai_coordinator': mock_coord
        }


@pytest.fixture
def mock_langchain_agent():
    # Mock LangChain agent for testing
    with patch('app.services.agents.email_agent.create_agent') as mock:
        mock_agent = Mock()
        mock_agent.invoke.return_value = {
            'messages': [{'content': 'Test agent response'}]
        }
        mock.return_value = mock_agent
        yield mock_agent
