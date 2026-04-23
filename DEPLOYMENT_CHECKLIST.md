# ✅ Production Deployment Checklist

Use this checklist to ensure smooth deployment.

## 🔧 Pre-Deployment

### Backend Preparation
- [x] Environment variables use `process.env`
- [x] Database supports `DATABASE_URL` connection string
- [x] CORS configured with `FRONTEND_URL` variable
- [x] Rate limiting enabled for production
- [x] Error handling implemented
- [x] Build script works: `npm run build`
- [x] Start script works: `npm start`
- [x] Health check endpoint exists: `/api/v1/health`

### Frontend Preparation
- [x] API URL uses `import.meta.env.VITE_API_URL`
- [x] No hardcoded localhost URLs
- [x] Build script works: `npm run build`
- [x] Production build tested: `npm run preview`

### Security
- [ ] Generate production JWT secrets (32+ characters)
- [ ] Verify `.env` files are in `.gitignore`
- [ ] Remove any hardcoded credentials
- [ ] Test with production environment variables locally

---

## 🚀 Deployment Steps

### 1. Deploy Backend (Railway/Render)

- [ ] Create account on Railway or Render
- [ ] Connect GitHub repository
- [ ] Select `backend` folder as root
- [ ] Add PostgreSQL database
- [ ] Configure environment variables:
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=5000`
  - [ ] `DATABASE_URL` (auto-filled by Railway)
  - [ ] `JWT_SECRET`
  - [ ] `JWT_REFRESH_SECRET`
  - [ ] `FRONTEND_URL` (add after frontend deployment)
- [ ] Deploy backend
- [ ] Copy backend URL

### 2. Run Database Setup

- [ ] Run migrations: `npm run migrate`
- [ ] Seed database: `npm run seed`
- [ ] Verify database connection

### 3. Deploy Frontend (Vercel)

- [ ] Create account on Vercel
- [ ] Connect GitHub repository
- [ ] Select `frontend` folder as root
- [ ] Configure build settings:
  - [ ] Framework: Vite
  - [ ] Build Command: `npm run build`
  - [ ] Output Directory: `dist`
- [ ] Add environment variable:
  - [ ] `VITE_API_URL=https://your-backend.railway.app/api/v1`
- [ ] Deploy frontend
- [ ] Copy frontend URL

### 4. Update Backend CORS

- [ ] Go back to Railway/Render backend
- [ ] Update `FRONTEND_URL` with Vercel URL
- [ ] Redeploy backend (automatic)

---

## 🧪 Post-Deployment Testing

### Backend Tests
- [ ] Health check: `curl https://your-backend.com/api/v1/health`
- [ ] API docs accessible: `https://your-backend.com/api/docs`
- [ ] Database connection working
- [ ] Logs show no errors

### Frontend Tests
- [ ] Frontend loads: `https://your-app.vercel.app`
- [ ] Can register new user
- [ ] Can login with demo credentials:
  - Email: `admin@acme.com`
  - Password: `Password123!`
- [ ] Dashboard loads with data
- [ ] Can create new task
- [ ] Can filter and search tasks
- [ ] Can update task status
- [ ] Can delete task
- [ ] Dark mode works
- [ ] Responsive design works on mobile

### Integration Tests
- [ ] Frontend connects to backend
- [ ] Authentication works end-to-end
- [ ] JWT tokens refresh correctly
- [ ] Multi-tenant isolation works
- [ ] RBAC permissions work
- [ ] Real-time updates work (if applicable)

---

## 📊 Monitoring

### Check Logs
- [ ] Backend logs (Railway/Render dashboard)
- [ ] Frontend logs (Vercel dashboard)
- [ ] Database logs
- [ ] No error messages

### Performance
- [ ] API response time < 500ms
- [ ] Frontend loads < 3 seconds
- [ ] Database queries optimized

---

## 📝 Documentation

- [ ] Update README.md with production URLs
- [ ] Document deployment process
- [ ] Add troubleshooting guide
- [ ] Share URLs with evaluators

---

## 🎯 Final Verification

- [ ] All features work in production
- [ ] No console errors in browser
- [ ] No server errors in logs
- [ ] HTTPS enabled (automatic on Vercel/Railway)
- [ ] CORS working correctly
- [ ] Authentication working
- [ ] Database queries working
- [ ] Multi-tenancy working

---

## 📧 Share with Evaluators

Provide these URLs:

```
Frontend: https://your-app.vercel.app
Backend API: https://your-backend.railway.app
API Docs: https://your-backend.railway.app/api/docs
GitHub: https://github.com/debanshupathy2005/multi-tenant-task-manager

Demo Credentials:
Email: admin@acme.com
Password: Password123!
```

---

## 🐛 Common Issues

### Issue: Frontend can't connect to backend
**Solution**: Check `VITE_API_URL` is correct and backend is running

### Issue: CORS error
**Solution**: Verify `FRONTEND_URL` in backend matches Vercel URL

### Issue: Database connection failed
**Solution**: Check `DATABASE_URL` format and database is running

### Issue: 401 Unauthorized
**Solution**: Check JWT secrets are set correctly

### Issue: Build failed
**Solution**: Check all dependencies are in `package.json`, not `devDependencies`

---

## ✅ Deployment Complete!

Once all items are checked, your application is live and ready for evaluation! 🎉
