# System Patterns: StudyNexus

## Architecture Overview

### System Architecture
```
┌─────────────────┐
│  React Client   │
│  (Port 5173)    │
└────────┬────────┘
         │ HTTP/REST
         ▼
┌─────────────────┐
│  Express API    │
│  (Port 5000)    │
└────────┬────────┘
         │ SQL
         ▼
┌─────────────────┐
│ SQLite Database │
│  (Prisma ORM)   │
└─────────────────┘
```

### Component Architecture (Frontend)

**Page Structure:**
```
App
├── Sidebar (Navigation)
│   ├── Logo
│   ├── NavLinks (Home, Flashcards, Library, Stats)
│   └── UserProfile
└── MainContent (Route-based)
    ├── HomePage
    │   ├── StatsCards
    │   ├── FlashcardGrid
    │   └── LibraryCarousel
    ├── CreateFlashcardPage
    │   ├── DeckSelector
    │   ├── FlashcardForm
    │   └── QuickTips
    ├── FlashcardsPage
    │   ├── SearchBar
    │   ├── FilterPanel
    │   └── FlashcardList
    ├── LibraryPage
    └── StatsPage
```

## Key Technical Decisions

### 1. Database Choice: SQLite (via Prisma)
**Why:**
- Simple local development (no external DB service required)
- Still supports relational structure and indexing via Prisma
- Can migrate to a hosted DB later if needed

### 2. Monorepo vs Separate Repos
**Decision:** Monorepo structure
**Why:**
- Easier development coordination
- Shared types and utilities
- Simpler deployment for small team
- Single version control

### 3. State Management
**Decision:** React Context + Hooks (initially)
**Why:**
- Built-in, no external dependencies
- Sufficient for initial scope
- Can migrate to Redux/Zustand if needed

### 4. Code Highlighting Library
**Decision:** Prism.js
**Why:**
- Lightweight
- Extensive language support
- Easy React integration
- Good theme support for dark mode

### 5. Rich Text Editor
**Decision:** Simple textarea initially, TipTap later
**Why:**
- Start simple, add complexity when needed
- TipTap is React-friendly and extensible
- Markdown support potential

## Design Patterns

### Frontend Patterns

#### Component Structure
```javascript
// Feature-based component organization
components/
├── common/          // Reusable UI components
│   ├── Button/
│   ├── Card/
│   ├── Input/
│   └── Modal/
├── flashcard/       // Flashcard-specific components
│   ├── FlashcardForm/
│   ├── FlashcardCard/
│   └── CodeSnippet/
├── navigation/      // Navigation components
│   ├── Sidebar/
│   └── TopBar/
└── stats/           // Statistics components
    └── StatCard/
```

#### Custom Hooks Pattern
```javascript
// Reusable logic encapsulation
hooks/
├── useFlashcards.js    // Flashcard CRUD operations
├── useSearch.js        // Search functionality
├── useFilters.js       // Filter state management
└── useDebounce.js      // Debounced input
```

### Backend Patterns

#### Controller Pattern
```javascript
// Separation of route logic from route definitions
routes/flashcards.js → controllers/flashcardController.js
```

#### Service Layer (Optional for later)
```javascript
// Business logic separation
controllers/ → services/ → models/
```

#### Middleware Chain
```javascript
// Request processing pipeline
router.post('/flashcards', 
  validateInput,
  authenticateUser,  // Future
  createFlashcard
);
```

## Data Flow Patterns

### Creating a Flashcard
```
User Input → Form State → Validation → API Call → 
Database Insert → Response → UI Update → Success Message
```

### Search/Filter Flow
```
User Input → Debounce → Update Filter State → 
API Call with Params → Database Query → 
Results → Update UI
```

### Code Organization Principles

1. **Component Composition**: Build complex UIs from small, focused components
2. **Single Responsibility**: Each component/function does one thing well
3. **Props Down, Events Up**: Data flows down, events bubble up
4. **DRY (Don't Repeat Yourself)**: Extract common logic into hooks/utilities
5. **Feature Folders**: Group related files by feature, not by type

## Critical Implementation Paths

### Path 1: Create Flashcard Flow (MVP Priority)
1. Render FlashcardForm component
2. Handle form state with useState
3. Validate input before submission
4. POST to `/api/flashcards`
5. Handle success/error states
6. Redirect or show confirmation
7. Update flashcard list

### Path 2: Search & Filter Flow
1. User types in search or selects filter
2. Debounce input to avoid excessive API calls
3. Build query parameters
4. GET from `/api/flashcards?q=...&subject=...`
5. Render results in grid/list
6. Handle empty states

### Path 3: Display Code Snippets
1. Store code with language metadata
2. Pass to CodeSnippet component
3. Apply Prism.js highlighting
4. Render with dark theme
5. Add copy-to-clipboard functionality

## Database Query Patterns

### Filtering Query Pattern
```sql
SELECT * FROM flashcards 
WHERE 
  subject = $1 
  AND tags @> $2::jsonb  -- JSONB contains
  AND (front ILIKE $3 OR back ILIKE $3)  -- Search
ORDER BY created_at DESC
LIMIT 50;
```

### Tag Search Pattern
```sql
SELECT * FROM flashcards
WHERE tags @> '["array", "javascript"]'::jsonb;
```

## Error Handling Patterns

### Frontend
```javascript
try {
  const response = await api.createFlashcard(data);
  // Success handling
} catch (error) {
  // Show user-friendly error message
  // Log for debugging
}
```

### Backend
```javascript
// Consistent error responses
{
  success: false,
  error: {
    message: "User-friendly message",
    code: "ERROR_CODE",
    details: {} // Optional debug info
  }
}
```

## Styling Patterns

### Tailwind Utility Classes
- Use custom color palette from config
- Consistent spacing scale
- Dark mode by default
- Responsive breakpoints

### Component Styling
```javascript
// Co-locate styles with components
const buttonClasses = "px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors";
```

## Performance Patterns

1. **Lazy Loading**: Code-split routes with React.lazy()
2. **Debouncing**: Debounce search input (300ms)
3. **Pagination**: Limit results to 50 per page initially
4. **Caching**: Consider caching frequently accessed data
5. **Optimistic Updates**: Update UI before API confirms (for better UX)

## Security Considerations (Future)

1. **Input Validation**: Both client and server side
2. **SQL Injection Prevention**: Use parameterized queries
3. **XSS Prevention**: Sanitize user input, especially in code snippets
4. **Authentication**: JWT tokens for user sessions
5. **Rate Limiting**: Prevent abuse of API endpoints
