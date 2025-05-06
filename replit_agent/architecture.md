# Architecture Documentation

## Overview

This application is a fullstack work pattern tracking system that allows users to manage and visualize their work location schedules (office, home, leave, etc.). The system supports both individual work patterns and team visibility, with different permission levels based on user roles.

The application follows a client-server architecture with:
- A React-based frontend (SPA)
- Express.js backend API
- PostgreSQL database with Drizzle ORM
- Authentication using Passport.js with sessions

## System Architecture

### High-Level Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│             │      │              │      │             │
│  React SPA  │<─────│  Express API │<─────│  PostgreSQL │
│  (Client)   │─────>│  (Server)    │─────>│  Database   │
│             │      │              │      │             │
└─────────────┘      └──────────────┘      └─────────────┘
```

The architecture follows a standard three-tier model:
1. **Presentation Layer**: React-based SPA with component library (shadcn/ui)
2. **Application Layer**: Express.js API handling business logic and authentication
3. **Data Layer**: PostgreSQL database accessed via Drizzle ORM

### Frontend Architecture

The frontend is built using React with the following key technologies:
- React for UI components
- Tanstack Query for data fetching and state management
- Wouter for client-side routing
- Tailwind CSS for styling
- shadcn/ui component library (Radix UI based)
- React Hook Form for form handling
- Zod for validation

The frontend follows a component-based architecture with:
- Pages (route-based components)
- Reusable UI components
- Shared hooks for global state and business logic

### Backend Architecture

The backend is built with Express.js and follows a modular structure:
- Route handlers for API endpoints
- Authentication middleware
- Database access layer
- Shared schemas between frontend and backend

## Key Components

### Frontend Components

1. **Pages**
   - `HomePage`: Main calendar view for work patterns
   - `AuthPage`: Login and registration
   - `AdminPage`: Admin-only user management
   - `SettingsPage`: User profile and preferences

2. **Core Components**
   - `CalendarView`: Main work pattern visualization
   - `Sidebar`: Navigation and user info
   - `Header`: App header with navigation controls

3. **State Management**
   - React Context for global state (auth, calendar)
   - Tanstack Query for server state
   - Local component state for UI interactions

### Backend Components

1. **API Routes**
   - Authentication endpoints (login, logout, register)
   - Work patterns CRUD operations
   - Recurring patterns management
   - User management (admin only)

2. **Middleware**
   - Authentication handling
   - Session management
   - Role-based access control

3. **Data Access**
   - ORM-based data access layer (Drizzle)
   - Storage service for database operations

### Database Schema

The database uses PostgreSQL with the following key entities:

1. **Users**
   - id, username, password, displayName, email, role, avatarUrl

2. **Work Patterns**
   - id, userId, date, location, notes
   - Represents individual work pattern entries

3. **Recurring Patterns**
   - id, userId, location, day flags (mon-sun), notes
   - Represents repeating work patterns

## Data Flow

### Authentication Flow

1. User submits login credentials via the AuthPage
2. Server validates credentials and creates a session
3. Session ID is stored in a cookie on the client
4. Subsequent requests include the session cookie for authentication
5. Protected routes check for valid session before processing requests

### Work Pattern Management Flow

1. User views calendar on HomePage
2. Frontend fetches work patterns from API for the current date range
3. User can add/edit/delete patterns through the UI
4. Changes are sent to the API and stored in the database
5. Calendar updates to reflect the changes

## External Dependencies

### Frontend Dependencies
- React ecosystem (React, React DOM)
- UI components (Radix UI, shadcn/ui)
- State management (Tanstack Query)
- Form handling (React Hook Form, Zod)
- Routing (Wouter)
- Styling (Tailwind CSS)
- Date handling (date-fns)

### Backend Dependencies
- Express.js for API server
- Passport.js for authentication
- Drizzle ORM for database access
- Zod for validation
- connect-pg-simple for session storage
- Neon PostgreSQL client for database connection

## Deployment Strategy

The application is configured for deployment on Replit, with:

1. **Build Process**
   - Vite for frontend bundling
   - esbuild for backend bundling
   - Combined build output in the `dist` directory

2. **Runtime Configuration**
   - Environment variables for database connection and secrets
   - Production mode optimizations

3. **Database Provisioning**
   - PostgreSQL database (Neon serverless PostgreSQL)
   - Migrations and seeding scripts

The deployment workflow includes:
1. Building both frontend and backend code
2. Provisioning database if needed
3. Running migrations
4. Starting the server in production mode

## Security Considerations

1. **Authentication**
   - Password hashing using scrypt
   - Session-based authentication
   - CSRF protection via same-site cookies

2. **Authorization**
   - Role-based access control (user vs admin)
   - Endpoint permission checks

3. **Data Protection**
   - Input validation using Zod schemas
   - Prepared statements for database queries