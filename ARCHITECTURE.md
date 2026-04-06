# FinLens Architecture Documentation

## System Overview

FinLens is a unified finance intelligence platform built with a modern, free-tier-friendly architecture. The system is designed to be deployable entirely on free tiers while maintaining production-quality code and user experience.

## Architecture Diagram

```
┌─────────────────┐
│   User Browser  │
└────────┬────────┘
         │ HTTPS
         ▼
┌─────────────────┐
│  Vercel (CDN)   │  ← Frontend (React)
│  Static Assets  │
└────────┬────────┘
         │ API Calls
         ▼
┌─────────────────┐
│ Railway Backend │  ← Express.js API
│  (Node.js)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Railway Postgres│  ← Database
│   (Database)    │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│  ML Scripts     │  ← Python (Batch)
│  (Scheduled)    │
└─────────────────┘
```

## Component Details

### Frontend (React)

**Location**: `frontend/`

**Technology Stack**:
- React 18.2.0
- React Router 6.20.1
- Axios for API calls
- Recharts for data visualization
- Plain CSS (no frameworks)

**Key Features**:
- Client-side routing
- JWT token management
- Responsive design
- Modern animations

**Why This Stack?**
- React is industry-standard, resume-friendly
- No CSS framework = smaller bundle, more control
- Recharts is lightweight and free-tier friendly
- Axios simplifies API communication

### Backend (Express.js)

**Location**: `backend/`

**Technology Stack**:
- Node.js with Express.js
- Prisma ORM
- JWT authentication
- bcryptjs for password hashing

**API Design**:
- RESTful endpoints
- JSON responses
- Error handling middleware
- Input validation

**Why This Stack?**
- Express is lightweight and fast
- Prisma provides type safety and migrations
- JWT is stateless, scalable
- bcryptjs is secure and efficient

### Database (PostgreSQL)

**Schema Design**:
- Normalized relational structure
- Foreign key constraints
- Indexes on frequently queried columns
- Timestamps for audit trails

**Key Models**:
- User: Authentication and user data
- Expense: Personal expenses
- Group: Expense groups
- GroupExpense: Shared expenses
- GroupExpenseSplit: Individual splits
- StockHolding: Portfolio data
- MLInsight: Precomputed insights

**Why PostgreSQL?**
- Free tier available on Railway
- Robust, production-ready
- Excellent JSON support
- Strong consistency guarantees

### ML & Analytics (Python)

**Location**: `ml/`

**Technology Stack**:
- Python 3.8+
- Pandas for data manipulation
- NumPy for numerical operations
- scikit-learn for ML models
- Matplotlib for visualization (optional)

**ML Models**:

1. **Spending Pattern Analysis**
   - Method: Statistical analysis
   - Output: Trends, anomalies, category breakdowns
   - Complexity: O(n) - simple aggregation
   - Why: Explainable, no training needed

2. **Budget Forecasting**
   - Method: Linear Regression
   - Output: 3-month spending predictions
   - Complexity: O(n) - single pass
   - Why: Interpretable, works well with time-series

3. **Category Trend Analysis**
   - Method: Comparative statistics
   - Output: Growing/declining categories
   - Complexity: O(n) - aggregation
   - Why: Simple trend detection

4. **Group Summary**
   - Method: SQL aggregation
   - Output: Group expense summaries
   - Complexity: O(n) - database query
   - Why: Efficient, no ML needed

**Why This Approach?**
- Precomputed insights = no always-running ML
- Simple models = explainable results
- Batch processing = free-tier friendly
- scikit-learn = industry standard

## Data Flow

### Expense Creation Flow

```
User Input → Frontend Validation
    ↓
API POST /expenses
    ↓
Backend Validation (express-validator)
    ↓
Prisma ORM → Database Insert
    ↓
Response → Frontend Update
```

### ML Insight Generation Flow

