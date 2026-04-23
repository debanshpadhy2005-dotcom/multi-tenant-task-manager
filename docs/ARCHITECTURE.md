# TaskMaster - System Architecture Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture Patterns](#architecture-patterns)
3. [Multi-Tenancy Strategy](#multi-tenancy-strategy)
4. [Security Architecture](#security-architecture)
5. [Data Flow](#data-flow)
6. [Scalability Considerations](#scalability-considerations)

## Overview

TaskMaster is built using a **three-tier architecture** with clear separation of concerns:

1. **Presentation Layer** (Frontend) - React SPA
2. **Application Layer** (Backend) - Node.js/Express API
3. **Data Layer** (Database) - PostgreSQL

### Design Principles

- **Clean Architecture**: Separation of concerns with distinct layers
- **SOLID Principles**: Single responsibility, dependency inversion
- **DRY**: Don't Repeat Yourself
- **Security First**: Security considerations at every layer
- **Scalability**: Designed to scale horizontally
- **Maintainability**: Clear code structure and documentation

## Architecture Patterns

### 1. Controller-Service-Repository Pattern

```
┌─────────────────────────────────────────────────────┐
│                   HTTP Request                       │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│                 MIDDLEWARE LAYER                     │
│  • Authentication  • Authorization  • Validation    │
│  • Tenant Isolation  • Rate Limiting  • Logging     │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│                CONTROLLER LAYER                      │
│  • HTTP Request/Response handling                   │
│  • Input validation                                 │
│  • Response formatting                              │
│                                                      │
│  Example: TaskController                            │
│  - createTask()                                     │
│  - getTasks()                                       │
│  - updateTask()                                     │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│                 SERVICE LAYER                        │
│  • Business logic                                   │
│  • Data transformation                              │
│  • Cross-cutting concerns                           │
│  • Orchestration                                    │
│                                                      │
│  Example: TaskService                               │
│  - Permission checking                              │
│  - Notification creation                            │
│  - Business rule validation                         │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│               REPOSITORY LAYER                       │
│  • Data access logic                                │
│  • Database queries                                 │
│  • Tenant isolation enforcement                     │
│  • Query optimization                               │
│                                                      │
│  Example: TaskRepository                            │
│  - findById()                                       │
│  - create()                                         │
│  - update()                                         │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│                   DATABASE                           │
│              PostgreSQL with JSONB                   │
└──────────────────────────────────────────────────────┘
```

### 2. Middleware Pipeline

```
Request → Rate Limiter → CORS → Helmet → Body Parser 
       → Sanitization → Authentication → Tenant Validation 
       → Authorization → Activity Logger → Controller
```

### 3. Authentication Flow

```
┌──────────┐
│  Client  │
└────┬─────┘
     │ 1. POST /auth/login
     │    {email, password}
     ▼
┌────────────────┐
│ Auth Controller│
└────┬───────────┘
     │ 2. Validate input
     ▼
┌────────────────┐
│  Auth Service  │
└────┬───────────┘
     │ 3. Find user
     │ 4. Verify password (bcrypt)
     ▼
┌────────────────┐
│ User Repository│
└────┬───────────┘
     │ 5. User data
     ▼
┌────────────────┐
│  JWT Utility   │
└────┬───────────┘
     │ 6. Generate tokens
     │    - Access Token (15min)
     │    - Refresh Token (7days)
     ▼
┌────────────────┐
│     Client     │
│  Store tokens  │
└────────────────┘
```

### 4. Request Authorization Flow

```
┌──────────┐
│  Client  │
└────┬─────┘
     │ 1. Request with Bearer token
     │    Authorization: Bearer <jwt>
     ▼
┌─────────────────────┐
│ Auth Middleware     │
│ • Extract token     │
│ • Verify signature  │
│ • Check expiration  │
└────┬────────────────┘
     │ 2. JWT payload
     │    {userId, tenantId, roleId}
     ▼
┌─────────────────────┐
│ Fetch User from DB  │
│ • Get permissions   │
│ • Check active      │
└────┬────────────────┘
     │ 3. Attach to request
     │    req.user = user
     │    req.tenantId = tenantId
     ▼
┌─────────────────────┐
│ RBAC Middleware     │
│ • Check permissions │
│ • Validate access   │
└────┬────────────────┘
     │ 4. Authorized
     ▼
┌─────────────────────┐
│    Controller       │
└─────────────────────┘
```

## Multi-Tenancy Strategy

### Shared Database with Tenant Isolation

We use a **shared database, shared schema** approach with strict tenant isolation:

```sql
-- Every table has tenant_id
CREATE TABLE tasks (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    title VARCHAR(500),
    ...
);

-- Indexes for performance
CREATE INDEX idx_tasks_tenant_id ON tasks(tenant_id);

-- All queries include tenant_id
SELECT * FROM tasks WHERE tenant_id = $1 AND id = $2;
```

### Tenant Isolation Layers

1. **Database Level**
   - Every table has `tenant_id` foreign key
   - Indexes on `tenant_id` for performance
   - Optional: Row Level Security (RLS)

2. **Repository Level**
   - Base repository enforces tenant_id in all queries
   - No query can access data without tenant_id

3. **Middleware Level**
   - Tenant context extracted from JWT
   - Attached to every request
   - Cross-tenant access prevention

4. **Service Level**
   - Business logic validates tenant ownership
   - Additional permission checks

### Tenant Isolation Example

```typescript
// Base Repository - Enforces tenant isolation
class BaseRepository {
  async findById(id: string, tenantId: string) {
    return await query(
      'SELECT * FROM ${table} WHERE id = $1 AND tenant_id = $2',
      [id, tenantId]
    );
  }
}

// Middleware - Prevents cross-tenant access
export const preventCrossTenantAccess = (req, res, next) => {
  const requestTenantId = req.params.tenantId || req.body.tenantId;
  if (requestTenantId && requestTenantId !== req.tenantId) {
    return res.status(403).json({ error: 'Cross-tenant access denied' });
  }
  next();
};
```

### Why This Approach?

**Advantages:**
- ✅ Cost-effective (single database)
- ✅ Easy to maintain
- ✅ Simple backup/restore
- ✅ Good for small to medium scale
- ✅ Efficient resource utilization

**Considerations:**
- ⚠️ Requires careful query design
- ⚠️ Potential for data leakage if not careful
- ⚠️ All tenants affected by database issues

**Alternative Approaches:**
- **Database per tenant**: Better isolation, higher cost
- **Schema per tenant**: Middle ground
- **Separate databases**: Maximum isolation, complex management

## Security Architecture

### Defense in Depth

Multiple layers of security:

```
┌─────────────────────────────────────────────────┐
│ Layer 1: Network Security                       │
│ • HTTPS/TLS  • Firewall  • DDoS Protection     │
└─────────────────────────────────────────────────┘
                     │
┌─────────────────────────────────────────────────┐
│ Layer 2: Application Security                   │
│ • Helmet.js  • CORS  • Rate Limiting           │
└─────────────────────────────────────────────────┘
                     │
┌─────────────────────────────────────────────────┐
│ Layer 3: Authentication                          │
│ • JWT  • OAuth  • Password Hashing             │
└─────────────────────────────────────────────────┘
                     │
┌─────────────────────────────────────────────────┐
│ Layer 4: Authorization                           │
│ • RBAC  • Permission Checks  • Tenant Isolation│
└─────────────────────────────────────────────────┘
                     │
┌─────────────────────────────────────────────────┐
│ Layer 5: Input Validation                        │
│ • express-validator  • Sanitization  • Type    │
└─────────────────────────────────────────────────┘
                     │
┌─────────────────────────────────────────────────┐
│ Layer 6: Data Security                           │
│ • Parameterized Queries  • Encryption at Rest  │
└─────────────────────────────────────────────────┘
```

### Security Features

1. **Authentication**
   - JWT with short-lived access tokens (15 min)
   - Long-lived refresh tokens (7 days)
   - Password hashing with bcrypt (10 rounds)
   - OAuth integration (Google)

2. **Authorization**
   - Role-Based Access Control (RBAC)
   - Granular permissions
   - Resource ownership validation
   - Tenant isolation

3. **Input Validation**
   - express-validator for all inputs
   - XSS prevention through sanitization
   - SQL injection prevention (parameterized queries)
   - CSRF protection

4. **Rate Limiting**
   - General API: 100 req/15min
   - Auth endpoints: 5 req/15min
   - Per-IP tracking

5. **Security Headers**
   - Content Security Policy
   - X-Frame-Options
   - X-Content-Type-Options
   - Strict-Transport-Security

## Data Flow

### Task Creation Flow

```
┌─────────┐
│ Frontend│
└────┬────┘
     │ 1. User fills form
     │ 2. POST /api/v1/tasks
     │    {title, description, priority, assignedTo}
     ▼
┌──────────────────┐
│ Rate Limiter     │ Check request rate
└────┬─────────────┘
     ▼
┌──────────────────┐
│ Auth Middleware  │ Verify JWT, get user
└────┬─────────────┘
     ▼
┌──────────────────┐
│ RBAC Middleware  │ Check task:create permission
└────┬─────────────┘
     ▼
┌──────────────────┐
│ Validation       │ Validate input data
└────┬─────────────┘
     ▼
┌──────────────────┐
│ Task Controller  │ Handle HTTP request
└────┬─────────────┘
     │ 3. Call service
     ▼
┌──────────────────┐
│ Task Service     │ Business logic
│ • Add tenantId   │
│ • Add createdBy  │
│ • Create notif   │
└────┬─────────────┘
     │ 4. Save to DB
     ▼
┌──────────────────┐
│ Task Repository  │ Database query
└────┬─────────────┘
     │ 5. Task created
     ▼
┌──────────────────┐
│ Activity Logger  │ Log action
└────┬─────────────┘
     │ 6. Broadcast via WebSocket
     ▼
┌──────────────────┐
│ Socket.IO        │ Real-time update
└────┬─────────────┘
     │ 7. Response
     ▼
┌──────────────────┐
│ Frontend         │ Update UI
└──────────────────┘
```

### Real-Time Updates Flow

```
┌─────────┐                    ┌─────────┐
│ User A  │                    │ User B  │
└────┬────┘                    └────┬────┘
     │                              │
     │ 1. Connect WebSocket         │
     │    with JWT token            │
     ▼                              ▼
┌────────────────────────────────────────┐
│         Socket.IO Server               │
│  • Authenticate                        │
│  • Join tenant room                    │
│  • Join user room                      │
└────────────────────────────────────────┘
     │                              │
     │ 2. User A creates task       │
     │    assigned to User B        │
     ▼                              │
┌────────────────────────────────────────┐
│         Task Service                   │
│  • Create task                         │
│  • Create notification                 │
│  • Emit socket event                   │
└────────────────────────────────────────┘
     │                              │
     │ 3. Broadcast to tenant room  │
     │    and User B's room         │
     ├──────────────────────────────┤
     │                              │
     │                              ▼
     │                    ┌──────────────┐
     │                    │ User B gets  │
     │                    │ notification │
     │                    └──────────────┘
     ▼
┌──────────────┐
│ User A sees  │
│ task created │
└──────────────┘
```

## Scalability Considerations

### Horizontal Scaling

```
                    ┌──────────────┐
                    │ Load Balancer│
                    └──────┬───────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼────┐       ┌────▼────┐       ┌────▼────┐
   │ API     │       │ API     │       │ API     │
   │ Server 1│       │ Server 2│       │ Server 3│
   └────┬────┘       └────┬────┘       └────┬────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                    ┌──────▼───────┐
                    │  PostgreSQL  │
                    │  (Primary)   │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │  PostgreSQL  │
                    │  (Replica)   │
                    └──────────────┘
```

### Performance Optimizations

1. **Database**
   - Connection pooling (20 connections)
   - Indexes on frequently queried fields
   - Query optimization
   - Read replicas for scaling reads

2. **Caching**
   - Redis for session data
   - Cache frequently accessed data
   - Cache invalidation strategy

3. **API**
   - Response compression (gzip)
   - Pagination for large datasets
   - Field selection (only return needed fields)
   - Rate limiting to prevent abuse

4. **Frontend**
   - Code splitting
   - Lazy loading
   - Asset optimization
   - CDN for static assets

### Monitoring & Observability

```
┌─────────────────────────────────────────────┐
│            Application Metrics               │
│  • Request rate  • Response time            │
│  • Error rate    • Active users             │
└─────────────────────────────────────────────┘
                     │
┌─────────────────────────────────────────────┐
│              Logging System                  │
│  • Winston logs  • Error tracking           │
│  • Audit trail   • Security events          │
└─────────────────────────────────────────────┘
                     │
┌─────────────────────────────────────────────┐
│            Database Monitoring               │
│  • Query performance  • Connection pool     │
│  • Slow queries       • Deadlocks           │
└─────────────────────────────────────────────┘
                     │
┌─────────────────────────────────────────────┐
│            Infrastructure                    │
│  • CPU usage  • Memory  • Disk I/O          │
│  • Network    • Container health            │
└─────────────────────────────────────────────┘
```

## Technology Decisions

### Why Node.js/Express?
- ✅ JavaScript/TypeScript across stack
- ✅ Large ecosystem (npm)
- ✅ Good for I/O-heavy operations
- ✅ WebSocket support
- ✅ Fast development

### Why PostgreSQL?
- ✅ ACID compliance
- ✅ JSONB support for flexible data
- ✅ Excellent performance
- ✅ Strong community
- ✅ Advanced features (full-text search, etc.)

### Why React?
- ✅ Component-based architecture
- ✅ Large ecosystem
- ✅ Virtual DOM performance
- ✅ Strong community
- ✅ TypeScript support

### Why Zustand over Redux?
- ✅ Simpler API
- ✅ Less boilerplate
- ✅ Better TypeScript support
- ✅ Smaller bundle size
- ✅ Easier to learn

## Future Enhancements

1. **Microservices Architecture**
   - Split into separate services
   - Task service, Auth service, Notification service
   - API Gateway

2. **Event-Driven Architecture**
   - Message queue (RabbitMQ/Kafka)
   - Async processing
   - Event sourcing

3. **Advanced Caching**
   - Redis cluster
   - Cache warming
   - Distributed caching

4. **GraphQL API**
   - Alternative to REST
   - Client-specified queries
   - Real-time subscriptions

5. **Kubernetes Deployment**
   - Container orchestration
   - Auto-scaling
   - Self-healing

---

**Document Version**: 1.0  
**Last Updated**: 2026-04-22
