# Multi-Tenant Task Management System

A production-grade, full-stack task management application with multi-tenancy, role-based access control (RBAC), and real-time features. Built with modern technologies and best practices for enterprise-level applications.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.0%2B-blue.svg)

## 🚀 Features

### Core Functionality
- ✅ **Multi-Tenant Architecture** - Complete data isolation between organizations
- ✅ **Role-Based Access Control (RBAC)** - Admin, Manager, and Member roles with granular permissions
- ✅ **JWT Authentication** - Secure authentication with access and refresh tokens
- ✅ **Task Management** - Create, read, update, delete tasks with advanced filtering
- ✅ **Real-time Notifications** - Task assignments and status updates
- ✅ **Activity Logging** - Comprehensive audit trail for all user actions
- ✅ **Advanced Search & Filters** - Search by title, filter by status, priority, assignee
- ✅ **Pagination** - Efficient data loading for large datasets
- ✅ **Responsive UI** - Beautiful, modern interface with dark mode support

### Security Features
- 🔒 JWT-based authentication with refresh token rotation
- 🔒 Password hashing with bcrypt
- 🔒 Rate limiting on sensitive endpoints
- 🔒 SQL injection prevention with parameterized queries
- 🔒 CORS configuration
- 🔒 Tenant isolation at database level

### Technical Highlights
- 📦 **Dockerized** - Full Docker Compose setup for easy deployment
- 📊 **PostgreSQL** - Robust relational database with proper indexing
- 🎨 **Modern UI** - Tailwind CSS with gradient themes and animations
- 📝 **TypeScript** - Full type safety across frontend and backend
- 🧪 **Production Ready** - Error handling, logging, validation
- 🔄 **RESTful API** - Clean, documented API endpoints

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL 15
- **Authentication**: JWT (jsonwebtoken), Passport.js
- **Validation**: Joi
- **Logging**: Winston
- **ORM**: Raw SQL with pg (PostgreSQL client)

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

### DevOps
- **Containerization**: Docker & Docker Compose
- **Database**: PostgreSQL with persistent volumes
- **Reverse Proxy**: Nginx (production)

## 📋 Prerequisites

Before running this project, ensure you have:

- **Node.js** 18.0.0 or higher
- **npm** 9.0.0 or higher
- **PostgreSQL** 15 or higher (or use Docker)
- **Git** for version control

## 🚀 Quick Start

### Option 1: Using Docker (Recommended)

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/multi-tenant-task-manager.git
cd multi-tenant-task-manager
```

2. **Start with Docker Compose**
```bash
docker-compose up -d
```

3. **Access the application**
- Frontend: http://localhost:3001
- Backend API: http://localhost:5000
- API Docs: http://localhost:5000/api/docs

### Option 2: Manual Setup

#### 1. Clone and Install

```bash
git clone https://github.com/yourusername/multi-tenant-task-manager.git
cd multi-tenant-task-manager
```

#### 2. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with your PostgreSQL credentials:
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=taskmaster
# DB_USER=postgres
# DB_PASSWORD=your_password
# JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
# JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production

# Create database and run migrations
npm run db:create
npm run db:migrate
npm run db:seed

# Start backend server
npm run dev
```

Backend will run on http://localhost:5000

#### 3. Setup Frontend

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env:
# VITE_API_URL=http://localhost:5000/api/v1

