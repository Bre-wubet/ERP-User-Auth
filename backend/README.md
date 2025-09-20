# ERP User Authentication and Access Control Backend

A comprehensive Node.js backend system for user authentication, role-based access control, and audit logging in an ERP environment.

## Features

### 🔐 Authentication & Security
- **JWT-based authentication** with access and refresh tokens
- **Multi-Factor Authentication (MFA)** using TOTP
- **Password management** with secure hashing (bcrypt)
- **Session management** with automatic cleanup
- **Rate limiting** for authentication endpoints
- **Security headers** and CORS protection

### 👥 User Management
- **User CRUD operations** with validation
- **User activation/deactivation**
- **Session management** and revocation
- **User statistics** and activity tracking
- **Search functionality** with filters

### 🛡️ Role-Based Access Control (RBAC)
- **Role management** with scoped permissions
- **User-role assignment** and management
- **Permission checking** middleware
- **Dynamic role validation**
- **Scope-based access control**

### 📊 Audit & Monitoring
- **Comprehensive audit logging** for all operations
- **Security event tracking**
- **Audit log search** and filtering
- **Export functionality** (JSON/CSV)
- **Statistics and reporting**
- **Automatic log cleanup**

### 🔧 Technical Features
- **ES Modules** with modern JavaScript
- **Prisma ORM** for database operations
- **Express.js** with middleware architecture
- **Input validation** with express-validator
- **Error handling** with custom error classes
- **Structured logging** with multiple levels
- **Health checks** and monitoring

## Database Schema

The system uses PostgreSQL with the following main entities:

- **User**: Core user information with MFA support
- **Role**: Role definitions with scoped permissions
- **Session**: Active user sessions with metadata
- **AuditLog**: Comprehensive audit trail
- **ApiToken**: Service-to-service authentication tokens

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login with MFA support
- `POST /refresh-token` - Token refresh
- `POST /logout` - User logout
- `POST /logout-all` - Logout from all sessions
- `POST /change-password` - Password change
- `POST /password-reset/initiate` - Initiate password reset
- `POST /password-reset/complete` - Complete password reset
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile
- `POST /mfa/setup` - Setup MFA
- `POST /mfa/enable` - Enable MFA
- `POST /mfa/disable` - Disable MFA

### User Management (`/api/users`)
- `GET /` - Get all users (paginated)
- `GET /search` - Search users
- `POST /` - Create new user
- `GET /:userId` - Get user by ID
- `PUT /:userId` - Update user
- `DELETE /:userId` - Delete user
- `PATCH /:userId/activate` - Activate user
- `PATCH /:userId/deactivate` - Deactivate user
- `GET /:userId/sessions` - Get user sessions
- `DELETE /sessions/:sessionId` - Revoke session
- `DELETE /:userId/sessions` - Revoke all sessions
- `GET /:userId/stats` - Get user statistics

### Role Management (`/api/roles`)
- `GET /` - Get all roles (paginated)
- `GET /search` - Search roles
- `GET /scopes` - Get available scopes
- `GET /stats` - Get role statistics
- `POST /` - Create new role
- `GET /:roleId` - Get role by ID
- `PUT /:roleId` - Update role
- `DELETE /:roleId` - Delete role
- `POST /assign` - Assign role to user
- `POST /remove` - Remove role from user
- `GET /check/:userId/:roleName` - Check user role
- `GET /check-scope/:userId/:scope` - Check role scope

### Audit (`/api/audit`)
- `GET /` - Get audit logs (paginated)
- `GET /search` - Search audit logs
- `GET /stats` - Get audit statistics
- `GET /modules` - Get available modules
- `GET /actions` - Get available actions
- `GET /export` - Export audit logs
- `POST /cleanup` - Clean up old logs
- `GET /:auditLogId` - Get audit log by ID
- `GET /user/:userId` - Get user audit logs
- `GET /module/:module` - Get module audit logs

## Installation & Setup

### Prerequisites
- Node.js 18+ 
- PostgreSQL 13+
- pnpm (recommended) or npm

### Installation

1. **Clone and install dependencies**
```bash
cd backend
pnpm install
```

2. **Environment setup**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Database setup**
```bash
# Generate Prisma client
pnpm db:generate

# Run migrations
pnpm db:migrate

# Or push schema to database
pnpm db:push
```

4. **Start the server**
```bash
# Development
pnpm dev

# Production
pnpm start
```

## Environment Variables

Key environment variables to configure:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/erp_auth_db"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-refresh-secret"
JWT_ACCESS_EXPIRY="15m"
JWT_REFRESH_EXPIRY="7d"

# Server
PORT=3000
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"

# Security
BCRYPT_SALT_ROUNDS=12
RATE_LIMIT_MAX_REQUESTS=100
```

## Security Features

### Authentication Security
- **JWT tokens** with short expiration times
- **Refresh token rotation** for enhanced security
- **MFA support** with TOTP (Google Authenticator compatible)
- **Password complexity** requirements
- **Account lockout** after failed attempts
- **Session management** with device tracking

### Authorization Security
- **Role-based access control** with fine-grained permissions
- **Scope-based restrictions** for module access
- **Resource ownership** validation
- **Permission inheritance** and delegation
- **Dynamic permission checking**

### Audit Security
- **Comprehensive logging** of all operations
- **Security event tracking** with alerts
- **Data integrity** monitoring
- **Compliance reporting** capabilities
- **Tamper-proof** audit trails

## Development

### Project Structure
```
backend/
├── config/          # Configuration files
├── controllers/     # Route controllers
├── middlewares/     # Express middleware
├── routes/          # API route definitions
├── services/        # Business logic layer
├── utils/           # Utility functions
├── prisma/          # Database schema and migrations
├── generated/       # Generated Prisma client
└── server.js        # Main server file
```

### Code Style
- **ES Modules** throughout the codebase
- **TypeScript-ready** with JSDoc comments
- **Functional programming** patterns
- **Error handling** with custom error classes
- **Input validation** with express-validator
- **Structured logging** with context

### Testing
```bash
# Run tests (when implemented)
pnpm test

# Run tests with coverage
pnpm test:coverage
```

## Production Deployment

### Docker Support
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm db:generate
EXPOSE 3000
CMD ["pnpm", "start"]
```

### Environment Considerations
- Use **strong JWT secrets** in production
- Configure **proper CORS** origins
- Set up **rate limiting** appropriately
- Enable **HTTPS** with proper certificates
- Configure **database connection pooling**
- Set up **monitoring** and **alerting**

## Monitoring & Health Checks

### Health Check Endpoint
```bash
GET /health
```

Returns server status, database connectivity, and system metrics.

### Logging
- **Structured JSON logging** with multiple levels
- **Request/response logging** with timing
- **Error tracking** with stack traces
- **Security event logging** with context
- **Audit trail** for compliance

### Metrics
- **Request rates** and response times
- **Authentication success/failure** rates
- **Database performance** metrics
- **Memory and CPU** usage
- **Custom business metrics**

## Contributing

1. Follow the existing code style and patterns
2. Add comprehensive error handling
3. Include input validation for all endpoints
4. Write tests for new functionality
5. Update documentation for API changes
6. Follow security best practices

## License

This project is licensed under the MIT License - see the LICENSE file for details.
