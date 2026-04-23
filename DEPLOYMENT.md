# 🚀 Production Deployment Guide

This guide covers deploying the Multi-Tenant Task Management System to production.

## 📋 Prerequisites

- GitHub account (repository already created)
- Vercel account (for frontend)
- Railway/Render account (for backend + database)

---

## 🗄️ Option 1: Deploy to Railway (Recommended)

Railway provides free PostgreSQL database + backend hosting.

### Step 1: Deploy Database + Backend to Railway

1. **Go to**: https://railway.app/
2. **Sign up** with GitHub
3. **Click**: "New Project"
4. **Select**: "Deploy from GitHub repo"
5. **Choose**: `multi-tenant-task-manager` repository
6. **Select**: `backend` folder as root directory

### Step 2: Add PostgreSQL Database

1. In your Railway project, click **"+ New"**
2. Select **"Database"** → **"PostgreSQL"**
3. Railway will create a database and provide `DATABASE_URL`

### Step 3: Configure Backend Environment Variables

In Railway backend service, add these variables:

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=your-production-jwt-secret-min-32-characters-long
JWT_REFRESH_SECRET=your-production-refresh-secret-min-32-characters-long
FRONTEND_URL=https://your-app.vercel.app
```

**Important**: 
- Railway auto-fills `DATABASE_URL` from PostgreSQL service
- Generate strong secrets (32+ characters)
- Update `FRONTEND_URL` after deploying frontend

### Step 4: Deploy Frontend to Vercel

1. **Go to**: https://vercel.com/
2. **Sign up** with GitHub
3. **Click**: "Add New" → "Project"
4. **Import**: `multi-tenant-task-manager` repository
5. **Framework Preset**: Vite
6. **Root Directory**: `frontend`
7. **Build Command**: `npm run build`
8. **Output Directory**: `dist`

### Step 5: Configure Frontend Environment Variables

In Vercel project settings → Environment Variables:

```env
VITE_API_URL=https://your-backend.railway.app/api/v1
```

Replace `your-backend.railway.app` with your Railway backend URL.

### Step 6: Update Backend CORS

1. Go back to Railway backend
2. Update `FRONTEND_URL` environment variable with your Vercel URL:
```env
FRONTEND_URL=https://your-app.vercel.app
```
3. Railway will auto-redeploy

### Step 7: Run Database Migrations

In Railway backend, go to **Settings** → **Deploy Triggers** → **Manual Deploy**

Or use Railway CLI:
```bash
railway run npm run migrate
railway run npm run seed
```

---

## 🗄️ Option 2: Deploy to Render

### Step 1: Deploy Database

1. **Go to**: https://render.com/
2. **Sign up** with GitHub
3. **Click**: "New" → "PostgreSQL"
4. **Name**: `taskmaster-db`
5. **Plan**: Free
6. **Create Database**
7. **Copy** the "Internal Database URL"

### Step 2: Deploy Backend

1. **Click**: "New" → "Web Service"
2. **Connect**: `multi-tenant-task-manager` repository
3. **Name**: `taskmaster-backend`
4. **Root Directory**: `backend`
5. **Environment**: Node
6. **Build Command**: `npm install && npm run build`
7. **Start Command**: `npm start`
8. **Plan**: Free

### Step 3: Add Backend Environment Variables

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=[paste Internal Database URL from Step 1]
JWT_SECRET=your-production-jwt-secret-min-32-characters-long
JWT_REFRESH_SECRET=your-production-refresh-secret-min-32-characters-long
FRONTEND_URL=https://your-app.vercel.app
```

### Step 4: Deploy Frontend to Vercel

Same as Railway Option (Step 4-5 above)

---

## 🔐 Security Checklist

Before deploying:

- [ ] Generate strong JWT secrets (32+ characters)
- [ ] Never commit `.env` files
- [ ] Update CORS origins to production URLs
- [ ] Enable rate limiting (already configured for production)
- [ ] Use HTTPS for all connections
- [ ] Set `NODE_ENV=production`

---

## 🧪 Testing Production Deployment

### 1. Test Backend Health

```bash
curl https://your-backend-url.com/api/v1/health
```

Expected response:
```json
{
  "success": true,
  "message": "API is running"
}
```

### 2. Test Frontend

1. Open: `https://your-app.vercel.app`
2. Try to register a new user
3. Login with demo credentials:
   - Email: `admin@acme.com`
   - Password: `Password123!`
4. Create a task
5. Test filtering and search

---

## 📊 Environment Variables Summary

### Backend (.env)

```env
# Required
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://user:pass@host:port/db
JWT_SECRET=min-32-chars-secret
JWT_REFRESH_SECRET=min-32-chars-secret
FRONTEND_URL=https://your-frontend.vercel.app

# Optional
API_VERSION=v1
LOG_LEVEL=info
```

### Frontend (.env)

```env
# Required
VITE_API_URL=https://your-backend.railway.app/api/v1
```

---

## 🔄 Continuous Deployment

Both Railway and Vercel support automatic deployments:

- **Push to GitHub** → Automatic deployment
- **No manual steps needed**
- **Zero-downtime deployments**

---

## 💰 Cost Estimate

### Free Tier (Recommended for NIT Project)

- **Railway**: Free tier includes PostgreSQL + backend hosting
- **Vercel**: Free tier includes unlimited frontend hosting
- **Total Cost**: $0/month

### Paid Tier (If Needed)

- **Railway**: $5/month for more resources
- **Vercel**: Free (frontend is always free)
- **Total Cost**: $5/month

---

## 🐛 Troubleshooting

### Backend won't start
- Check `DATABASE_URL` is set correctly
- Verify JWT secrets are set
- Check Railway/Render logs

### Frontend can't connect to backend
- Verify `VITE_API_URL` is correct
- Check CORS settings in backend
- Ensure backend is running

### Database connection failed
- Check `DATABASE_URL` format
- Verify database is running
- Check firewall rules

---

## 📝 Post-Deployment

1. **Test all features**
2. **Monitor logs** for errors
3. **Set up database backups** (Railway/Render provide this)
4. **Share production URL** with evaluators

---

## 🎯 Production URLs

After deployment, you'll have:

- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-backend.railway.app`
- **API Docs**: `https://your-backend.railway.app/api/docs`

**Share the frontend URL for evaluation!**

---

## ✅ Deployment Checklist

- [ ] Backend deployed to Railway/Render
- [ ] PostgreSQL database created
- [ ] Backend environment variables set
- [ ] Database migrations run
- [ ] Seed data loaded
- [ ] Frontend deployed to Vercel
- [ ] Frontend environment variables set
- [ ] CORS updated with production URLs
- [ ] All features tested in production
- [ ] Production URLs documented

---

**Need help?** Check the logs in Railway/Render dashboard or Vercel deployment logs.
