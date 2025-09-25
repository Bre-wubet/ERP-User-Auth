# ERP User Authentication and Access Control System

A comprehensive full-stack authentication and access control system for ERP environments, featuring modern React frontend and Node.js backend with advanced security features.

## 🚀 Overview

This system provides enterprise-grade user authentication, role-based access control, and comprehensive audit logging for ERP applications. Built with modern technologies and security best practices.

## ✨ Key Features

### 🔐 Authentication & Security
- **JWT-based authentication** with access and refresh tokens
- **Multi-Factor Authentication (MFA)** using TOTP (Google Authenticator compatible)
- **Password management** with secure hashing (bcrypt) and complexity requirements
- **Session management** with automatic cleanup and device tracking
- **Rate limiting** for authentication endpoints
- **Security headers** and CORS protection
- **Account lockout** after failed attempts

### 👥 User Management
- **User CRUD operations** with comprehensive validation
- **User activation/deactivation** with audit trails
- **Session management** and revocation capabilities
- **User statistics** and activity tracking
- **Advanced search functionality** with filters
- **Bulk operations** for user management

### 🛡️ Role-Based Access Control (RBAC)
- **Role management** with scoped permissions
- **User-role assignment** and management
- **Permission checking** middleware
- **Dynamic role validation**
- **Scope-based access control** for module-level permissions
- **Permission inheritance** and delegation

### 📊 Audit & Monitoring
- **Comprehensive audit logging** for all operations
- **Security event tracking** with real-time alerts
- **Audit log search** and filtering capabilities
- **Export functionality** (JSON/CSV formats)
- **Statistics and reporting** dashboards
- **Automatic log cleanup** with configurable retention

### 🎨 Modern UI/UX
- **Responsive design** with mobile-first approach
- **Dark/Light theme** support (ready for implementation)
- **Accessible components** with proper ARIA labels
- **Loading states** and comprehensive error handling
- **Toast notifications** for user feedback
- **Smooth animations** and transitions

## 🏗️ Architecture

### Backend (Node.js)
- **ES Modules** with modern JavaScript
- **Prisma ORM** for type-safe database operations
- **Express.js** with middleware architecture
- **Input validation** with express-validator
- **Error handling** with custom error classes
- **Structured logging** with multiple levels
- **Health checks** and monitoring endpoints

### Frontend (React)
- **React 19** with modern hooks and functional components
- **Vite** for fast development and optimized builds
- **React Router DOM** for client-side routing
- **Tailwind CSS** for utility-first styling
- **React Hook Form** for form handling and validation
- **Context-based state management** with React Context API
- **Custom hooks** for API integration

## 🛠️ Tech Stack

### Backend Technologies
- **Node.js 18+** - Runtime environment
- **Express.js** - Web framework
- **Prisma** - Database ORM
- **PostgreSQL** - Primary database
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **speakeasy** - MFA implementation
- **nodemailer** - Email services

### Frontend Technologies
- **React 19** - UI library
- **Vite** - Build tool and dev server
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **React Hook Form** - Form handling and validation
- **Axios** - HTTP client
- **Lucide React** - Icon library
- **React Hot Toast** - Toast notifications

## 📁 Project Structure

```
erp-security-system/
├── backend/                 # Node.js backend
│   ├── config/             # Configuration files
│   ├── controllers/        # Route controllers
│   ├── middlewares/        # Express middleware
│   ├── routes/             # API route definitions
│   ├── services/           # Business logic layer
│   ├── utils/              # Utility functions
│   ├── prisma/             # Database schema and migrations
│   ├── generated/          # Generated Prisma client
│   └── server.js           # Main server file
├── frontend/                # React frontend
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   │   ├── auth/       # Authentication components
│   │   │   ├── layout/     # Layout components
│   │   │   └── ui/         # UI components
│   │   ├── context/        # React Context providers
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── hooks/          # Custom hooks
│   │   ├── utils/          # Utility functions
│   │   └── App.jsx         # Main app component
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+**
- **PostgreSQL 13+**
- **pnpm** (recommended) or npm

### 1. Clone and Setup
```bash
git clone <repository-url>
cd erp-security-system
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
pnpm install

