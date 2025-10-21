# Londoolink AI - Technical System Documentation

## Table of Contents
1. [System Architecture Overview](#system-architecture-overview)
2. [Backend Intelligence Flow (The LangGraph System)](#backend-intelligence-flow-the-langgraph-system)
3. [AI Components & Model Usage](#ai-components--model-usage)
4. [API Endpoints & Examples](#api-endpoints--examples)
5. [Data Storage & Security Strategy](#data-storage--security-strategy)

---

## System Architecture Overview

Londoolink AI is a sophisticated multi-agent system designed to intelligently process and prioritize information from various sources, reducing information overload through AI-powered insights. The architecture follows a modern microservices pattern with clear separation of concerns between data ingestion, processing, and user interaction.

### Architecture Diagram
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   External      │
│   (Next.js)     │◄──►│   (FastAPI)     │◄──►│   Services      │
│   TypeScript    │    │   Python        │    │   (n8n, APIs)   │
│   Tailwind CSS  │    │   LangGraph     │    │   Google, etc.  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   AI Agents     │
                    │   Email Agent   │
                    │   Calendar Agent│
                    │   Priority Agent│
                    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   Data Layer    │
                    │   PostgreSQL    │
                    │   ChromaDB      │
                    │   Vector Store  │
                    └─────────────────┘
```

### End-to-End Data Flow

The system processes information through a sophisticated pipeline designed for scalability and intelligent analysis:

1. **Data Ingestion**: External services (n8n workflows, API integrations) collect data from various sources including emails, calendars, and third-party services
2. **API Processing**: FastAPI backend receives and validates incoming data through secure, authenticated endpoints
3. **Agent Orchestration**: LangGraph coordinates specialized agents in a stateful workflow to process and analyze the data
4. **Intelligent Analysis**: Each agent applies domain-specific logic and advanced AI models to extract insights, determine priorities, and generate recommendations
5. **Data Persistence**: Processed data is stored in PostgreSQL for relational data and ChromaDB for vector embeddings and semantic search
6. **User Interface**: Frontend presents intelligent summaries, insights, and actionable recommendations through a modern, responsive interface

---

## Backend Intelligence Flow (The LangGraph System)

The core intelligence of Londoolink AI lies in its stateful graph-based multi-agent system built on LangGraph. This system enables sophisticated coordination between specialized agents while maintaining context and state throughout the workflow.

### Stateful Graph Concept

The LangGraph system maintains a persistent state object that flows through the entire workflow, allowing agents to:
- Share context and previous decisions
- Build upon each other's analysis
- Maintain conversation history
- Track user preferences and patterns

### Agent Roles and Responsibilities

#### 1. Email Agent (`email_agent.py`)
- **Purpose**: Analyzes email content, sender importance, and urgency
- **Capabilities**: 
  - Sentiment analysis of email content
  - Sender reputation scoring
  - Urgency detection based on keywords and patterns
  - Email categorization (work, personal, promotional)
- **Output**: Email priority scores and categorization metadata

#### 2. Calendar Agent (`calendar_agent.py`)
- **Purpose**: Manages calendar events and scheduling intelligence
- **Capabilities**:
  - Event conflict detection
  - Meeting importance assessment
  - Time zone optimization
  - Recurring event pattern analysis
- **Output**: Calendar insights and scheduling recommendations

#### 3. Priority Agent (`priority_agent.py`)
- **Purpose**: Central coordinator that determines overall task and event priorities
- **Capabilities**:
  - Cross-domain priority scoring
  - Deadline analysis
  - Resource allocation suggestions
  - Priority matrix generation
- **Output**: Unified priority rankings and recommendations

#### 4. Social Agent (`social_agent.py`)
- **Purpose**: Analyzes social media activity and engagement patterns
- **Capabilities**:
  - Social sentiment analysis
  - Engagement trend detection
  - Network analysis
  - Content relevance scoring
- **Output**: Social insights and engagement recommendations

### Daily Briefing Workflow

The "Daily Briefing" workflow demonstrates the sophisticated agent collaboration:

1. **Initialization**: System loads user preferences and historical data
2. **Data Collection**: Agents gather relevant data from their respective domains
3. **Parallel Processing**: Each agent analyzes their domain-specific data simultaneously
4. **Cross-Agent Communication**: Agents share insights and context through the state object
5. **Priority Synthesis**: Priority Agent consolidates all insights into a unified priority matrix
6. **Recommendation Generation**: System generates personalized recommendations and summaries
7. **User Presentation**: Frontend displays intelligent briefing with actionable insights

### State Management

The LangGraph state object contains:
```python
{
    "user_id": "string",
    "timestamp": "datetime",
    "email_insights": {...},
    "calendar_insights": {...},
    "social_insights": {...},
    "priority_matrix": {...},
    "recommendations": [...],
    "context_history": [...]
}
```

---

## AI Components & Model Usage

| Component | Role | Justification |
|-----------|------|---------------|
| **LangGraph** | Multi-agent orchestration and workflow management | Selected for its stateful graph capabilities and seamless agent coordination |
| **ChromaDB** | Vector storage and similarity search | Chosen for its efficient vector operations and seamless integration with LangChain |
| **Groq** | Primary LLM for fast inference | Selected for its low latency and cost-effectiveness for real-time processing |
| **OpenAI GPT-4** | Complex reasoning and analysis | Used for sophisticated text analysis and decision-making tasks |
| **Ollama** | Local LLM for privacy-sensitive operations | Enables on-premise processing for sensitive data without external API calls |
| **Sentence Transformers** | Text embedding generation | Provides high-quality embeddings for semantic search and similarity matching |

### Model Selection Rationale

- **Groq**: Primary choice for speed-critical operations due to its optimized inference engine
- **OpenAI**: Reserved for complex reasoning tasks requiring high-quality analysis
- **Ollama**: Used for privacy-sensitive operations and offline capabilities
- **ChromaDB**: Optimal balance of performance and ease of integration for vector operations

---

## API Endpoints & Examples

### Authentication Endpoints

#### POST `/api/v1/auth/register`
Register a new user account.

**Request:**
```bash
curl -X POST "https://your-backend-url.com/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123",
    "full_name": "John Doe"
  }'
```

**Response:**
```json
{
  "message": "User created successfully",
  "user_id": "uuid-string",
  "email": "user@example.com"
}
```

#### POST `/api/v1/auth/login`
Authenticate user and receive JWT token.

**Request:**
```bash
curl -X POST "https://your-backend-url.com/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123"
  }'
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 1800
}
```

### Agent Endpoints

#### POST `/api/v1/agent/briefing/daily`
Generate daily briefing using multi-agent workflow.

**Request:**
```bash
curl -X POST "https://your-backend-url.com/api/v1/agent/briefing/daily" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2024-01-15",
    "include_social": true,
    "priority_threshold": 0.7
  }'
```

**Response:**
```json
{
  "briefing_id": "uuid-string",
  "date": "2024-01-15",
  "summary": {
    "total_items": 15,
    "high_priority": 3,
    "medium_priority": 8,
    "low_priority": 4
  },
  "insights": {
    "email": {
      "urgent_emails": 2,
      "important_senders": ["boss@company.com", "client@client.com"]
    },
    "calendar": {
      "meetings_today": 4,
      "conflicts": 1
    },
    "social": {
      "engagement_trend": "increasing",
      "top_topics": ["AI", "technology", "productivity"]
    }
  },
  "recommendations": [
    {
      "type": "email",
      "priority": "high",
      "action": "Reply to urgent email from boss@company.com",
      "reason": "Contains deadline-sensitive project update"
    }
  ]
}
```

#### POST `/api/v1/agent/analyze/email`
Analyze email content for priority and insights.

**Request:**
```bash
curl -X POST "https://your-backend-url.com/api/v1/agent/analyze/email" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Urgent: Project Deadline Update",
    "sender": "boss@company.com",
    "content": "The project deadline has been moved up to next Friday...",
    "timestamp": "2024-01-15T09:00:00Z"
  }'
