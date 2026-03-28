# Deploy Londoolink AI Backend to Heroku

## Prerequisites

1. **Heroku Account** - Sign up at https://heroku.com
2. **Heroku CLI** - Install from https://devcenter.heroku.com/articles/heroku-cli
3. **Git** - Make sure your code is committed

## Step 1: Install Heroku CLI

```bash
# macOS
brew tap heroku/brew && brew install heroku

# Ubuntu/Debian
curl https://cli-assets.heroku.com/install.sh | sh

# Windows
# Download from https://devcenter.heroku.com/articles/heroku-cli
```

Verify installation:
```bash
heroku --version
```

## Step 2: Login to Heroku

```bash
heroku login
```

This will open a browser for authentication.

## Step 3: Create Heroku App

```bash
cd backend
heroku create londoolink-ai-backend
```

Or use a custom name:
```bash
heroku create your-custom-name
```

## Step 4: Add PostgreSQL Database

```bash
heroku addons:create heroku-postgresql:essential-0
```

This creates a free PostgreSQL database and sets `DATABASE_URL` automatically.

## Step 5: Set Environment Variables

```bash
# Required variables
heroku config:set ENVIRONMENT=production
heroku config:set SECRET_KEY=$(openssl rand -hex 32)
heroku config:set ENCRYPTION_KEY=$(python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())")
heroku config:set JWT_ALGORITHM=HS256
heroku config:set ACCESS_TOKEN_EXPIRE_MINUTES=30

# API Keys (replace with your actual keys)
heroku config:set GEMINI_API_KEY=your_gemini_key
heroku config:set GROQ_API_KEY=your_groq_key
heroku config:set OPENAI_API_KEY=your_openai_key

# Google OAuth
heroku config:set GOOGLE_CLIENT_ID=your_google_client_id
heroku config:set GOOGLE_CLIENT_SECRET=your_google_client_secret
heroku config:set GOOGLE_REDIRECT_URI=https://londoolink-ai-backend.herokuapp.com/api/v1/integrations/google/callback

# Auth0
heroku config:set AUTH0_DOMAIN=your_domain.auth0.com
heroku config:set AUTH0_CLIENT_ID=your_auth0_client_id
heroku config:set AUTH0_CLIENT_SECRET=your_auth0_client_secret
heroku config:set AUTH0_AUDIENCE=https://londoolink-ai-backend.herokuapp.com
heroku config:set AUTH0_TOKEN_VAULT_BASE_URL=https://your_domain.auth0.com/api/v2/token-vault
heroku config:set AUTH0_M2M_CLIENT_ID=your_m2m_client_id
heroku config:set AUTH0_M2M_CLIENT_SECRET=your_m2m_client_secret

# Notion OAuth
heroku config:set NOTION_CLIENT_ID=your_notion_client_id
heroku config:set NOTION_CLIENT_SECRET=your_notion_client_secret
heroku config:set NOTION_REDIRECT_URI=https://londoolink-ai-backend.herokuapp.com/api/v1/integrations/notion/callback

# Frontend URL
heroku config:set FRONTEND_URL=https://londoolink-ai.vercel.app
heroku config:set ALLOWED_ORIGINS=https://londoolink-ai.vercel.app,https://londoolink-ai-backend.herokuapp.com

# ChromaDB
heroku config:set CHROMA_DB_PATH=/tmp/chroma_db

# Africa's Talking (optional)
heroku config:set AT_USERNAME=your_at_username
heroku config:set AT_API_KEY=your_at_api_key
```

## Step 6: Deploy to Heroku

```bash
# Make sure you're in the backend directory
cd backend

# Add Heroku remote (if not already added)
heroku git:remote -a londoolink-ai-backend

# Deploy
git push heroku main
```

If your code is in a subdirectory:
```bash
# From project root
git subtree push --prefix backend heroku main
```

## Step 7: Run Database Migrations

Migrations should run automatically via the `release` command in Procfile, but you can run manually if needed:

```bash
heroku run alembic upgrade head
```

## Step 8: Verify Deployment

Check if the app is running:
```bash
heroku open
```

Or visit: `https://londoolink-ai-backend.herokuapp.com`

Check health endpoint:
```bash
curl https://londoolink-ai-backend.herokuapp.com/health
```

Should return:
```json
{
  "status": "healthy",
  "database": "connected",
  "environment": "production",
  "version": "0.1.0"
}
```

## Step 9: View Logs

```bash
# View real-time logs
heroku logs --tail

# View last 100 lines
heroku logs -n 100

# Filter for errors
heroku logs --tail | grep ERROR
```

