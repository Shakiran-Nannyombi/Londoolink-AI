# Heroku Quick Start (5 Minutes)

## Option 1: Automated Script (Easiest)

```bash
cd backend
./deploy_heroku.sh
```

Follow the prompts and you're done!

## Option 2: Manual (Step by Step)

### 1. Install Heroku CLI
```bash
# macOS
brew install heroku

# Linux
curl https://cli-assets.heroku.com/install.sh | sh
```

### 2. Login
```bash
heroku login
```

### 3. Create App & Database
```bash
cd backend
heroku create londoolink-ai-backend
heroku addons:create heroku-postgresql:essential-0
```

### 4. Set Environment Variables
```bash
# Generate secrets
heroku config:set SECRET_KEY=$(openssl rand -hex 32)
heroku config:set ENCRYPTION_KEY=$(python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())")

# Basic config
heroku config:set ENVIRONMENT=production
heroku config:set JWT_ALGORITHM=HS256
heroku config:set ACCESS_TOKEN_EXPIRE_MINUTES=30

# Your API keys (replace with actual values)
heroku config:set GEMINI_API_KEY=your_key
heroku config:set OPENAI_API_KEY=your_key
heroku config:set GOOGLE_CLIENT_ID=your_id
heroku config:set GOOGLE_CLIENT_SECRET=your_secret
heroku config:set AUTH0_DOMAIN=your_domain.auth0.com
heroku config:set AUTH0_CLIENT_ID=your_id
heroku config:set AUTH0_CLIENT_SECRET=your_secret
heroku config:set FRONTEND_URL=https://londoolink-ai.vercel.app
heroku config:set ALLOWED_ORIGINS=https://londoolink-ai.vercel.app
```

### 5. Deploy
```bash
git push heroku main
```

### 6. Verify
```bash
heroku open
# Visit /health endpoint
```

## That's It! 🎉

Your API is now live at: `https://londoolink-abc635b5fe07.herokuapp.com`

## Quick Commands

```bash
# View logs
heroku logs --tail

# Restart app
heroku restart

# Run migrations
heroku run alembic upgrade head

# Open dashboard
heroku dashboard

# Check status
heroku ps
```

## Update Frontend

Change your frontend environment variable:
```
NEXT_PUBLIC_API_BASE_URL=https://londoolink-abc635b5fe07.herokuapp.com
```

Redeploy on Vercel and you're done!

## Need Help?

See `HEROKU_DEPLOYMENT.md` for detailed instructions.
