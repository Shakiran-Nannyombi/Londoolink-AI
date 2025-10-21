# Londoolink AI

*An intelligent agent that securely tracks and links your digital life, ensuring you never miss what truly matters.*

---

**Londoolink** (from the Luganda word *Okulondoola*, meaning "to track" or "to follow up on") is a backend system designed to be the central nervous system for your personal information. It combats digital overload by ingesting data from your various platforms, using an AI-powered multi-agent system to understand, prioritize, and summarize your most critical tasks, messages, and events.

## The Problem

In today's hyper-connected world, we are flooded with information from emails, calendars, and messaging apps. This leads to:

* **Information Overload:** It's impossible to keep up with every notification.
* **Missed Priorities:** Important emails from your manager get lost in a sea of newsletters.
* **Forgotten Commitments:** Key deadlines and loved ones' birthdays slip through the cracks.
* **Security Risks:** Centralizing this data requires a system built on a foundation of trust and security.

## The Solution

Londoolink provides a secure and intelligent backend powered by **LangGraph multi-agent orchestration** that connects to your digital world via automated workflows. It doesn't just aggregate data; it understands it. The system uses a sophisticated **LangGraph state machine** with specialized AI agents and a Retrieval-Augmented Generation (RAG) pipeline to deliver prioritized daily briefings, helping you focus on what's important.

### Core Features

* **LangGraph Multi-Agent System:** Advanced stateful workflow orchestration with specialized agents for email triage, calendar management, social media analysis, and priority synthesis.
* **AI-Powered Daily Briefings:** Start your day with a comprehensive, AI-generated summary of your top priorities, including urgent emails, upcoming meetings, and important communications.
* **Enterprise-Grade Security:** All sensitive credentials are protected with AES-256 encryption, JWT authentication, and Argon2 password hashing. Your data is never stored in plaintext.
* **Context-Aware Memory (RAG):** Using ChromaDB vector database, Londoolink remembers past interactions and context, enabling intelligent insights across sessions.
* **Stateful Workflow Management:** LangGraph provides durable execution, error recovery, and human-in-the-loop capabilities for reliable agent coordination.
* **Automated Data Ingestion:** Integrated with n8n for continuous, automated data fetching from your connected services without manual intervention.
* **Production-Ready Architecture:** Built with FastAPI, featuring comprehensive testing, modular design, and scalable deployment options.

## System Architecture

### **LangGraph Multi-Agent Workflow**

Londoolink uses **LangGraph** for sophisticated multi-agent orchestration, providing stateful workflow management and reliable agent coordination.

![Multi-Agent Workflow Architecture](./Diagrams/multi-agent-workflow-architecture.png)

*The architecture shows how specialized AI agents (Email, Calendar, Social, Priority) work together through LangGraph's stateful orchestration, with RAG tools and external services integration.*

### **Additional Architecture Diagrams**

- [LangGraph State Flow Diagram](./Diagrams/langgraph-state-flow-diagram.png)
- [Sequential Execution Flow](./Diagrams/sequential-execution-flow.png)
- [Additional Workflow Diagrams](./Diagrams/)

### **Key Architecture Components**

#### **LangGraph Coordinator**
- **Stateful Orchestration**: Manages workflow state across agent interactions
- **Error Recovery**: Graceful handling of agent failures with partial results
- **Conditional Routing**: Smart agent selection based on workflow state

#### **Specialized AI Agents**
- **Email Agent**: Analyzes emails for urgency, action items, and key contacts
- **Calendar Agent**: Processes meetings, deadlines, and scheduling conflicts  
- **Social Agent**: Handles social media and messaging platform analysis
- **Priority Agent**: Synthesizes all analyses into prioritized daily briefings

#### **RAG Pipeline Integration**
- **Semantic Search**: ChromaDB vector database for context retrieval
- **Document Memory**: Persistent storage of analyzed content
- **Context Awareness**: Long-term memory across user sessions

#### **Complete Data Flow Architecture**

Comprehensive data flow showing the complete journey from external services through n8n automation, FastAPI endpoints, LangGraph multi-agent processing, to final daily briefing generation.