## Step 10: Update Frontend

Update your frontend `.env.local` or environment variables:

```bash
NEXT_PUBLIC_API_BASE_URL=https://londoolink-ai-backend.herokuapp.com
```

Redeploy your frontend on Vercel.

## Useful Heroku Commands

```bash
# Check app status
heroku ps

# Restart app
heroku restart

# Open app in browser
heroku open

# Open Heroku dashboard
heroku dashboard

# Check database info
heroku pg:info

# Connect to database
heroku pg:psql

# Check config variables
heroku config

# Set a config variable
heroku config:set KEY=value

# Remove a config variable
heroku config:unset KEY

# Scale dynos (free tier = 1)
heroku ps:scale web=1

# Run one-off commands
heroku run python3 init_production_db.py
```

## Troubleshooting

### Issue: App crashes on startup

**Check logs:**
```bash
heroku logs --tail
```

**Common causes:**
1. Missing environment variables
2. Database not connected
3. Migration errors

**Fix:**
```bash
# Verify all required env vars are set
heroku config

# Check database connection
heroku pg:info

# Run migrations manually
heroku run alembic upgrade head
```

### Issue: Database tables don't exist

**Fix:**
```bash
# Run migrations
heroku run alembic upgrade head

# Or use init script
heroku run python3 init_production_db.py
```

### Issue: "Application Error" page

**Check logs:**
```bash
heroku logs --tail
```

**Common fixes:**
1. Restart the app: `heroku restart`
2. Check Procfile is correct
3. Verify requirements.txt has all dependencies

### Issue: CORS errors from frontend

**Fix:**
```bash
# Update ALLOWED_ORIGINS
heroku config:set ALLOWED_ORIGINS=https://londoolink-ai.vercel.app,https://your-frontend-url.com
```

### Issue: Slow cold starts

Heroku free tier apps sleep after 30 minutes of inactivity. Consider:
1. Upgrading to Hobby tier ($7/month) for always-on
2. Using a service like UptimeRobot to ping your app every 25 minutes

## Cost Breakdown

**Free Tier:**
- 550-1000 dyno hours/month (enough for 1 app)
- PostgreSQL: 10,000 rows limit
- No custom domain SSL

**Hobby Tier ($7/month):**
- Always-on (no sleeping)
- PostgreSQL: 10 million rows
- Custom domain SSL

**Production Tier ($25-50/month):**
- Better performance
- More database storage
- Horizontal scaling

## Monitoring

### Set up logging
```bash
# Add papertrail for better logs
heroku addons:create papertrail
heroku addons:open papertrail
```

### Set up monitoring
```bash
# Add New Relic
heroku addons:create newrelic
```

## Backup Database

```bash
# Create backup
heroku pg:backups:capture

# Download backup
heroku pg:backups:download

# Schedule automatic backups (paid plans)
heroku pg:backups:schedule --at '02:00 America/Los_Angeles'
```

## Rollback Deployment

```bash
# View releases
heroku releases

# Rollback to previous version
heroku rollback

# Rollback to specific version
heroku rollback v123
```

## Custom Domain (Optional)

```bash
# Add custom domain
heroku domains:add api.yourdomain.com

# Get DNS target
heroku domains

# Add CNAME record in your DNS:
# CNAME api.yourdomain.com -> your-app.herokuapp.com
```

## CI/CD with GitHub (Optional)

1. Go to https://dashboard.heroku.com
2. Select your app
3. Go to **Deploy** tab
4. Connect to GitHub
5. Enable **Automatic Deploys** from main branch
6. Enable **Wait for CI to pass before deploy**

Now every push to main will auto-deploy!

## Migration from Render

If you have data on Render:

1. **Export Render database:**
   ```bash
   # From Render dashboard, get database URL
   pg_dump $RENDER_DATABASE_URL > backup.sql
   ```

2. **Import to Heroku:**
   ```bash
   heroku pg:psql < backup.sql
   ```

3. **Update DNS/URLs** to point to Heroku

## Next Steps

1. ✅ Deploy backend to Heroku
2. ✅ Verify health endpoint works
3. ✅ Test user registration/login
4. ✅ Update frontend environment variables
5. ✅ Test OAuth flows (Google, Auth0)
6. ✅ Monitor logs for any errors
7. ✅ Set up automatic backups
8. ✅ Consider upgrading to Hobby tier for production

## Support

- Heroku Docs: https://devcenter.heroku.com
- Heroku Status: https://status.heroku.com
- Community: https://help.heroku.com

---

**Your app will be live at:** `https://londoolink-ai-backend.herokuapp.com` 🚀
