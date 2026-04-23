# TaskMaster - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Docker & Docker Compose installed
- OR Node.js 18+ and PostgreSQL 13+

## Option 1: Docker (Recommended) ⚡

### Step 1: Clone & Configure
```bash
git clone <repository-url>
cd multi_tenant_task_manager
cp .env.example .env
```

### Step 2: Start Everything
```bash
docker-compose up -d
```

### Step 3: Setup Database
```bash
# Run migrations
docker-compose exec backend npm run migrate

# Seed sample data
docker-compose exec backend npm run seed
```

### Step 4: Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Docs**: http://localhost:5000/api/docs

### Step 5: Login
Use these sample credentials:
- **Email**: admin@acme.com
- **Password**: Password123!

## Option 2: Manual Setup 🛠️

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run migrate
npm run seed
npm run dev
```

### Frontend
```bash
cd frontend
npm install
echo "VITE_API_URL=http://localhost:5000/api/v1" > .env
npm run dev
```

## 🎯 What to Try

1. **Register** a new organization
2. **Create** tasks with different priorities
3. **Assign** tasks to team members
4. **Filter** tasks by status/priority
5. **Search** for specific tasks
6. **View** activity logs
7. **Check** real-time notifications

## 📚 Sample Credentials

### Tenant: Acme Corporation
- **Admin**: admin@acme.com / Password123!
- **Manager**: manager@acme.com / Password123!
- **Member**: alice@acme.com / Password123!

### Tenant: TechStart Inc
- **Admin**: admin@techstart.com / Password123!

## 🔧 Troubleshooting

### Port Already in Use
```bash
# Change ports in .env file
PORT=5001
FRONTEND_PORT=3001
```

### Database Connection Failed
```bash
# Check PostgreSQL is running
docker-compose ps
docker-compose logs postgres
```

### Frontend Can't Connect to Backend
```bash
# Check backend is running
curl http://localhost:5000/api/v1/health

# Check CORS settings in backend/.env
CORS_ORIGIN=http://localhost:3000
```

## 📖 Next Steps

- Read [README.md](README.md) for full documentation
- Check [SETUP_GUIDE.md](docs/SETUP_GUIDE.md) for detailed setup
- Review [ARCHITECTURE.md](docs/ARCHITECTURE.md) for system design
- See [EVALUATION_GUIDE.md](docs/EVALUATION_GUIDE.md) for assessment

## 🆘 Need Help?

1. Check logs: `docker-compose logs -f`
2. Restart services: `docker-compose restart`
3. Clean start: `docker-compose down -v && docker-compose up -d`

---

**Ready to explore?** Open http://localhost:3000 and start managing tasks! 🎉
