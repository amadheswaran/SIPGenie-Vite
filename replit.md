# Overview

SIPGenie is a comprehensive, mobile-first web application for SIP (Systematic Investment Plan) calculations built with React, TypeScript, and Express. The platform helps users calculate SIP returns, compare investment strategies, and build finance confidence through simple, delightful tools and content. Features include an interactive calculator with precise mathematical formulas, data visualization through charts, comprehensive FAQ sections, and engaging visual design with animations and glassmorphism effects.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development and building
- **Routing**: Wouter for lightweight client-side routing
- **UI Framework**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Charts**: Recharts for data visualization (pie charts, line charts)
- **Forms**: React Hook Form with Zod validation via @hookform/resolvers

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Management**: Connect-pg-simple for PostgreSQL session storage
- **Development**: Hot reload with Vite integration for seamless full-stack development

## Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect for type-safe database queries
- **Schema**: Shared schema definitions between client and server using Drizzle Zod
- **Migrations**: Drizzle Kit for database migrations and schema management
- **Storage Interface**: Abstracted storage layer with in-memory fallback for development

## Authentication & Session Management
- **Session Store**: PostgreSQL-backed sessions using connect-pg-simple
- **User Management**: Basic user schema with username/password authentication
- **Security**: Prepared for cookie-based session management

## Development & Build
- **Build Tool**: Vite for frontend bundling with React plugin
- **Backend Build**: ESBuild for server bundling to ESM format
- **Development**: Integrated development server with Vite middleware for HMR
- **Type Safety**: Strict TypeScript configuration with path mapping for imports

## Styling & UI
- **CSS Framework**: Tailwind CSS with custom design tokens
- **Component Library**: Comprehensive Shadcn/ui component set including forms, dialogs, charts, and navigation
- **Theme**: Custom color palette with CSS variables for light/dark mode support
- **Responsive Design**: Mobile-first approach with responsive breakpoints

## External Dependencies

- **@neondatabase/serverless**: Serverless PostgreSQL database connection
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/***: Headless UI components for accessibility
- **drizzle-orm & drizzle-kit**: Type-safe ORM and migration tools
- **recharts**: Data visualization library for investment charts
- **wouter**: Lightweight routing for React
- **tailwindcss**: Utility-first CSS framework
- **react-hook-form**: Form handling with validation
- **zod**: Runtime type validation and schema definition
- **lucide-react**: Icon library for UI components