```

**Response:**
```json
{
  "analysis_id": "uuid-string",
  "priority_score": 0.85,
  "urgency_level": "high",
  "category": "work",
  "sentiment": "neutral",
  "key_insights": [
    "Contains deadline information",
    "From high-priority sender",
    "Requires immediate attention"
  ],
  "recommended_actions": [
    "Schedule time to review project status",
    "Update calendar with new deadline"
  ]
}
```

### RAG Endpoints

#### POST `/api/v1/rag/search`
Search through user's data using semantic search.

**Request:**
```bash
curl -X POST "https://your-backend-url.com/api/v1/rag/search" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "query": "project deadlines this week",
    "limit": 10,
    "filters": {
      "date_range": {
        "start": "2024-01-15",
        "end": "2024-01-21"
      },
      "sources": ["email", "calendar"]
    }
  }'
```

**Response:**
```json
{
  "results": [
    {
      "id": "uuid-string",
      "content": "Project Alpha deadline moved to Friday",
      "source": "email",
      "timestamp": "2024-01-15T09:00:00Z",
      "relevance_score": 0.92,
      "metadata": {
        "sender": "boss@company.com",
        "subject": "Urgent: Project Deadline Update"
      }
    }
  ],
  "total_results": 5,
  "query_time_ms": 150
}
```

---

## Data Storage & Security Strategy

### Dual-Database Architecture

Londoolink AI employs a sophisticated dual-database approach optimized for different data types and access patterns:

#### PostgreSQL (Relational Data)
- **Purpose**: User accounts, authentication, structured metadata
- **Schema**: Normalized relational structure for ACID compliance
- **Use Cases**: User profiles, authentication tokens, system configuration
- **Benefits**: Strong consistency, complex queries, transactional integrity

#### ChromaDB (Vector Data)
- **Purpose**: Semantic search, embeddings, unstructured content
- **Schema**: Document-based with vector embeddings
- **Use Cases**: Email content, calendar descriptions, social media posts
- **Benefits**: Fast similarity search, semantic understanding, scalable vector operations

### Security Measures

#### Password Security
**Implementation**: User passwords are never stored in plain text. The system uses Argon2, a memory-hard password hashing function that provides superior protection against both brute-force and timing attacks.

**Code Example**:
```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)
```

#### Credential Encryption
**Implementation**: Third-party service credentials (Google OAuth tokens, API keys) are encrypted at rest using AES-256 encryption before database storage. The encryption key is managed securely as an environment variable and is never stored in the codebase.

**Code Example**:
```python
from cryptography.fernet import Fernet
import os

