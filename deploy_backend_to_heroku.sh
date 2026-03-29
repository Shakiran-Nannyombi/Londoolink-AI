#!/bin/bash
set -e

echo "🚀 Deploying Backend to Heroku (from subdirectory)..."
echo ""

# Check if Heroku CLI is installed
if ! command -v heroku &> /dev/null; then
    echo "❌ Heroku CLI not found. Install it from:"
    echo "   https://devcenter.heroku.com/articles/heroku-cli"
    exit 1
fi

# Check if logged in
if ! heroku auth:whoami &> /dev/null; then
    echo "🔐 Please login to Heroku..."
    heroku login
fi

# Ask for app name
read -p "Enter your Heroku app name: " APP_NAME

if [ -z "$APP_NAME" ]; then
    echo "❌ App name is required"
    exit 1
fi

echo ""
echo "📦 Setting up Heroku app: $APP_NAME"

# Create app (will fail if exists, that's ok)
heroku create $APP_NAME 2>/dev/null || echo "✓ App already exists"

# Skip PostgreSQL addon - using external database
echo ""
echo "📝 Skipping Heroku PostgreSQL (using external database)"

# Add Heroku remote
echo ""
echo "🔗 Adding Heroku git remote..."
heroku git:remote -a $APP_NAME 2>/dev/null || echo "✓ Remote already exists"

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
echo "⚠️  IMPORTANT: Set these variables manually:"
echo ""
echo "# Database (use your Neon PostgreSQL URL)"
echo "heroku config:set DATABASE_URL='postgresql://neondb_owner:npg_GqiJw2RTHzm7@ep-wandering-bar-ab83maya-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require' -a $APP_NAME"
echo ""
echo "# API Keys"
echo "heroku config:set GEMINI_API_KEY=your_key -a $APP_NAME"
echo "heroku config:set OPENAI_API_KEY=your_key -a $APP_NAME"
echo "heroku config:set GOOGLE_CLIENT_ID=your_id -a $APP_NAME"
echo "heroku config:set GOOGLE_CLIENT_SECRET=your_secret -a $APP_NAME"
echo "heroku config:set AUTH0_DOMAIN=your_domain.auth0.com -a $APP_NAME"
echo "heroku config:set AUTH0_CLIENT_ID=your_id -a $APP_NAME"
echo "heroku config:set AUTH0_CLIENT_SECRET=your_secret -a $APP_NAME"
echo "heroku config:set AUTH0_AUDIENCE=https://$APP_NAME.herokuapp.com -a $APP_NAME"
echo "heroku config:set AUTH0_TOKEN_VAULT_BASE_URL=https://your_domain.auth0.com/api/v2/token-vault -a $APP_NAME"
echo "heroku config:set AUTH0_M2M_CLIENT_ID=your_m2m_id -a $APP_NAME"
echo "heroku config:set AUTH0_M2M_CLIENT_SECRET=your_m2m_secret -a $APP_NAME"
echo "heroku config:set FRONTEND_URL=https://londoolink-ai.vercel.app -a $APP_NAME"
echo "heroku config:set ALLOWED_ORIGINS=https://londoolink-ai.vercel.app,https://$APP_NAME.herokuapp.com -a $APP_NAME"
echo ""

read -p "Press Enter when you've set all required variables, or Ctrl+C to exit..."

# Deploy using git subtree
echo ""
echo "🚀 Deploying backend subdirectory to Heroku..."
echo "   This may take a few minutes..."
echo ""

# Make sure we're in the project root
if [ ! -d "backend" ]; then
    echo "❌ Error: backend directory not found. Run this script from project root."
    exit 1
fi

# Push only the backend folder to Heroku
git subtree push --prefix backend heroku main

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🔍 Checking health endpoint..."
sleep 10

APP_URL="https://$APP_NAME.herokuapp.com"
curl -s "$APP_URL/health" | python3 -m json.tool || echo "⚠️  Health check failed, check logs"

echo ""
echo "📊 View logs: heroku logs --tail -a $APP_NAME"
echo "🌐 Open app: heroku open -a $APP_NAME"
echo "📈 Dashboard: https://dashboard.heroku.com/apps/$APP_NAME"
echo ""
echo "🎉 Your API is live at: $APP_URL"
echo ""
echo "📝 Next steps:"
echo "   1. Update frontend NEXT_PUBLIC_API_BASE_URL to $APP_URL"
echo "   2. Update Auth0 callback URLs to use $APP_URL"
echo "   3. Update Google OAuth redirect URIs to use $APP_URL"
echo ""
