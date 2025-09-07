# CrowdChain - Blockchain Crowdfunding Platform

## Overview

CrowdChain is a decentralized crowdfunding platform that leverages blockchain technology to create transparent, secure, and community-driven funding solutions. The application features a modern React frontend with a Node.js/Express backend, designed with a brutalist aesthetic and comprehensive UI component system. The platform aims to eliminate intermediaries in crowdfunding through smart contracts and decentralized governance.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: Comprehensive component system based on Radix UI primitives with shadcn/ui styling
- **Styling**: Tailwind CSS with custom brutalist design system featuring bold shadows, borders, and gradient text
- **State Management**: TanStack React Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Type Safety**: Full TypeScript implementation with strict configuration

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API structure with `/api` prefix for all routes
- **Storage Layer**: Abstracted storage interface supporting multiple implementations (currently in-memory storage)
- **Development**: Hot reload with Vite integration for seamless development experience

### Database Schema
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema**: User-centric design with username/password authentication
- **Migrations**: Managed through Drizzle Kit with schema versioning
- **Connection**: Configured for Neon serverless PostgreSQL but adaptable to other PostgreSQL providers

### Development Workflow
- **Build System**: Vite for frontend bundling, esbuild for backend compilation
- **Type Checking**: Unified TypeScript configuration covering client, server, and shared code
- **Path Aliases**: Organized imports with `@/` for client code and `@shared/` for shared utilities
- **Hot Reload**: Integrated development server with automatic restart and error overlay

### UI Component System
- **Design System**: Brutalist aesthetic with custom CSS variables and shadow system
- **Components**: Complete component library including forms, navigation, data display, and feedback components
- **Accessibility**: Built on Radix UI primitives ensuring WCAG compliance
- **Theming**: CSS custom properties supporting light/dark mode with extensive color palette

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: PostgreSQL serverless database connection
- **drizzle-orm**: Type-safe SQL query builder and ORM
- **@tanstack/react-query**: Server state management and caching
- **express**: Web application framework for Node.js

### UI and Styling
- **@radix-ui/***: Comprehensive collection of accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe variant management for components
- **clsx**: Conditional className utility

### Development Tools
- **vite**: Build tool and development server
- **tsx**: TypeScript execution for Node.js
- **drizzle-kit**: Database migration and schema management
- **@replit/vite-plugin-runtime-error-modal**: Development error handling
- **@replit/vite-plugin-cartographer**: Development tooling for Replit environment

### Utility Libraries
- **date-fns**: Date manipulation and formatting
- **nanoid**: Unique ID generation
- **zod**: Runtime type validation and schema definition
- **react-hook-form**: Form state management with validation
- **wouter**: Minimal client-side routing