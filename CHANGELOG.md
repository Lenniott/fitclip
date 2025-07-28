# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased] - 2025-07-28

### Added
- **Video Player with Swipe Gestures** (`src/components/VideoPlayer.tsx`)
  - Full-screen video player with swipe navigation
  - Swipe left/right to navigate between exercise clips
  - Swipe up to view exercise details
  - Swipe down to return to list
  - Keyboard navigation support (arrow keys, escape)
  - Integrates with existing video caching system
  - Loading states and error handling with retry functionality

- **Video System Integration** (`src/utils/videoUtils.ts`)
  - Complete video caching system with IndexedDB
  - Multi-host support with automatic network detection
  - Intelligent cache management (500MB limit, 30-day expiry)
  - Fallback video URLs and error handling
  - Cache statistics and cleanup utilities

- **API Error Handling & Fallbacks** (`src/hooks/useAPI.ts`)
  - Robust error handling for bulk exercise endpoint failures
  - Automatic fallback to individual exercise requests when bulk endpoint fails
  - User-friendly error messages with retry functionality
  - Graceful degradation for routine detail pages

- **Docker Containerization** (`Dockerfile`, `docker-compose.yml`, `nginx.conf`)
  - Multi-stage Docker build for optimized production image
  - Nginx configuration with SPA routing support and API proxy
  - Docker Compose setup for easy deployment
  - Gzip compression and security headers
  - Health check endpoint and static asset caching

- **Mobile-First Responsive Design**
  - All components updated for mobile-first responsive design
  - Proper spacing and sizing for mobile devices (sm:, lg: breakpoints)
  - Sticky navigation header with mobile-optimized buttons
  - Responsive text sizes and spacing throughout
  - Mobile-optimized list items with proper touch targets
  - Flexible layouts that work on all screen sizes

- **Routine Detail Page** (`src/components/RoutineDetailPage.tsx`)
  - Click on any routine to see its exercises
  - Uses bulk endpoint to fetch exercises by IDs
  - Same interface as main exercise list but filtered to routine exercises
  - Selection mode and bulk delete functionality
  - Back navigation to routine list
  - Error handling for failed API calls

- **FitClip Logo Integration**
  - Added FitClip logo to app header for professional branding
  - Logo positioned next to app title in navigation
  - Clean, modern header design with logo and navigation buttons

- **Generic List Component** (`src/components/List.tsx`)
  - Flexible list component that can render any type of items
  - Loading states with spinner animation
  - Empty states with customizable messages
  - Smooth fade-in animations for list items

- **ExerciseListItem Component** (`src/components/ExerciseListItem.tsx`)
  - Displays exercise information with video preview
  - Shows fitness level, intensity, and timing data
  - Interactive video preview on hover
  - Delete functionality with confirmation
  - Selection state with visual feedback
  - **Visual Design**: Clean white background with teal lightning bolt icon
  - **Distinct Styling**: Subtle color accents and clean borders for exercise items
  - **Selection Mode**: Checkboxes visible when selection mode is active for bulk actions

- **RoutineListItem Component** (`src/components/RoutineListItem.tsx`)
  - Displays routine information with exercise count
  - Shows populated exercises when available
  - Fallback to exercise IDs when exercises not provided
  - Delete functionality with confirmation
  - Selection state with visual feedback
  - **Visual Design**: Clean white background with indigo clipboard icon
  - **Distinct Styling**: Subtle color accents and clean borders for routine items
  - **Selection Mode**: Checkboxes visible when selection mode is active for bulk actions

- **ListPage Component** (`src/components/ListPage.tsx`)
  - Generic list page component for any item type
  - Built-in selection mode with checkboxes
  - Bulk delete functionality with item count
  - Selected item display with JSON preview
  - Loading states and empty states
  - **ExerciseListPage**: Specialized component for exercise lists
  - **RoutineListPage**: Specialized component for routine lists

- **API Service Layer** (`src/services/api.ts`)
  - Complete integration with FitClip backend API
  - All endpoints from API_ENDPOINTS.MD implemented
  - Type-safe API calls with proper error handling
  - Video processing with job status polling
  - Story generation and semantic search
  - Health checks and statistics
  - Utility methods for URL validation and video URLs

- **React Hooks** (`src/hooks/useAPI.ts`)
  - Custom hooks for all API operations
  - Built-in loading states and error handling
  - Automatic data fetching and refetching
  - Action hooks for mutations (create, delete)
  - Job status polling for video processing
  - Semantic search and story generation hooks

- **TypeScript Type Definitions** (`src/types/index.ts`)
  - Exercise interface matching API documentation
  - Routine interface for routine data
  - Component prop interfaces for type safety
  - Generic ListProps interface for flexible list rendering

- **Vite Environment Type Declarations** (`src/vite-env.d.ts`)
  - TypeScript declarations for Vite environment variables
  - Fixed import.meta.env TypeScript errors

- **Constants File** (`src/constants.ts`)
  - API configuration with automatic network detection
  - Support for local, network, and Tailscale endpoints
  - Environment-based API URL resolution

### Changed
- **App Component** (`src/App.tsx`)
  - Converted from JSX to TSX for TypeScript support
  - Added demonstration of both exercise and routine lists
  - Implemented selection state management
  - Added sample data for testing components

- **CSS Styling** (`src/index.css`)
  - Added custom fade-in animations
  - Added line-clamp utility for text truncation
  - Maintained Tailwind CSS color scheme comments

### Technical Improvements
- **Type Safety**: Full TypeScript support throughout the component system
- **Modular Architecture**: Clean separation of concerns with dedicated component files
- **Reusable Components**: Generic List component can handle any data type
- **Consistent Styling**: Uses Tailwind CSS with custom color scheme
- **Performance**: Optimized animations and efficient rendering

### API Integration Ready
- **Exercise Data**: Components ready to consume real API data
- **Routine Data**: Support for routine management workflows
- **Video Streaming**: Integrated with API video serving endpoints
- **Error Handling**: Graceful handling of missing data and loading states

### Files Created
- `src/components/List.tsx` - Generic list component
- `src/components/ExerciseListItem.tsx` - Exercise display component
- `src/components/RoutineListItem.tsx` - Routine display component
- `src/components/index.ts` - Component exports
- `src/types/index.ts` - TypeScript interfaces
- `src/vite-env.d.ts` - Vite environment types
- `src/constants.ts` - API configuration
- `CHANGELOG.md` - This changelog file

### Files Modified
- `src/App.jsx` → `src/App.tsx` - Converted to TypeScript
- `src/main.jsx` - Updated import path
- `src/index.css` - Added animations and utilities 