# Agent Configuration

## Overview
This file contains the configuration and guidelines for the AI agent working on the CoreAppointment project.

## Project Structure
- **Frontend**: SvelteKit application with TypeScript
- **Backend**: Python services for appointment management
- **Database**: PostgreSQL/Neon for relational data
- **Deployment**: Vercel for frontend, Docker for backend services

## Agent Guidelines

### Development Rules
1. Always use `pnpm` for package management
2. Follow the existing code style and patterns
3. Prioritize component reusability in `src/components`
4. Maintain TypeScript strict mode compliance

### Architecture Principles
- Modular SaaS structure for local businesses
- Cookie-based authentication with httpOnly
- Explicit CORS configuration by environment
- "Less infrastructure, more delivered value" approach

### File Organization
```
src/
├── lib/
│   ├── api/          # API layer and services
│   ├── components/   # Reusable UI components
│   ├── stores/       # State management
│   └── utils/        # Utility functions
├── routes/           # Page routes
└── app.html          # Main app template
```

### Database Guidelines
- Use PostgreSQL for complex business logic (appointments, orders, customers)
- Use MongoDB for simple web projects and dynamic content
- Keep domains independent and configurable

### Security Considerations
- Never expose API keys in client-side code
- Use environment variables for sensitive configuration
- Implement proper authentication flows
- Validate all user inputs

## Agent Capabilities
- Code generation and modification
- File system operations
- Package management with pnpm
- Docker configuration
- Database schema design
- API integration

## Current Focus Areas
- Real-time appointment updates
- Time zone handling
- User authentication
- Component optimization
- Performance improvements

## Testing Strategy
- Unit tests for utility functions
- Integration tests for API endpoints
- E2E tests for critical user flows
- Performance testing for scalability

## Deployment Workflow
1. Development: Local Docker containers
2. Staging: Vercel preview deployments
3. Production: Optimized Docker builds

## Communication Protocol
- Use Spanish for user-facing content
- Use English for code comments and documentation
- Follow conventional commit messages
- Update README.md for significant changes

## Environment Variables
```env
PUBLIC_API_URL=http://localhost:5173/api
PUBLIC_WS_URL=ws://localhost:5173/ws
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
```

## Common Tasks
- Adding new appointment types
- Implementing user roles
- Setting up notifications
- Managing calendar integrations
- Handling payment processing

## Performance Optimization
- Lazy load components
- Implement caching strategies
- Optimize database queries
- Use CDN for static assets
- Monitor bundle size
