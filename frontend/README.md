# ERP User Authentication Frontend

A modern React frontend for the ERP User Authentication and Access Control system, built with Vite, React Router, and Tailwind CSS.

## 🚀 Features

### 🔐 Authentication & Security
- **JWT-based authentication** with automatic token refresh
- **Multi-Factor Authentication (MFA)** with TOTP support
- **Protected routes** with role-based access control
- **Session management** with automatic logout on token expiry
- **Secure password handling** with client-side validation

### 🎨 Modern UI/UX
- **Responsive design** with mobile-first approach
- **Dark/Light theme** support (ready for implementation)
- **Accessible components** with proper ARIA labels
- **Loading states** and error handling
- **Toast notifications** for user feedback
- **Smooth animations** and transitions

### 🏗️ Architecture
- **Component-based architecture** with reusable UI components
- **Context-based state management** with React Context API
- **Custom hooks** for API integration
- **TypeScript-ready** with JSDoc comments
- **Modern React patterns** (hooks, functional components)

### 📱 Components
- **Authentication forms** (Login, Register, MFA)
- **Dashboard** with statistics and activity feed
- **Navigation** with collapsible sidebar
- **Data tables** with sorting and pagination
- **Modals** and overlays
- **Form components** with validation

## 🛠️ Tech Stack

- **React 19** - UI library
- **Vite** - Build tool and dev server
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **React Hook Form** - Form handling and validation
- **React Query** - Data fetching and caching
- **Zustand** - State management (ready for implementation)
- **Axios** - HTTP client
- **Lucide React** - Icon library
- **React Hot Toast** - Toast notifications

## 📁 Project Structure

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── components/        # Reusable components
│   │   ├── auth/         # Authentication components
│   │   ├── layout/       # Layout components
│   │   └── ui/           # UI components
│   ├── context/          # React Context providers
│   ├── pages/            # Page components
│   ├── services/         # API services
│   ├── hooks/            # Custom hooks
│   ├── utils/            # Utility functions
│   ├── styles/           # Global styles
│   └── App.jsx           # Main app component
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

1. **Install dependencies**
```bash
cd frontend
pnpm install
```

2. **Environment setup**
Create a `.env` file in the frontend directory:
```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=ERP Authentication System
VITE_APP_VERSION=1.0.0
```

3. **Start development server**
```bash
pnpm dev
```

4. **Build for production**
```bash
pnpm build
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:3000/api` |
| `VITE_APP_NAME` | Application name | `ERP System` |
| `VITE_APP_VERSION` | Application version | `1.0.0` |

### Tailwind CSS

The project uses Tailwind CSS with custom configuration:
- Custom color palette
- Extended animations
- Custom font family (Inter)
- Responsive breakpoints

## 📱 Components

### Authentication Components

#### LoginForm
- Email/password authentication
- Remember me functionality
- Forgot password link
- MFA support

#### RegisterForm
- User registration with validation
- Password strength requirements
- Terms and conditions acceptance
- Email verification ready

#### MFAForm
- TOTP code input
- Timer countdown
- Backup code support
- Resend functionality

### Layout Components

#### Sidebar
- Collapsible navigation
- Role-based menu items
- User profile display
- Quick actions

#### Navbar
- Search functionality
- Notifications dropdown
- User menu
- Mobile responsive

### UI Components

#### Button
- Multiple variants (primary, secondary, danger, etc.)
- Loading states
- Icon support
- Full width option

#### Input
- Validation states
- Error messages
- Helper text
- Icon support

#### Card
- Flexible content containers
- Header, content, footer sections
- Shadow variants
- Padding options

#### Table
- Sortable columns
- Pagination
- Action buttons
- Responsive design

#### Modal
- Overlay with backdrop
- Keyboard navigation
- Customizable size
- Close on escape

## 🔐 Authentication Flow

1. **Login Process**
   - User enters credentials
   - System validates and returns tokens
   - If MFA enabled, redirect to MFA form
   - Store tokens in localStorage
   - Redirect to dashboard

2. **Token Management**
   - Automatic token refresh
   - Logout on refresh failure
   - Secure token storage
   - Session validation

3. **Route Protection**
   - Private routes require authentication
   - Role-based access control
   - Redirect to login if unauthorized
   - Loading states during auth check

## 🎨 Styling

### Design System
- **Colors**: Primary blue palette with semantic colors
- **Typography**: Inter font family with consistent sizing
- **Spacing**: 4px base unit with consistent spacing scale
- **Shadows**: Subtle shadows for depth
- **Borders**: Consistent border radius and colors

### Responsive Design
- **Mobile-first**: Designed for mobile devices first
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Flexible layouts**: Grid and flexbox for responsive layouts
- **Touch-friendly**: Appropriate touch targets for mobile

## 🔌 API Integration

### Service Layer
- Centralized API configuration
- Request/response interceptors
- Error handling
- Token management

### Data Fetching
- React Query for caching
- Optimistic updates
- Background refetching
- Error boundaries

## 🧪 Testing

### Testing Strategy
- Unit tests for components
- Integration tests for flows
- E2E tests for critical paths
- Accessibility testing

### Test Setup
```bash
# Install testing dependencies
pnpm add -D @testing-library/react @testing-library/jest-dom vitest

# Run tests
pnpm test
```

## 🚀 Deployment

### Build Process
```bash
# Production build
pnpm build

# Preview build
pnpm preview
```

### Deployment Options
- **Static hosting**: Netlify, Vercel, GitHub Pages
- **CDN**: CloudFront, Cloudflare
- **Container**: Docker with Nginx

### Environment Configuration
- Set production API URL
- Configure build optimizations
- Set up monitoring and analytics

## 🔧 Development

### Code Style
- ESLint configuration
- Prettier formatting
- Consistent naming conventions
- Component documentation

### Performance
- Code splitting
- Lazy loading
- Image optimization
- Bundle analysis

### Accessibility
- ARIA labels and roles
- Keyboard navigation
- Screen reader support
- Color contrast compliance

## 📚 Documentation

### Component Documentation
- JSDoc comments
- Props documentation
- Usage examples
- Storybook integration (ready)

### API Documentation
- Service layer documentation
- Error handling guide
- Authentication flow
- Data models

## 🤝 Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation
4. Ensure accessibility compliance
5. Test across different devices

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the documentation
- Review the code comments
- Open an issue on GitHub
- Contact the development team