class CredentialEncryption:
    def __init__(self):
        self.key = os.getenv("ENCRYPTION_KEY")
        self.cipher = Fernet(self.key.encode())
    
    def encrypt_credential(self, credential: str) -> str:
        return self.cipher.encrypt(credential.encode()).decode()
    
    def decrypt_credential(self, encrypted_credential: str) -> str:
        return self.cipher.decrypt(encrypted_credential.encode()).decode()
```

#### JWT Token Security
- **Algorithm**: HS256 with rotating secret keys
- **Expiration**: Short-lived access tokens (30 minutes)
- **Refresh**: Secure refresh token mechanism
- **Validation**: Comprehensive token validation on every request

#### Data Privacy
- **Minimal Data Collection**: Only necessary data is collected and processed
- **Data Retention**: Configurable retention policies for different data types
- **User Control**: Users can delete their data and revoke access at any time
- **Audit Logging**: Comprehensive audit trails for all data access and modifications

#### Network Security
- **HTTPS Only**: All communications encrypted in transit
- **CORS Configuration**: Strict origin validation for cross-origin requests
- **Rate Limiting**: Protection against abuse and DoS attacks
- **Input Validation**: Comprehensive validation and sanitization of all inputs

### Compliance and Privacy
- **GDPR Compliance**: User data handling follows GDPR principles
- **Data Minimization**: Only collect data necessary for service functionality
- **Right to Deletion**: Users can request complete data deletion
- **Transparency**: Clear privacy policy and data usage documentation

This comprehensive security strategy ensures that Londoolink AI maintains the highest standards of data protection while providing powerful AI-driven insights to users.
