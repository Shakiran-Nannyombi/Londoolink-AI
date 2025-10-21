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

Londoolink provides a secure and intelligent backend that connects to your digital world via automated workflows. It doesn't just aggregate data; it understands it. The system uses a Retrieval-Augmented Generation (RAG) pipeline and a team of specialized AI agents to deliver a prioritized daily briefing, helping you focus on what's important.

### Core Features

* **AI-Powered Daily Briefings:** Start your day with a clear, concise summary of your top priorities, including urgent emails, upcoming meetings, and important reminders.
* **Secure Credential Management:** All sensitive credentials (like Google OAuth tokens) are stored using strong AES-256 symmetric encryption. Your data is never stored in plaintext.
* **Multi-Agent System:** Specialized agents for email triage, calendar management, and prioritization collaborate to analyze information from different perspectives.
* **Context-Aware Memory (RAG):** Using a vector database, Londoolink remembers past interactions and context, enabling it to provide more relevant and intelligent insights.
* **Automated Data Ingestion:** Integrated with n8n, the system automatically and continuously fetches new data from your connected services without manual intervention.
* **Built with FastAPI:** A modern, high-performance, and scalable API built with production best practices.

## System Architecture

*(This diagram shows the flow of data from external services through n8n to the Londoolink backend, where the AI agents process it and store insights in the databases.)*

```
[----------------]      (Webhook)      [------------------]      [--------------------]
|                |--------------------->|                  |----->|                    |
|      n8n       |                      |  FastAPI Backend |      |   LangChain AI     |
| (Gmail, GCal)  |                      |   (Ingestion)    |      | (Agents & RAG)     |
|                |<---------------------|                  |<-----|                    |
[----------------]      (API Calls)      [------------------]      [--------------------]
                                                 |                        |
                                                 |                        |
                                        [----------------]      [----------------]
                                        |  PostgreSQL DB |      |  ChromaDB      |
                                        | (Users, Encrypted|      | (Vector       |
                                        |  Credentials)  |      |  Embeddings)   |
                                        [----------------]      [----------------]
```

## Technology Stack

| Category | Technology |
| :--- | :--- |
| **Backend** | FastAPI, Pydantic, SQLAlchemy |
| **AI / ML** | LangChain, OpenAI (or other LLM), ChromaDB, Sentence Transformers |
| **Databases** | PostgreSQL (for relational data), ChromaDB (for vector storage) |
| **Authentication** | Bcrypt (for password hashing), JWT (for sessions) |
| **Automation** | n8n (self-hosted or cloud) |
| **Deployment** | Docker, Railway / Render |

## Getting Started

Follow these instructions to get the Londoolink backend up and running on your local machine.

### Prerequisites

* Python 3.12+
* Docker and Docker Compose (for database and n8n)
* An n8n instance
* API keys for your chosen LLM provider (e.g., OpenAI)

### 1. Clone the Repository

```bash
git clone https://github.com/Shakiran-Nannyombi/Londoolink-AI.git
cd Londoolink-AI
```

### 2. Set Up the Environment

Create a virtual environment and install the required Python packages.

```bash
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
uvicorn app.main:app --reload
```

The API will be available at `http://127.0.0.1:8000`.

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

# OpenAI API Key
OPENAI_API_KEY="sk-..."

# The algorithm used for JWTs
JWT_ALGORITHM="HS256"

# Token expiration time in minutes
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