- [Data Flow Architecture](./Diagrams/data-flow-architecture.png)

**Data Flow Stages:**
1. **Data Collection**: External APIs → n8n Workflows → FastAPI Ingestion
2. **API Processing**: Authentication → Endpoint Routing → Business Logic  
3. **AI Processing**: LangGraph Coordinator → Specialized Agents → LLM Analysis
4. **Data Storage**: PostgreSQL (relational) + ChromaDB (vector embeddings)
5. **Output Generation**: Agent Synthesis → Prioritization → JSON Response

## Technology Stack

| Category | Technology |
| :--- | :--- |
| **Backend** | FastAPI, Pydantic, SQLAlchemy, uvicorn |
| **AI Orchestration** | **LangGraph** (stateful multi-agent workflows), LangChain |
| **LLM Provider** | Groq (llama3-70b-8192), OpenAI (fallback) |
| **Vector Database** | ChromaDB (embeddings & semantic search) |
| **Embeddings** | Ollama (local embeddings), Sentence Transformers |
| **Databases** | PostgreSQL (relational data), ChromaDB (vector storage) |
| **Security** | Argon2 (password hashing), JWT (authentication), AES-256 (encryption) |
| **Automation** | n8n (workflow automation & data ingestion) |
| **Testing** | Custom test runners, comprehensive security testing |
| **Deployment** | Docker, Railway / Render, uv (dependency management) |

## Getting Started

Follow these instructions to get the Londoolink backend up and running on your local machine.

### Prerequisites

* Python 3.12+
* [uv](https://docs.astral.sh/uv/) (fast Python package manager)
* Docker and Docker Compose (for databases)
* An n8n instance (for automation)
* API keys for Groq and/or OpenAI

### 1. Clone the Repository

```bash
git clone https://github.com/Shakiran-Nannyombi/Londoolink-AI.git
cd Londoolink-AI/backend
```

### 2. Set Up the Environment

Install dependencies using uv (recommended) or pip:

```bash
# Using uv (recommended - faster)
uv sync

# Or using traditional pip
python -m venv venv
source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Create a `.env` file in the project root. You can copy the template from `.env.example`.

```bash
cp .env.example .env
```

Now, open the `.env` file and fill in the required values.

### 4. Run the Application

```bash
# Using uv (recommended)
uv run uvicorn app.main:app --reload

# Or using traditional method
uvicorn app.main:app --reload
```

The API will be available at `http://127.0.0.1:8000`.

### 5. Run Tests

Verify your installation with the available test suite:

```bash
# Run security tests (recommended - core functionality)
uv run pytest tests/test_security_minimal.py -v

# Run all available tests
uv run pytest tests/ -v

# Available test modules:
# - test_security_minimal.py (JWT, encryption, password hashing)
# - test_agents.py (AI agent functionality)
# - test_api.py (FastAPI endpoints)
# - test_rag.py (RAG pipeline)
```

## API Documentation

API documentation is automatically generated by FastAPI. Once the application is running, you can access it at:

* **Swagger UI:** `http://127.0.0.1:8000/docs`
* **ReDoc:** `http://127.0.0.1:8000/redoc`

## Environment Variables

To run this application, you need to set the following environment variables in a `.env` file:

```dotenv
# The secret key used to sign JWTs. Generate a strong random string.
# (e.g., using `openssl rand -hex 32` in your terminal)
SECRET_KEY="your_super_secret_jwt_key"

# The secret key for symmetrically encrypting and decrypting credentials. MUST BE 32 bytes.
# Generate with: python -c "import os; print(os.urandom(32).hex())"
ENCRYPTION_KEY="your_32_byte_encryption_key"

# Database connection string
DATABASE_URL="postgresql+psycopg2://user:password@localhost/londoolink_db"

# Groq API Key (primary LLM provider)
GROQ_API_KEY="gsk_..."

# OpenAI API Key (fallback LLM provider)
OPENAI_API_KEY="sk-..."

# The algorithm used for JWTs
JWT_ALGORITHM="HS256"

# Token expiration time in minutes
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
