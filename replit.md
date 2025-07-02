# TaxThink AI - Replit Configuration

## Overview

TaxThink AI is a full-stack web application that provides an intelligent tax consultation platform. The system helps users think through tax situations systematically for both US and Indian tax jurisdictions. It features a conversational AI interface that guides users through tax-related questions and provides structured insights.

## System Architecture

### Full-Stack Architecture
- **Frontend**: React with TypeScript, Vite build system
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **AI Integration**: OpenAI GPT-4o for tax consultation
- **UI Framework**: shadcn/ui components with Tailwind CSS
- **State Management**: TanStack Query for server state

### Project Structure
```
├── client/          # React frontend application
├── server/          # Express.js backend server
├── shared/          # Shared TypeScript schemas and types
├── migrations/      # Database migration files
└── dist/           # Build output directory
```

## Key Components

### Frontend Architecture
- **React 18** with TypeScript for type safety
- **Vite** for fast development and optimized builds
- **shadcn/ui** component library for consistent UI
- **Tailwind CSS** for styling with CSS variables for theming
- **Wouter** for client-side routing
- **TanStack Query** for API state management and caching

### Backend Architecture
- **Express.js** server with TypeScript
- **Drizzle ORM** for type-safe database operations
- **Neon Database** (PostgreSQL) for cloud database hosting
- **OpenAI API** integration for AI-powered tax consultation
- **Session-based** architecture for managing user conversations

### Database Schema
Three main entities:
1. **tax_sessions**: User consultation sessions with jurisdiction and currency settings
2. **messages**: Conversation history between user and AI assistant
3. **session_data**: Structured tax data collected during conversations

### AI Integration
- **OpenAI GPT-4o** model for natural language processing
- **TaxThinkingService** for generating contextual tax advice
- Support for both US and Indian tax jurisdictions
- Structured response format with insights, action items, and categories

## Data Flow

1. **Session Creation**: User creates a new tax consultation session with jurisdiction (US/India) and currency preferences
2. **AI Interaction**: User sends messages through chat interface
3. **Context Processing**: AI service processes messages with jurisdiction-specific tax knowledge
4. **Response Generation**: AI generates structured responses with insights and action items
5. **Data Storage**: All interactions and structured data are persisted to PostgreSQL
6. **Real-time Updates**: Frontend updates via TanStack Query with optimistic updates

## External Dependencies

### Core Dependencies
- **OpenAI**: AI-powered tax consultation
- **Neon Database**: Cloud PostgreSQL hosting
- **Drizzle ORM**: Type-safe database operations

### UI Dependencies
- **Radix UI**: Unstyled, accessible UI primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library

### Development Dependencies
- **TypeScript**: Type safety across the stack
- **Vite**: Fast development server and build tool
- **ESBuild**: Fast JavaScript bundler for production

## Deployment Strategy

### Development
- **Vite dev server** for frontend with HMR
- **tsx** for running TypeScript server in development
- **Database migrations** via Drizzle Kit

### Production Build
- **Vite build** for optimized frontend bundle
- **ESBuild** for server-side bundling
- **Static file serving** from Express server
- **Environment variables** for API keys and database URL

### Environment Requirements
- `DATABASE_URL`: PostgreSQL connection string
- `OPENAI_API_KEY` or `OPENAI_KEY`: OpenAI API authentication

## Changelog
- July 02, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.