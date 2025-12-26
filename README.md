# Londoolink AI - Your Intelligent Digital Twin

A comprehensive AI-powered personal assistant that manages your emails, calendar, and communications with advanced LangGraph multi-agent architecture.

## 🌟 Features

### Core Functionality
- **Multi-Agent AI System**: Specialized agents for email, calendar, social media, and general assistance
- **Daily Briefings**: AI-generated summaries of your important tasks and communications
- **Smart Prioritization**: Automatic categorization of tasks by urgency and importance
- **Real-time Chat**: Interactive chatbot for instant assistance

### Authentication & Security
- **Multi-Step Registration**: GDPR-compliant signup with consent management
- **Two-Factor Authentication (2FA)**: TOTP-based security with QR codes and backup codes
- **Secure Token Management**: JWT-based authentication with automatic refresh
- **Privacy First**: Encrypted storage and user consent tracking

### Service Integrations
- **Email**: Connect Gmail or Outlook (OAuth ready)
- **WhatsApp**: Business API integration (QR code setup)
- **SMS**: Twilio/MessageBird support
- **Status Tracking**: Real-time connection monitoring

### User Management
- **Comprehensive Profile**: Editable user information with stats
- **Settings Dashboard**: 5 tabs (General, Notifications, Privacy, Integrations, Security)
- **Theme Support**: Light/Dark mode with system preference detection
- **Internationalization**: Multi-language and timezone support

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL or SQLite

### Backend Setup
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run migrations
alembic upgrade head

# Start server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup
```bash
cd app-frontend
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your API URL

# Start development server
npm run dev
```

Visit `http://localhost:3000` to access the application.

## 📱 Usage

### Registration
1. Navigate to `/login`
2. Click "Sign Up"
3. Fill in your details (name, email, password, optional phone)
4. Review and accept consent for data processing
5. Automatically logged in after registration

### Enable 2FA
1. Go to Settings → Security
2. Enter your password
3. Scan QR code with Google Authenticator or similar app
4. Enter verification code
5. Save your backup codes securely

### Connect Services
1. Go to Settings → Integrations
2. Click "Connect" on desired service
3. Follow authentication flow
4. Service will sync automatically

## 🏗️ Architecture

### Backend
- **Framework**: FastAPI with async/await
- **Database**: SQLAlchemy ORM with Alembic migrations
- **AI**: LangGraph multi-agent system with OpenAI
- **Security**: JWT tokens, password hashing, 2FA with pyotp
- **Storage**: PostgreSQL/SQLite with encrypted sensitive data

### Frontend
- **Framework**: Next.js 14 with App Router
- **UI**: Tailwind CSS with custom design system
- **State**: Zustand for global state management
- **Animations**: Framer Motion
- **Icons**: Lucide React

### Multi-Agent System
- **Email Agent**: Analyzes and prioritizes emails
- **Calendar Agent**: Manages events and scheduling
- **Social Agent**: Monitors social media insights
- **General Agent**: Handles queries and assistance
- **Coordinator**: Routes requests to appropriate agents

## 🔐 Security Features

- **Password Hashing**: Bcrypt with salt
- **JWT Tokens**: Secure access and refresh tokens
- **2FA**: Time-based one-time passwords (TOTP)
- **Backup Codes**: 10 single-use recovery codes
- **Encrypted Storage**: Sensitive data encryption at rest
- **GDPR Compliance**: User consent tracking and data management

## 📊 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/google-login` - Google OAuth login

### Profile & Settings
- `GET /api/v1/profile` - Get user profile
- `PUT /api/v1/profile` - Update profile
- `GET /api/v1/settings` - Get user settings
- `PUT /api/v1/settings` - Update settings

### Integrations
- `GET /api/v1/integrations/status` - Get all integration statuses
- `POST /api/v1/integrations/email/connect` - Connect email
- `POST /api/v1/integrations/whatsapp/connect` - Connect WhatsApp
- `POST /api/v1/integrations/sms/connect` - Connect SMS

### Two-Factor Authentication
- `GET /api/v1/2fa/status` - Check 2FA status
- `POST /api/v1/2fa/enable` - Enable 2FA (returns QR code)
- `POST /api/v1/2fa/verify` - Verify and activate 2FA
- `POST /api/v1/2fa/disable` - Disable 2FA

### Agent System
- `POST /api/v1/agent/chat` - Chat with specific agent
- `GET /api/v1/agent/briefing/daily` - Get daily briefing

## 🛠️ Development

### Project Structure
```
Londoolink-AI/
├── backend/
│   ├── app/
│   │   ├── api/endpoints/     # API route handlers
│   │   ├── models/            # SQLAlchemy models
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── security/          # Auth & encryption
│   │   └── services/          # Business logic
│   ├── migrations/            # Alembic migrations
│   └── requirements.txt
├── app-frontend/
│   ├── app/                   # Next.js pages
│   ├── components/            # React components
│   ├── lib/                   # Utilities & API client
│   └── store/                 # Zustand stores
└── README.md
```

### Environment Variables

**Backend (.env)**
```
DATABASE_URL=sqlite:///./londoolink.db
SECRET_KEY=your-secret-key-here
OPENAI_API_KEY=your-openai-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**Frontend (.env.local)**
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ using FastAPI, Next.js, and LangGraph
