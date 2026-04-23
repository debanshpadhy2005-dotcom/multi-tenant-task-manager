# 🚀 Railway + Vercel Deployment Guide

## Step 1: Deploy Backend to Railway

1. Go to https://railway.app/
2. Sign up with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose `multi-tenant-task-manager`
6. Railway will detect the backend automatically

### Add PostgreSQL Database

1. In your project, click "+ New"
2. Select "Database" → "PostgreSQL"
3. Railway creates database and provides `DATABASE_URL`

### Set Environment Variables

In Railway backend service settings, add:

```
NODE_ENV=production
JWT_SECRET=generate-32-char-secret-here
JWT_REFRESH_SECRET=generate-another-32-char-secret
FRONTEND_URL=https://your-app.vercel.app
```

Generate secrets:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Deploy

Railway auto-deploys. Copy your backend URL (e.g., `https://your-backend.railway.app`)

---

## Step 2: Deploy Frontend to Vercel

1. Go to https://vercel.com/
2. Sign up with GitHub
3. Click "Add New" → "Project"
4. Import `multi-tenant-task-manager`
5. Configure:
   - **Framework**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Set Environment Variable

Add in Vercel:

```
VITE_API_URL=https://your-backend.railway.app/api/v1
```

Replace with your Railway backend URL.

### Deploy

Click "Deploy". Copy your Vercel URL.

---

## Step 3: Update Backend CORS

1. Go back to Railway
2. Update `FRONTEND_URL` with your Vercel URL
3. Railway auto-redeploys

---

## Step 4: Test

1. Open your Vercel URL
2. Login: `admin@acme.com` / `Password123!`
3. Test all features

---

## ✅ Done!

Your app is live:
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-backend.railway.app`
- API Docs: `https://your-backend.railway.app/api/docs`