# Environment setup
cp .env.example .env
# Edit .env with your configuration

# Database setup
pnpm db:generate
pnpm db:migrate

# Start development server
pnpm dev
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
pnpm install

# Environment setup
cp .env.example .env
# Edit .env with your API URL

# Start development server
pnpm dev
```

### 4. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/health

## 🔧 Configuration

### Backend Environment Variables
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
FRONTEND_URL="http://localhost:5173"

# Security
BCRYPT_SALT_ROUNDS=12
RATE_LIMIT_MAX_REQUESTS=100

# Email (Optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

### Frontend Environment Variables
```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=ERP Authentication System
VITE_APP_VERSION=1.0.0
```

## 📚 API Documentation

### Authentication Endpoints (`/api/auth`)
- `POST /register` - User registration with validation
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

## 🎨 Frontend Components

### Authentication Components
- **LoginForm** - Email/password authentication with MFA support
- **RegisterForm** - User registration with validation
- **MFAForm** - TOTP code input with timer countdown
- **ForgotPasswordForm** - Password reset initiation
- **ResetPasswordForm** - Password reset completion

### Layout Components
- **Sidebar** - Collapsible navigation with role-based menu
- **Navbar** - Top navigation with search and notifications
- **PrivateRoute** - Route protection with authentication

### UI Components
- **Button** - Multiple variants with loading states
- **Input** - Form inputs with validation states
- **Card** - Flexible content containers
- **Table** - Sortable tables with pagination
- **Modal** - Overlay modals with keyboard navigation
- **Select** - Dropdown selects with search

### Pages
- **Dashboard** - Main dashboard with statistics
- **UserManagement** - User CRUD operations
- **RoleManagement** - Role management interface
- **AuditLogs** - Audit log viewing and search
- **ProfileSettings** - User profile management
- **MFAManagement** - MFA setup and management
- **SessionManagement** - Active session management
- **SystemHealth** - System monitoring dashboard

## 🔐 Security Features

### Authentication Security
- **JWT tokens** with short expiration times (15 minutes)
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

## 🧪 Development

### Code Style
- **ES Modules** throughout the codebase
- **Functional programming** patterns
- **TypeScript-ready** with JSDoc comments
- **Error handling** with custom error classes
- **Input validation** with express-validator
- **Structured logging** with context

### Testing
```bash
# Backend tests
cd backend
pnpm test

# Frontend tests
cd frontend
pnpm test

# Run tests with coverage
pnpm test:coverage
```

### Database Management
```bash
# Generate Prisma client
pnpm db:generate

# Run migrations
pnpm db:migrate

# Reset database
pnpm db:reset

# Seed database
pnpm db:seed
```

## 🚀 Production Deployment

### Docker Support
```dockerfile
# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm db:generate
EXPOSE 3000
CMD ["pnpm", "start"]

# Frontend Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Environment Considerations
- Use **strong JWT secrets** in production
- Configure **proper CORS** origins
- Set up **rate limiting** appropriately
- Enable **HTTPS** with proper certificates
- Configure **database connection pooling**
- Set up **monitoring** and **alerting**

## 📊 Monitoring & Health Checks

### Health Check Endpoints
- `GET /health` - Server status and database connectivity
- `GET /api/health` - API-specific health checks

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

## 🤝 Contributing

1. Follow the existing code style and patterns
2. Add comprehensive error handling
3. Include input validation for all endpoints
4. Write tests for new functionality
5. Update documentation for API changes
6. Follow security best practices
7. Ensure accessibility compliance
8. Test across different devices

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the documentation
- Review the code comments
- Open an issue on GitHub
- Contact the development team

---

**Built with ❤️ for enterprise security and user management**
