# CashFlow Pro - Inventory and Sales Management System

## Overview

CashFlow Pro is a modern inventory and sales management system built with React, Express, and PostgreSQL. The application provides comprehensive functionality for managing products, tracking stock movements, processing sales, and generating reports. It features a dark-themed UI with a professional design and responsive layout.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### January 23, 2025
- Significantly improved mobile responsiveness across all pages (Dashboard, Products, Sales, Stock, Reports)
- Enhanced sidebar mobile experience with dynamic width and backdrop blur overlay
- Optimized grid layouts and button sizing for different screen sizes
- Added proper labels for "Quantidade" and "Desconto (Opcional)" in the sales section for better user experience

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: Radix UI primitives with shadcn/ui components
- **Styling**: TailwindCSS with custom dark theme
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ESM modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL with Neon Database serverless connection
- **API Design**: RESTful API with structured error handling
- **Development**: Hot reload with Vite integration

## Key Components

### Database Schema
- **Products**: Core inventory items with pricing, stock levels, and categories
- **Stock Movements**: Audit trail for all inventory changes (in/out transactions)
- **Sales**: Customer transactions with payment methods and totals
- **Sale Items**: Line items for individual products within sales
- **Categories**: Product categorization system

### Core Features
1. **Product Management**: CRUD operations for inventory items
2. **Stock Control**: Real-time inventory tracking with movement history
3. **Sales Processing**: Point-of-sale functionality with cart management
4. **Dashboard Analytics**: Key metrics and performance indicators
5. **Reporting System**: Sales reports with PDF generation capability

### UI/UX Design
- Dark theme with purple/cyan accent colors
- Responsive sidebar navigation
- Modal-based forms for data entry
- Toast notifications for user feedback
- Loading states and error handling
- Chart visualizations for sales data

## Data Flow

### Product Management Flow
1. User creates/edits products through modal forms
2. Form validation using Zod schemas
3. API requests to Express backend
4. Drizzle ORM handles database operations
5. React Query manages cache invalidation and updates

### Sales Processing Flow
1. User builds cart by selecting products and quantities
2. Stock availability validation in real-time
3. Sale creation triggers stock movement records
4. Inventory levels automatically updated
5. Dashboard metrics refreshed via query invalidation

### Stock Management Flow
1. Manual stock adjustments through dedicated interface
2. Automatic stock movements from sales transactions
3. Historical tracking of all inventory changes
4. Low stock alerts based on minimum thresholds

## External Dependencies

### Database
- **Neon Database**: Serverless PostgreSQL provider
- **Connection Pooling**: Built-in connection management
- **Migrations**: Drizzle Kit for schema management

### UI Libraries
- **Radix UI**: Accessible component primitives
- **Lucide React**: Icon library
- **Recharts**: Data visualization components
- **Date-fns**: Date manipulation utilities

### Development Tools
- **TypeScript**: Type safety across the stack
- **ESBuild**: Fast bundling for production
- **PostCSS**: CSS processing with Autoprefixer
- **Replit Integration**: Development environment support

## Deployment Strategy

### Development Environment
- Vite dev server with HMR for frontend
- Express server with TypeScript compilation
- Database migrations via Drizzle Kit
- Environment variables for database connection

### Production Build
1. Frontend built with Vite to `dist/public`
2. Backend compiled with ESBuild to `dist/index.js`
3. Static file serving through Express
4. Database schema applied via migration system

### Environment Configuration
- `NODE_ENV` for environment detection
- `DATABASE_URL` for PostgreSQL connection
- Replit-specific plugins for development integration

The application uses a monorepo structure with shared TypeScript types between frontend and backend, ensuring type safety across the entire stack. The architecture prioritizes developer experience with hot reload, type checking, and comprehensive error handling while maintaining production performance through optimized builds and efficient database queries.