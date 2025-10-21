# Londoolink AI Frontend

A clean, functional React frontend that showcases the intelligent Londoolink AI backend.

## Features

- **Authentication**: Secure login/register with JWT tokens
- **Daily Briefing**: AI-powered insights and priority management
- **Responsive Design**: Clean UI built with Chakra UI
- **Protected Routes**: Secure dashboard access

## Tech Stack

- **React 19** with Vite for fast development
- **Chakra UI** for beautiful, accessible components
- **React Router** for navigation
- **Axios** for API communication
- **Context API** for state management

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

## Environment Setup

Create a `.env.local` file in the frontend directory:
```
VITE_API_URL=http://localhost:8000/api/v1
```

## Project Structure

```
src/
├── api/
│   └── apiClient.js          # Axios configuration with JWT interceptor
├── components/
│   ├── BriefingCard.jsx      # AI daily briefing display
│   ├── Navbar.jsx           # Top navigation
│   └── ProtectedRoute.jsx   # Route protection logic
├── context/
│   └── AuthContext.jsx      # Authentication state management
├── pages/
│   ├── Dashboard.jsx        # Main dashboard
│   ├── Login.jsx            # Login/register page
│   └── NotFound.jsx         # 404 page
├── App.jsx                  # Main app with routing
├── main.jsx                 # Entry point
└── index.css                # Global styles
```

## User Flow

1. **Login/Register**: Users authenticate with email/password
2. **Dashboard**: Protected route showing daily AI briefing
3. **Briefing Display**: Clean, organized view of priorities, events, and recommendations
4. **Logout**: Secure session termination

## API Integration

The frontend integrates with the Londoolink AI backend endpoints:

- `POST /auth/login` - User authentication
- `POST /auth/register` - User registration  
- `GET /agent/briefing/daily` - Daily AI briefing
- `POST /rag/search` - Semantic search (future feature)

## Design Principles

- **Simplicity**: Clean, uncluttered interface
- **Functionality**: Focus on showcasing backend intelligence
- **Accessibility**: Chakra UI components with proper ARIA support
- **Responsiveness**: Works on desktop and mobile devices