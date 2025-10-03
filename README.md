# TalentFlow

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen?style=flat-square)](#)
[![Node version](https://img.shields.io/badge/Node.js->=18-3c873a?style=flat-square)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19.1.1-61dafb?style=flat-square&logo=react)](https://reactjs.org)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](#)

> A modern, lightweight hiring platform for managing jobs, candidates, and assessments — all in one place.

[Features](#features) • [Getting Started](#getting-started) • [Development](#development) • [Architecture](#architecture) • [Known Issues](#known-issues)


## Overview

TalentFlow is a project that demonstrates a comprehensive mini hiring platform. Built as a front-end only application, it showcases advanced React patterns, state management, and modern web development practices without requiring a backend server.

This project implements a complete hiring workflow including job management, candidate tracking, and assessment systems — all powered by sophisticated client-side architecture with MirageJS for API simulation and IndexedDB for persistent storage.


## Features

### Job Management

- **Jobs Board**: Server-like pagination & filtering (title, status, tags) with 25+ seeded jobs
- **Create/Edit Modal**: Validation with required titles and unique slug generation
- **Archive/Unarchive**: Status management with optimistic updates
- **Drag & Drop Reordering**: Visual job prioritization with optimistic updates and rollback on simulated failures
- **Deep Linking**: Direct access to jobs via `/jobs/:jobId` routes
- **Advanced Search**: Real-time filtering by title, status, and tag-based categorization

### Candidate Tracking

- **Virtualized List**: High-performance rendering of 1000+ seeded candidates
- **Client-side Search**: Real-time filtering by name and email
- **Server-like Filtering**: Stage-based filtering with paginated results
- **Candidate Profiles**: Dedicated routes (`/candidates/:id`) showing complete timeline of status changes
- **Kanban Board**: Drag-and-drop stage progression (applied → screening → technical → offer → hired/rejected)
- **@Mentions**: Rich text notes with @mention rendering and local user suggestions

### Assessment System

- **Job-specific Assessment Builder**: Create custom assessments per job with sectioned organization
- **6 Question Types**: Single-choice, multi-choice, short text, long text, numeric with range validation, and file upload stubs
- **Live Preview Pane**: Real-time rendering of assessments as fillable forms
- **Form Validation**: Required fields, numeric ranges, max length constraints
- **Conditional Logic**: Dynamic question visibility (e.g., show Q3 only if Q1 === "Yes")
- **Local Persistence**: Builder state and candidate responses stored in IndexedDB
- **3+ Seeded Assessments**: Each with 10+ questions demonstrating various question types

### Technical Implementation

- **No Backend Required**: Complete front-end solution with simulated API layer
- **MirageJS Integration**: RESTful API simulation with realistic latency (200-1200ms)
- **Error Simulation**: 5-10% error rate on write endpoints to test resilience
- **IndexedDB Persistence**: All data persists locally with Dexie integration
- **State Restoration**: App restores complete state from IndexedDB on refresh
- **Optimistic Updates**: Immediate UI feedback with automatic rollback on failures

### User Experience

- **Dark/Light Mode**: System-aware theme switching with manual override
- **Responsive Design**: Mobile-first approach with seamless desktop experience
- **Loading States**: Skeleton screens and loading indicators for better perceived performance
- **Error Handling**: Comprehensive error boundaries with user-friendly messages
- **Accessibility**: WCAG compliant with proper ARIA labels and keyboard navigation

## Getting Started

### Prerequisites

- **Node.js 18+**: [Download Node.js](https://nodejs.org/)
- **Git**: [Download Git](https://git-scm.com/)
- **Modern Browser**: Chrome, Firefox, Safari, or Edge

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/soul-eater04/TalentFlow-ENTNT.git
   cd TalentFlow-ENTNT
   ```

2. **Navigate to the frontend directory**

   ```bash
   cd frontend
   ```

3. **Install dependencies**

   ```bash
   npm install
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**

   Navigate to `http://localhost:5173` to see the application in action.

> [!NOTE]
> The application uses MirageJS to simulate a complete REST API experience. Sample data is automatically seeded on startup, including **25 jobs** (mixed active/archived), **1,000 candidates** distributed across various stages, and **3+ assessment templates** with 10+ questions each. All data persists in IndexedDB between sessions.

## Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality checks

### Project Structure

```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # Reusable UI components (shadcn/ui)
│   │   ├── Home.jsx        # Landing page
│   │   ├── Jobs.jsx        # Job management
│   │   ├── Candidates.jsx  # Candidate listing
│   │   ├── KanbanBoard.jsx # Candidate pipeline
│   │   └── Assessment.jsx  # Assessment builder
│   ├── context/            # React context providers
│   ├── lib/                # Utility functions
│   └── assets/             # Static assets
├── mirage/                 # Mock API server
│   ├── server.js          # API route definitions
│   └── db.js              # Mock data and seeding
└── public/                # Static public assets
```

### Key Technologies

- **React 19**: Latest React with concurrent features and React Compiler
- **Vite**: Lightning-fast build tool with HMR
- **TailwindCSS + shadcn/ui**: Utility-first CSS with accessible component library
- **react-virtualized**: High-performance list rendering for large datasets
- **mentis**: @mention support for rich text interactions
- **@faker-js/faker**: Realistic mock data generation
- **Lucide React**: Comprehensive icon library with tree-shaking
- **Axios**: HTTP client with advanced request/response handling
- **React Router**: Client-side routing with modern patterns
- **MirageJS**: API mocking for realistic development experience
- **Dexie**: IndexedDB wrapper for client-side data persistence
- **@hello-pangea/dnd**: Drag and drop functionality for Kanban boards

## Architecture

### Frontend Architecture

TalentFlow follows modern React patterns with a component-based architecture:

- **Component Composition**: Reusable UI components built with Radix UI primitives
- **State Management**: React's built-in state with context for global state
- **Data Flow**: Unidirectional data flow with optimistic updates
- **Error Boundaries**: Graceful error handling at component boundaries
- **Performance**: Virtual scrolling, memo optimization, and code splitting

### API Endpoints (Simulated)

The application implements a complete REST API simulation through MirageJS:

**Jobs API**

```
GET    /api/jobs?search=&status=&page=&pageSize=&sort=
POST   /api/jobs → { id, title, slug, status: "active"|"archived", tags: string[], order: number }
PATCH  /api/jobs/:id
PATCH  /api/jobs/:id/reorder → { fromOrder, toOrder } (with occasional 500 errors for rollback testing)
```

**Candidates API**

```
GET    /api/candidates?search=&stage=&page=
POST   /api/candidates → { id, name, email, stage: "applied"|"screening"|"technical"|"offer"|"hired"|"rejected" }
PATCH  /api/candidates/:id (stage transitions)
GET    /api/candidates/:id/timeline
```

**Assessments API**

```
GET    /api/assessments/:jobId
PUT    /api/assessments/:jobId
POST   /api/assessments/:jobId/submit (stores responses locally)
```

### Mock API Design

The application includes a sophisticated mock API that simulates real-world scenarios:

- **RESTful Endpoints**: Standard HTTP methods with proper status codes
- **Realistic Data**: Faker.js generated data with relationships
- **Error Simulation**: Random failures to test error handling
- **Persistence**: IndexedDB storage for data across sessions
- **Pagination**: Server-side pagination with filtering and sorting

### Data Models

```typescript
// Job
interface Job {
  id: string;
  title: string;
  slug: string;
  description: string;
  status: "active" | "archived";
  postedBy: string;
  location: string;
  vacancies: number;
  postingDate: string;
  tags: string[];
  order: number;
}

// Candidate
interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  jobId: string;
  stage: "applied" | "screening" | "technical" | "offer" | "hired" | "rejected";
  timeline: Array<{ stage: string; stageUpdatedAt: string }>;
  notes: Array<{ text: string; date: string }>;
}

// Assessment
interface Assessment {
  id: string;
  jobId: string;
  name: string;
  sections: Array<{
    id: string;
    title: string;
    questions: Question[];
  }>;
}

// Question Types
interface Question {
  id: string;
  question: string;
  type:
    | "single-choice"
    | "multi-choice"
    | "short-text"
    | "long-text"
    | "numeric"
    | "file-upload";
  required: boolean;
  options?: string[]; // for choice questions
  minRange?: number; // for numeric questions
  maxRange?: number; // for numeric questions
  maxLength?: number; // for text questions
  conditionalLogic?: {
    dependsOn: string;
    showWhen: string;
  };
}
```

### Seed Data

- **25 Jobs**: Mixed active/archived status with realistic job titles and metadata
- **1,000 Candidates**: Randomly distributed across jobs and stages with complete timelines
- **3+ Assessments**: Each containing 10+ questions of various types
- **Artificial Latency**: 200-1200ms delays on API calls
- **Error Simulation**: 5-10% failure rate on write operations

## Browser Support

TalentFlow supports all modern browsers:

- Chrome/Chromium 88+
- Firefox 85+
- Safari 14+
- Edge 88+

> [!TIP]
> For the best experience, we recommend using the latest version of Chrome or Firefox.

## Performance Considerations

- **Virtual Scrolling**: Handles large datasets efficiently
- **Optimistic Updates**: Immediate UI feedback with server reconciliation
- **Code Splitting**: Dynamic imports for reduced initial bundle size
- **Image Optimization**: Responsive images with proper sizing
- **Caching**: Intelligent API response caching with invalidation

## Technical Decisions & Architecture

### Library Choices & Rationale

- **react-virtualized**: Chosen for efficient rendering of 1000+ candidate lists without performance degradation. Provides smooth scrolling and memory optimization for large datasets.
- **mentis**: Integrated for @mention support in candidate notes, offering a lightweight solution for user tagging with autocomplete functionality.
- **@faker-js/faker**: Used extensively for generating realistic mock data including names, emails, job titles, and locations, creating a authentic development experience.
- **shadcn/ui + TailwindCSS**: Provides a consistent design system with accessible, customizable components. shadcn/ui offers pre-built components while TailwindCSS enables rapid styling.
- **Lucide React**: Comprehensive icon library with consistent styling and excellent tree-shaking support, keeping bundle size minimal.
- **Axios**: Chosen over fetch for HTTP requests due to better error handling, request/response interceptors, and automatic JSON parsing.
- **Dexie**: Wraps IndexedDB with a more intuitive API for local data persistence, essential for offline-first architecture.
- **MirageJS**: Simulates a realistic API environment with latency and error simulation, enabling full-stack development experience without backend dependency.

### State Management Strategy

- **React Built-in State**: Using useState and useReducer for component-level state management
- **Context API**: Global state for theme preferences and user settings
- **Optimistic Updates**: Immediate UI feedback with server reconciliation and automatic rollback
- **Local-first Architecture**: IndexedDB as primary data store with API as sync layer

### Performance Optimizations

- **Virtual Scrolling**: react-virtualized handles 1000+ items efficiently
- **Code Splitting**: Route-based dynamic imports reduce initial bundle size
- **Debounced Search**: Prevents excessive API calls during user input

## Known Issues

### Current Limitations

- **Candidates Page Total Count**: The total candidate count display refreshes and becomes inaccurate when using client-side search, as the counter reflects filtered results rather than the actual total candidate count in the database.

- **Assessment Responses**: Candidate assessment responses are currently saved only in IndexedDB for local persistence. The responses are not yet displayed in the frontend interface, though they are successfully stored and can be retrieved programmatically.

- **Assessment Builder**: The assessment builder interface does not yet include a visual toggle or checkbox to mark questions as required. While the required field exists in the data model, the UI control for this feature is pending implementation.

---

<div align="center">

**React Technical Assignment - TalentFlow**

A comprehensive demonstration of modern React development practices

Made with ❤️ using React 19, TailwindCSS, MirageJS, and cutting-edge web technologies

---

_This project showcases advanced front-end development skills including state management, performance optimization, API simulation, and modern React patterns._

</div>