# Start frontend server
npm run dev
```

Frontend will run on http://localhost:3001

## 🔑 Demo Credentials

### Organization 1: Acme Corporation
- **Admin**: admin@acme.com / Password123!
- **Manager**: manager@acme.com / Password123!
- **Member**: john@acme.com / Password123!

### Organization 2: TechStart Inc
- **Admin**: admin@techstart.com / Password123!
- **Member**: sarah@techstart.com / Password123!

## 📁 Project Structure

```
multi-tenant-task-manager/
├── backend/                    # Backend API
│   ├── src/
│   │   ├── config/            # Configuration files
│   │   ├── controllers/       # Request handlers
│   │   ├── database/          # Database setup, migrations, seeders
│   │   ├── middleware/        # Express middleware
│   │   ├── repositories/      # Data access layer
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic
│   │   ├── types/             # TypeScript types
│   │   ├── utils/             # Utility functions
│   │   ├── validators/        # Request validation
│   │   ├── app.ts             # Express app setup
│   │   └── server.ts          # Server entry point
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── pages/             # Page components
│   │   ├── services/          # API services
│   │   ├── store/             # State management
│   │   ├── types/             # TypeScript types
│   │   ├── App.tsx            # Root component
│   │   └── main.tsx           # Entry point
│   ├── public/                # Static assets
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── docs/                       # Documentation
│   ├── ARCHITECTURE.md        # System architecture
│   ├── SETUP_GUIDE.md         # Detailed setup guide
│   └── EVALUATION_GUIDE.md    # Evaluation criteria
│
├── docker-compose.yml         # Docker Compose configuration
├── .gitignore                 # Git ignore rules
└── README.md                  # This file
```

## 🏗️ Architecture

### Multi-Tenant Architecture
- **Tenant Isolation**: Each organization's data is completely isolated using `tenant_id`
- **Shared Database**: Single database with tenant-based row-level security
- **Automatic Tenant Context**: Middleware automatically injects tenant context from JWT

### Authentication Flow
1. User logs in with email + password
2. Backend validates credentials and tenant
3. JWT access token (15min) + refresh token (7d) issued
4. Frontend stores tokens in localStorage
5. API requests include Authorization header
6. Middleware validates token and extracts user/tenant context

### RBAC Permissions
- **Admin**: Full access to all resources within tenant
- **Manager**: Create/update/delete own tasks, view all tasks
- **Member**: Create/update own tasks, view assigned tasks

### Database Schema
- **tenants**: Organization information
- **users**: User accounts with tenant association
- **roles**: Role definitions
- **permissions**: Granular permissions
- **tasks**: Task data with tenant isolation
- **notifications**: User notifications
- **activity_logs**: Audit trail

## 🔧 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout user
- `GET /api/v1/auth/me` - Get current user

### Tasks
- `GET /api/v1/tasks` - Get all tasks (with filters)
- `POST /api/v1/tasks` - Create new task
- `GET /api/v1/tasks/:id` - Get task by ID
- `PUT /api/v1/tasks/:id` - Update task
- `DELETE /api/v1/tasks/:id` - Delete task
- `GET /api/v1/tasks/stats` - Get task statistics

### Users (Admin only)
- `GET /api/v1/users` - Get all users in tenant
- `GET /api/v1/users/:id` - Get user by ID
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📦 Deployment

### Production Build

```bash
# Build backend
cd backend
npm run build

# Build frontend
cd frontend
npm run build
```

### Environment Variables

#### Backend (.env)
```env
NODE_ENV=production
PORT=5000
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=taskmaster
DB_USER=your-db-user
DB_PASSWORD=your-db-password
JWT_SECRET=your-production-jwt-secret
JWT_REFRESH_SECRET=your-production-refresh-secret
FRONTEND_URL=https://your-domain.com
```

#### Frontend (.env)
```env
VITE_API_URL=https://api.your-domain.com/api/v1
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

## 🙏 Acknowledgments

- Built as part of NIT academic project
- Inspired by modern SaaS applications
- Thanks to the open-source community

## 📸 Screenshots

### Login Page
![Login Page](docs/screenshots/login.png)

### Dashboard
![Dashboard](docs/screenshots/dashboard.png)

### Task Management
![Tasks](docs/screenshots/tasks.png)

### Dark Mode
![Dark Mode](docs/screenshots/dark-mode.png)

---

**Note**: This is a demonstration project built for educational purposes. For production use, ensure proper security audits, testing, and compliance with data protection regulations.