```
Scheduled Trigger (Cron/GitHub Actions)
    ↓
Python Script Execution
    ↓
Database Query (Pandas)
    ↓
ML Model Processing
    ↓
Database Insert (MLInsight table)
    ↓
Frontend Retrieval (GET /api/insights)
```

### Group Expense Splitting Flow

```
User Creates Group Expense
    ↓
Backend Validates Splits Sum
    ↓
Creates GroupExpense + Splits
    ↓
Updates Balances (on-demand)
    ↓
Frontend Displays Summary
```

## Security Architecture

### Authentication
- JWT tokens stored in localStorage
- Tokens expire after 7 days
- Password hashing with bcrypt (10 rounds)

### Authorization
- All routes protected by `authenticateToken` middleware
- User can only access their own data
- Group access verified before operations

### Data Protection
- Input validation on all endpoints
- SQL injection prevention (Prisma)
- XSS protection (React auto-escaping)
- CORS configuration

## Performance Optimizations

### Frontend
- React production build
- Code splitting (React Router)
- Lazy loading for heavy components
- Optimized re-renders (useMemo, useCallback)

### Backend
- Database indexes on foreign keys
- Efficient Prisma queries
- Connection pooling
- Response caching (future enhancement)

### Database
- Indexes on frequently queried columns
- Efficient joins
- Pagination for large datasets

## Scalability Considerations

### Current Design (Free Tier)
- Single database instance
- Stateless API (can scale horizontally)
- Precomputed ML (no always-running processes)

### Future Enhancements
- Redis for caching
- CDN for static assets (Vercel provides)
- Database read replicas
- Background job queue (Bull/BullMQ)

## Deployment Architecture

### Vercel (Frontend)
- Automatic HTTPS
- Global CDN
- Automatic deployments from GitHub
- Environment variable management

### Railway (Backend + Database)
- Automatic HTTPS
- Auto-deploy from GitHub
- PostgreSQL as managed service
- Environment variable management
- Log aggregation

## Free Tier Compliance

### Constraints Respected
✅ No always-running ML processes
✅ Batch/precomputed insights only
✅ Efficient database queries
✅ Static frontend assets
✅ Stateless API design

### Resource Usage
- **Frontend**: ~5MB bundle (gzipped)
- **Backend**: ~50MB memory (idle)
- **Database**: ~100MB storage (typical)
- **ML Script**: Runs ~1 minute daily

## Monitoring & Logging

### Current
- Railway logs (backend)
- Vercel analytics (frontend)
- Browser console (development)

### Future Enhancements
- Error tracking (Sentry)
- Performance monitoring (New Relic)
- User analytics (PostHog)

## Testing Strategy

### Unit Tests
- Frontend: React Testing Library
- Backend: Jest
- ML: pytest

### Integration Tests
- API endpoint testing
- Database integration tests
- End-to-end flows

### Manual Testing
- User registration/login
- Expense CRUD operations
- Group expense splitting
- Portfolio management
- ML insights generation

## Development Workflow

1. **Local Development**
   - Frontend: `npm start` (port 3000)
   - Backend: `npm run dev` (port 5000)
   - Database: Local PostgreSQL or Railway

2. **Database Migrations**
   - `npx prisma migrate dev` (development)
   - `npx prisma migrate deploy` (production)

3. **ML Insights**
   - Run `python generate_insights.py` locally
   - Or schedule via cron/GitHub Actions

4. **Deployment**
   - Push to GitHub
   - Vercel auto-deploys frontend
   - Railway auto-deploys backend
   - Run migrations manually if needed

## Code Quality

### Standards
- ESLint for JavaScript
- Prettier for formatting (optional)
- TypeScript migration (future)

### Best Practices
- RESTful API design
- Error handling
- Input validation
- Security-first approach
- Clean code principles

---

**This architecture is designed to be:**
- ✅ Free-tier deployable
- ✅ Production-ready
- ✅ Maintainable
- ✅ Scalable
- ✅ Resume-friendly
