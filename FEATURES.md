# FinLens Features Documentation

## Overview

FinLens is a comprehensive finance intelligence platform that helps users track expenses, split costs with groups, analyze portfolios, and gain ML-driven insights into their financial behavior.

## Core Features

### 1. Personal Expense Tracking

**Purpose**: Help users track and categorize their daily expenses to build financial awareness.

**Features**:
- Add expenses with description, amount, category, and date
- Edit and delete expenses
- Categorize expenses (Food, Transport, Shopping, Bills, Entertainment, Health, Other)
- View all expenses in a sortable table
- Filter by category (future enhancement)
- Search expenses (future enhancement)

**Why It Exists**:
- Foundation for all other features
- Enables spending pattern analysis
- Builds financial responsibility awareness
- Provides data for ML insights

**Technical Implementation**:
- RESTful API endpoints (`/api/expenses`)
- Prisma ORM for database operations
- React state management
- Real-time UI updates

---

### 2. Group Expense Splitting

**Purpose**: Enable fair expense splitting among friends, roommates, or travel companions.

**Features**:
- Create expense groups
- Add members to groups via email
- Create group expenses
- Automatic split calculation (equal by default)
- Track who paid and who owes
- View group summary with balances
- See who owes whom

**Why It Exists**:
- Solves real-world problem of shared expenses
- Prevents financial disputes
- Promotes accountability
- Makes group finances transparent

**Technical Implementation**:
- Group and GroupMember models
- GroupExpense and GroupExpenseSplit for tracking
- Balance calculation algorithm
- Real-time balance updates

**Example Use Cases**:
- Roommates splitting rent and utilities
- Friends splitting vacation costs
- Colleagues splitting lunch bills
- Family members tracking shared expenses

---

### 3. Stock Portfolio Analysis

**Purpose**: Track stock investments and monitor portfolio performance.

**Features**:
- Add stock holdings (symbol, quantity, average price)
- Update current prices (optional)
- View portfolio summary (total value, cost, gain/loss)
- Calculate individual holding gains/losses
- Delete holdings
- Percentage gain/loss display

**Why It Exists**:
- Optional feature for users with investments
- Provides portfolio overview
- Helps track investment performance
- Complements expense tracking

**Technical Implementation**:
- StockHolding model
- Portfolio summary calculation
- Gain/loss percentage formulas
- Real-time value updates (when current price provided)

**Future Enhancements**:
- Real-time price fetching (via API)
- Historical performance charts
- Dividend tracking
- Portfolio diversification analysis

---

### 4. ML-Driven Financial Insights

**Purpose**: Provide intelligent, data-driven insights into spending behavior using machine learning.

**Features**:

#### a. Spending Pattern Analysis
- Total and average spending statistics
- Monthly spending trends
- Category breakdown
- Anomaly detection (unusual expenses)
- Day-of-week spending patterns
- Top spending categories

**ML Method**: Statistical analysis (mean, median, standard deviation)
**Why This Method**: Simple, explainable, no training required

#### b. Budget Forecasting
- 3-month spending predictions
- Trend identification (increasing/decreasing)
- Model accuracy metrics
- Confidence intervals

**ML Method**: Linear Regression (scikit-learn)
**Why This Method**: Interpretable, works well with time-series data, fast

#### c. Category Trend Analysis
- Identify growing/declining categories
- Percentage change calculations
- Current vs historical averages
- Fastest growing/declining categories

**ML Method**: Comparative statistics (first half vs second half)
**Why This Method**: Simple trend detection, no complex models needed

#### d. Group Expense Summary
- Total group expenses
- Per-group breakdowns
- Balance calculations
- Expense counts

**ML Method**: SQL aggregation (not ML, but included in insights)
**Why This Method**: Efficient, database-native, no ML needed

**Why ML Insights Exist**:
- Helps users understand their spending
- Provides actionable recommendations
- Builds financial awareness
- Demonstrates ML application in finance

**Technical Implementation**:
- Python scripts with scikit-learn
- Precomputed insights stored in database
- Batch processing (not always-running)
- Explainable models

**Free-Tier Compliance**:
- ✅ Precomputed (not always-running)
- ✅ Batch processing
- ✅ Simple, efficient models
- ✅ No GPU/TPU required

---

## User Interface Features

### Dashboard
- Overview of financial health
- Quick stats (total expenses, monthly spending, groups, portfolio)
- Recent expenses list
- Quick action buttons

### Navigation
- Responsive navbar
- Active route highlighting
- User profile display
- Logout functionality

### Data Visualization
- Category spending bar charts
- Monthly spending line charts
- Portfolio gain/loss indicators
- Color-coded badges and status

### Responsive Design
- Mobile-friendly layouts
- Adaptive grids
- Touch-friendly buttons
- Optimized for all screen sizes

---

## Security Features

### Authentication
- JWT token-based authentication
- Secure password hashing (bcrypt)
- Token expiration (7 days)
- Protected routes

### Authorization
- User can only access their own data
- Group access verification
- Input validation
- SQL injection prevention (Prisma)

### Data Protection
- Environment variable management
- CORS configuration
- HTTPS in production
- Secure password storage

---

## Performance Features

### Frontend
- React production builds
- Code splitting
- Optimized re-renders
- Efficient state management

### Backend
- Database indexing
- Efficient queries
- Connection pooling
- Response caching (future)

### Database
- Optimized schema
- Foreign key constraints
- Indexes on frequently queried columns
- Efficient joins

---

## Future Enhancements (Roadmap)

### Short Term
- [ ] Expense search and filtering
- [ ] Export expenses to CSV
- [ ] Email notifications for group expenses
- [ ] Recurring expenses

### Medium Term
- [ ] Real-time stock price fetching
- [ ] Budget goals and alerts
- [ ] Expense receipt upload
- [ ] Multi-currency support

### Long Term
- [ ] Mobile app (React Native)
- [ ] Bank account integration
- [ ] Advanced ML models (clustering, classification)
- [ ] Financial goal tracking
- [ ] Investment recommendations

---

## Design Philosophy

### User Experience
- **Simplicity**: Clean, intuitive interface
- **Clarity**: Clear financial information
- **Responsibility**: Promotes financial awareness
- **Trust**: Transparent calculations

### Technical Excellence
- **Clean Code**: Maintainable, readable code
- **Best Practices**: Industry-standard patterns
- **Documentation**: Comprehensive docs
- **Testing**: Testable architecture

### Business Value
- **Problem Solving**: Addresses real financial needs
- **Scalability**: Can grow with user base
- **Cost Effective**: Free-tier deployable
- **Resume Friendly**: Modern tech stack

---

## Feature Explanations for Resume/Viva

### Why Each Feature Exists

1. **Expense Tracking**: Foundation for financial awareness and ML insights
2. **Group Splitting**: Solves real-world problem, demonstrates complex state management
3. **Portfolio Analysis**: Optional feature showing extensibility
4. **ML Insights**: Demonstrates applied ML, explainable AI, and data science skills

### How ML Adds Value

- **Spending Patterns**: Helps users understand their behavior
- **Budget Forecasting**: Enables proactive financial planning
- **Category Trends**: Identifies areas for cost optimization
- **Group Summaries**: Ensures fair expense distribution

### Free-Tier Compliance

- **Precomputed ML**: No always-running processes
- **Batch Processing**: Runs on-demand or scheduled
- **Efficient Models**: Simple, fast algorithms
- **Database-First**: Heavy lifting in SQL, not application code

---

**FinLens: Making Financial Intelligence Accessible to Everyone** 💰📊
