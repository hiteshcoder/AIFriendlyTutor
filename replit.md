# Dynamic HNI AI Insight Tool

## Overview

A cutting-edge market research platform that simulates a panel of High Net-Worth Individual (HNI) AI agents modeled on real-world notable figures. The tool gathers sentiment-aware brand feedback from these AI HNIs, grounding each interaction in up-to-the-minute news and personal context to support advanced research, comparative insights, and granular analytics filtering for enterprise market researchers.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

**July 27, 2025** - Complete application redesign based on new PRD:
- Transformed from LuxIQ luxury brand platform to Dynamic HNI AI Insight Tool
- Implemented market research-focused architecture with real-world persona modeling
- Expanded to 45+ HNI agents across 11 diverse categories and archetypes
- Integrated news context system for dynamic agent responses
- Built multi-account research platform with PostgreSQL persistence
- Created comprehensive insights page with advanced filtering and graphical analytics
- Added wealth tier categorization (HNWI/VHNWI/UHNWI) for precise demographic targeting
- Implemented Chart.js visualization for sentiment trends and demographic breakdowns
- Built navigation system between Research and Insights pages
- Deployed ready-to-use market research platform with enterprise-grade features

## System Architecture

The Dynamic HNI AI Insight Tool follows a full-stack TypeScript architecture designed for enterprise market research with real-time persona modeling:

### Frontend Architecture
- **Framework**: React 18 with Vite for build tooling
- **Styling**: Tailwind CSS with custom glassmorphic design system
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing
- **Charts**: Chart.js with react-chartjs-2 for data visualization

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ESM modules
- **API Design**: RESTful endpoints with JSON responses
- **Error Handling**: Centralized error middleware with structured responses

## Key Components

### Database Layer
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for Neon serverless)
- **Schema**: Shared schema definitions between client and server
- **Migrations**: Drizzle migrations in `/migrations` directory

### Core Services
- **PersonaService**: Orchestrates persona queries and response generation
- **LLMService**: Generates contextual responses based on persona characteristics
- **Storage**: Abstracted storage interface with in-memory implementation for development

### UI Architecture
- **Design System**: Dark theme with glassmorphic elements
- **Components**: Modular component structure with reusable UI primitives
- **Layout**: Dashboard-centric layout with chat interface and analytics panels
- **Responsiveness**: Mobile-first responsive design approach

## Data Flow

1. **Research Query**: Market researcher submits brand question through dedicated interface
2. **Context Gathering**: System retrieves latest news context for each HNI agent
3. **Agent Response Generation**: Each agent generates response based on persona + news context
4. **Sentiment & Analysis**: Automatic extraction of likes, dislikes, concerns, and sentiment
5. **Transparent Tracking**: All context used (news, personality traits) stored and accessible
6. **Analytics Aggregation**: Real-time dashboard updates with filtered insights
7. **Research Export**: Query history and analytics available for market research analysis

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Neon PostgreSQL serverless driver
- **drizzle-orm**: Type-safe ORM for database operations
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight React router
- **zod**: Runtime type validation and schema parsing

### UI Dependencies
- **@radix-ui/***: Headless UI primitives for accessibility
- **tailwindcss**: Utility-first CSS framework
- **chart.js**: Canvas-based charting library
- **date-fns**: Date manipulation utilities
- **lucide-react**: Icon library

### Development Dependencies
- **vite**: Frontend build tool and dev server
- **tsx**: TypeScript execution for Node.js
- **esbuild**: JavaScript bundler for production builds

## Deployment Strategy

### Development Setup
- **Dev Server**: Vite dev server with HMR for frontend
- **API Server**: Express server with hot reload via tsx
- **Database**: Environment-based DATABASE_URL configuration
- **Build Process**: Parallel frontend (Vite) and backend (esbuild) builds

### Production Build
- **Frontend**: Static assets built to `dist/public`
- **Backend**: Bundled server code to `dist/index.js`
- **Database**: Drizzle migrations and schema push commands
- **Environment**: NODE_ENV-based configuration switching

### Key Architectural Decisions

1. **Monorepo Structure**: Single repository with shared types and schemas between client/server
2. **Type Safety**: End-to-end TypeScript with shared schema validation using Drizzle and Zod
3. **Real-time Simulation**: Polling-based updates to simulate real-time persona responses
4. **Modular Storage**: Abstract storage interface allows switching between in-memory and database implementations
5. **Glassmorphic UI**: Custom design system with dark theme and glass-effect components for premium feel
6. **Component Composition**: Radix UI primitives with custom styling for maximum flexibility and accessibility