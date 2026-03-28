#!/bin/bash
set -e

echo "🚀 Deploying Londoolink AI to Heroku..."
echo ""

# Check if Heroku CLI is installed
if ! command -v heroku &> /dev/null; then
    echo "❌ Heroku CLI not found. Please install it first:"
    echo "   https://devcenter.heroku.com/articles/heroku-cli"
    exit 1
fi

# Check if logged in
if ! heroku auth:whoami &> /dev/null; then
    echo "🔐 Please login to Heroku..."
    heroku login
fi

# Ask for app name
read -p "Enter your Heroku app name (or press Enter for 'londoolink-ai-backend'): " APP_NAME
APP_NAME=${APP_NAME:-londoolink-ai-backend}

echo ""
echo "📦 Creating Heroku app: $APP_NAME"

# Create app (will fail if exists, that's ok)
heroku create $APP_NAME 2>/dev/null || echo "App already exists, continuing..."

# Add PostgreSQL
echo ""
echo "🗄️  Adding PostgreSQL database..."
heroku addons:create heroku-postgresql:essential-0 -a $APP_NAME 2>/dev/null || echo "Database already exists, continuing..."

# Set basic environment variables
echo ""
echo "⚙️  Setting environment variables..."

heroku config:set \
  ENVIRONMENT=production \
  JWT_ALGORITHM=HS256 \
  ACCESS_TOKEN_EXPIRE_MINUTES=30 \
  CHROMA_DB_PATH=/tmp/chroma_db \
  -a $APP_NAME

# Generate secrets
echo ""
echo "🔑 Generating SECRET_KEY and ENCRYPTION_KEY..."

SECRET_KEY=$(openssl rand -hex 32)
ENCRYPTION_KEY=$(python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())")

heroku config:set \
  SECRET_KEY=$SECRET_KEY \
  ENCRYPTION_KEY=$ENCRYPTION_KEY \
  -a $APP_NAME

echo ""
echo "✅ Basic configuration complete!"
echo ""
echo "⚠️  IMPORTANT: You still need to set these variables manually:"
echo ""
echo "   API Keys:"
echo "   heroku config:set GEMINI_API_KEY=your_key -a $APP_NAME"
echo "   heroku config:set OPENAI_API_KEY=your_key -a $APP_NAME"
echo ""
echo "   Google OAuth:"
echo "   heroku config:set GOOGLE_CLIENT_ID=your_id -a $APP_NAME"
echo "   heroku config:set GOOGLE_CLIENT_SECRET=your_secret -a $APP_NAME"
echo ""
echo "   Auth0:"
echo "   heroku config:set AUTH0_DOMAIN=your_domain.auth0.com -a $APP_NAME"
echo "   heroku config:set AUTH0_CLIENT_ID=your_id -a $APP_NAME"
echo "   heroku config:set AUTH0_CLIENT_SECRET=your_secret -a $APP_NAME"
echo ""
echo "   Frontend URL:"
echo "   heroku config:set FRONTEND_URL=https://your-frontend.vercel.app -a $APP_NAME"
echo "   heroku config:set ALLOWED_ORIGINS=https://your-frontend.vercel.app -a $APP_NAME"
echo ""

read -p "Press Enter when you've set all required variables, or Ctrl+C to exit..."

# Add git remote
echo ""
echo "🔗 Adding Heroku git remote..."
heroku git:remote -a $APP_NAME 2>/dev/null || echo "Remote already exists, continuing..."

# Deploy
echo ""
echo "🚀 Deploying to Heroku..."
echo "   This may take a few minutes..."
echo ""

git push heroku main || git push heroku master

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🔍 Checking health endpoint..."
sleep 5

APP_URL="https://$APP_NAME.herokuapp.com"
curl -s "$APP_URL/health" | python3 -m json.tool || echo "Health check failed, check logs"

echo ""
echo "📊 View logs: heroku logs --tail -a $APP_NAME"
echo "🌐 Open app: heroku open -a $APP_NAME"
echo "📈 Dashboard: https://dashboard.heroku.com/apps/$APP_NAME"
echo ""
echo "🎉 Your API is live at: $APP_URL"
echo ""
