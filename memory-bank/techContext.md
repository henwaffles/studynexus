# Technical Context: StudyNexus

## Technology Stack

### Frontend
- **Framework**: React (with TypeScript)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS (v4)
- **Routing**: React Router
- **Icons**: Material Symbols
- **Fonts**: Lexend (display), Noto Sans (body)

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: JavaScript
- **API Style**: RESTful API
- **ORM**: Prisma

### Database
- **Database**: SQLite (local development)
- **Rationale**:
  - Lightweight, zero-setup local DB
  - Works well with Prisma for relational modeling
  - Can migrate to a hosted DB later if needed

### Additional Libraries (Planned)
- **Code Highlighting**: Prism.js or Highlight.js
- **Rich Text**: React-based editor (TipTap or similar)
- **HTTP Client**: Axios
- **Authentication**: JWT

## Development Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager
- Git for version control

### Project Structure (Planned)
```
studynexus/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom hooks
│   │   ├── utils/         # Helper functions
│   │   ├── styles/        # Global styles
│   │   └── App.js
│   └── package.json
├── server/                # Express backend
│   ├── routes/           # API routes
│   ├── controllers/      # Route handlers
│   ├── models/          # Database models
│   ├── middleware/      # Custom middleware
│   ├── config/          # Configuration files
│   └── server.js
├── memory-bank/         # Project documentation
└── package.json
```

## Technical Constraints

### Performance Requirements
- Page load time: < 2 seconds
- Search results: < 500ms
- Smooth animations at 60fps
- Support for 1000+ flashcards per user

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Last 2 versions
- Mobile browsers (iOS Safari, Chrome Mobile)

### Data Constraints
- Question max length: 120 characters
- Answer max length: 1000 characters
- Code snippet max length: 5000 characters
- Max tags per flashcard: 10
- Tag max length: 30 characters

## Development Workflow

### Version Control
- Git with feature branches
- Main branch for production-ready code
- Develop branch for integration
- Feature branches: `feature/feature-name`

### Code Standards
- ESLint for code linting
- Prettier for code formatting
- Consistent naming conventions
- Component-based architecture

### Testing Strategy (Future)
- Unit tests for utilities and helpers
- Component tests for React components
- Integration tests for API endpoints
- E2E tests for critical user flows

## Database Schema (Initial Design)

### Flashcards Table
```sql
flashcards (
  id SERIAL PRIMARY KEY,
  front VARCHAR(120) NOT NULL,
  back TEXT NOT NULL,
  subject VARCHAR(100) NOT NULL,
  category VARCHAR(100) NOT NULL,
  difficulty VARCHAR(20) NOT NULL, -- 'easy', 'medium', 'hard'
  code_snippet TEXT,
  code_language VARCHAR(50),
  tags JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  user_id INTEGER REFERENCES users(id)
)
```

### Users Table (Future)
```sql
users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
)
```

### Indexes for Performance
- Index on `subject` for filtering
- Index on `category` for filtering
- GIN index on `tags` for tag searches
- Full-text search index on `front` and `back`

## API Endpoints (Planned)

### Flashcards
- `GET /api/flashcards` - Get all flashcards (with filters)
- `GET /api/flashcards/:id` - Get single flashcard
- `POST /api/flashcards` - Create flashcard
- `PUT /api/flashcards/:id` - Update flashcard
- `DELETE /api/flashcards/:id` - Delete flashcard

### Search
- `GET /api/search?q=query&subject=&tags=` - Search flashcards

### Stats (Future)
- `GET /api/stats` - Get user statistics

## Deployment (Future Consideration)
- Frontend: Vercel or Netlify
- Backend: Railway, Render, or DigitalOcean
- Database: Managed PostgreSQL (Railway, Supabase, or similar)
- Environment variables for configuration
- CI/CD pipeline with GitHub Actions
