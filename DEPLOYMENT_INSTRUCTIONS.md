# 🚀 Londoolink AI Deployment Instructions

## Prerequisites
- GitHub repository with your code pushed
- Netlify account (for frontend)
- Railway account (for backend)
- Environment variables ready

---

## 🎯 **Step 1: Deploy Backend to Railway**

### 1.1 Create Railway Project
1. Go to [railway.app](https://railway.app) and sign in
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your `Londoolink-AI` repository
5. Select the **backend** folder as the root directory

### 1.2 Configure Environment Variables
In Railway dashboard, go to **Variables** tab and add:

```bash
# Required Environment Variables
SECRET_KEY=your-super-secret-jwt-key-make-it-long-and-random-32-chars-min
ENCRYPTION_KEY=your-32-character-fernet-encryption-key-here
DATABASE_URL=postgresql://postgres:password@railway-postgres:5432/londoolink
GROQ_API_KEY=your-groq-api-key-here
OPENAI_API_KEY=your-openai-api-key-here
ENVIRONMENT=production
ALLOWED_ORIGINS=https://your-frontend-url.netlify.app
```

### 1.3 Add PostgreSQL Database
1. In Railway dashboard, click **"+ New"**
2. Select **"Database"** → **"PostgreSQL"**
3. Railway will automatically set `DATABASE_URL` environment variable
4. Copy the connection string for later use

### 1.4 Deploy Settings
- **Build Command**: `uv sync --frozen`
- **Start Command**: `uv run uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Port**: Railway will auto-assign (usually 8000)

### 1.5 Get Backend URL
After deployment, Railway will provide a URL like:
`https://londoolink-backend-production.up.railway.app`

**Save this URL - you'll need it for frontend configuration!**

---

## 🌐 **Step 2: Deploy Frontend to Netlify**

### 2.1 Create Netlify Site
1. Go to [netlify.com](https://netlify.com) and sign in
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect to GitHub and select your `Londoolink-AI` repository
4. Set **Base directory**: `app-frontend`
5. Set **Build command**: `npm run build`
6. Set **Publish directory**: `.next`

### 2.2 Configure Environment Variables
In Netlify dashboard, go to **Site settings** → **Environment variables**:

```bash
NEXT_PUBLIC_API_BASE_URL=https://your-backend-url.up.railway.app
```

Replace `your-backend-url` with the actual Railway URL from Step 1.5.

### 2.3 Deploy Settings
- **Node version**: 18 or higher
- **Build command**: `npm run build`
- **Publish directory**: `.next`

---

## 🔧 **Step 3: Configure CORS (Critical!)**

### 3.1 Update Backend CORS
1. Go back to Railway dashboard
2. In **Variables**, update `ALLOWED_ORIGINS`:
```bash
ALLOWED_ORIGINS=https://your-actual-netlify-url.netlify.app,http://localhost:3000
```

Replace with your actual Netlify URL (e.g., `https://londoolink-ai.netlify.app`)

### 3.2 Redeploy Backend
After updating CORS, trigger a redeploy in Railway to apply changes.

---

## ✅ **Step 4: Test Your Deployment**

### 4.1 Backend Health Check
Visit: `https://your-backend-url.up.railway.app/`
Should return: `{"message": "Londoolink AI Backend is running!", "version": "0.1.0"}`

### 4.2 Frontend Access
Visit your Netlify URL: `https://your-frontend-url.netlify.app`
- Should load the Londoolink AI interface
- Try registering a new account
- Test the documentation page at `/documentation`

---

## 🐛 **Troubleshooting**

### Common Issues:

**1. CORS Errors**
- Ensure `ALLOWED_ORIGINS` in Railway includes your exact Netlify URL
- Check that both HTTP and HTTPS are handled correctly

**2. API Connection Failed**
- Verify `NEXT_PUBLIC_API_BASE_URL` in Netlify matches your Railway URL
- Ensure Railway backend is running (check logs)

**3. Database Connection Issues**
- Verify `DATABASE_URL` is correctly set in Railway
- Check PostgreSQL service is running

**4. Build Failures**
- **Frontend**: Check Node.js version (use 18+)
- **Backend**: Ensure all dependencies in `pyproject.toml` are correct

### Checking Logs:
- **Railway**: Go to your service → **Deployments** → Click on latest deployment
- **Netlify**: Go to **Site overview** → **Production deploys** → Click on latest deploy

---

## 🎉 **Step 5: Update Documentation**

Once deployed, update your repository:

1. **README.md**: Add live demo links at the top
2. **TECHNICAL_DOCUMENTATION.md**: Update API base URLs in examples
3. **GitHub repository**: Ensure it's set to public

### Example README Update:
```markdown
# Londoolink AI

🚀 **Live Demo**: [https://your-app.netlify.app](https://your-app.netlify.app)
📚 **Documentation**: [https://your-app.netlify.app/documentation](https://your-app.netlify.app/documentation)
🔗 **API**: [https://your-backend.up.railway.app](https://your-backend.up.railway.app)
```

---

## 📋 **Final Checklist**

- [ ] Backend deployed to Railway with all environment variables
- [ ] PostgreSQL database connected and running
- [ ] Frontend deployed to Netlify with correct API URL
- [ ] CORS configured with production frontend URL
- [ ] Both services are accessible and working
- [ ] Documentation page loads correctly
- [ ] Repository is public on GitHub
- [ ] README updated with live demo links

---

## 🔐 **Security Notes**

- Never commit `.env` files to GitHub
- Use strong, unique values for `SECRET_KEY` and `ENCRYPTION_KEY`
- Regularly rotate API keys and secrets
- Monitor deployment logs for any exposed credentials

---

**Your Londoolink AI is now live and ready for submission! 🎊**
