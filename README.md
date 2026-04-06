# FinLens - Unified Finance Intelligence Platform

A comprehensive full-stack finance management platform that combines personal expense tracking, group expense splitting, machine learning-driven insights, and stock portfolio analysis.

## 🎯 Features

### Core Functionality
- **Personal Expense Tracking**: Track and categorize your daily expenses
- **Group Expense Splitting**: Create groups, add members, and split expenses fairly
- **Stock Portfolio Analysis**: Track your stock holdings and monitor gains/losses
- **ML-Driven Insights**: Precomputed financial insights using scikit-learn

### ML Insights Include:
- **Spending Patterns**: Statistical analysis of spending behavior, anomalies, and trends
- **Budget Forecasting**: Linear regression-based predictions for future spending
- **Category Trends**: Identify growing/declining spending categories
- **Group Summaries**: Analyze group expense patterns and balances

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- React 18
- JavaScript (ES6+)
- Modern CSS (no frameworks)
- Recharts for data visualization
- React Router for navigation

**Backend:**
- Node.js with Express.js
- Prisma ORM
- PostgreSQL database
- JWT authentication
- RESTful API design

**ML & Analytics:**
- Python 3.x
- Pandas for data manipulation
- NumPy for numerical operations
- scikit-learn for ML models
- Matplotlib for visualization (optional)

### Why This Architecture?

1. **Free-Tier Friendly**: All components designed for free-tier deployment
2. **Precomputed ML**: Insights generated on-demand, not continuously running
3. **Explainable ML**: Simple, interpretable models (linear regression, statistical analysis)
4. **SQL-Driven**: Heavy lifting done by database queries, not application code
5. **Modern UI**: Clean, animated CSS without framework dependencies

## 📁 Project Structure

```
FinLens/
├── frontend/          # React application
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── context/      # React context (Auth)
│   │   └── App.js        # Main app component
│   └── public/
├── backend/           # Express API server
│   ├── src/
│   │   ├── routes/       # API route handlers
│   │   ├── middleware/   # Auth middleware
│   │   └── server.js     # Express server
│   └── prisma/
│       └── schema.prisma # Database schema
├── ml/                # Python ML scripts
│   ├── generate_insights.py
│   └── requirements.txt
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- PostgreSQL database (local or Railway)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd FinLens
```

2. **Install dependencies**
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Install ML dependencies
cd ../ml
pip install -r requirements.txt
```

3. **Set up environment variables**

**Backend** (`backend/.env`):
```env
DATABASE_URL="postgresql://user:password@localhost:5432/finlens?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
PORT=5000
```

**Frontend** (`frontend/.env`):
```env
REACT_APP_API_URL="http://localhost:5000/api"
```

**ML** (`ml/.env`):
```env
DATABASE_URL="postgresql://user:password@localhost:5432/finlens?schema=public"
```

4. **Set up database**
```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

5. **Run the application**

**Development mode (all services):**
```bash
# From root directory
npm run dev
```

**Or run separately:**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

6. **Generate ML insights** (optional)
```bash
cd ml
python generate_insights.py
```

## 🌐 Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Connect repository to Vercel
3. Set build command: `cd frontend && npm install && npm run build`
4. Set output directory: `frontend/build`
5. Add environment variable: `REACT_APP_API_URL` (your backend URL)

### Backend (Railway)

1. Create new Railway project
2. Connect GitHub repository
3. Set root directory to `backend`
4. Add PostgreSQL service
5. Set environment variables:
   - `DATABASE_URL` (from PostgreSQL service)
   - `JWT_SECRET` (generate a secure random string)
   - `PORT` (Railway will set this automatically)
6. Deploy

### Database (Railway)

Railway provides PostgreSQL as a service. After creating the database:
1. Copy the connection string
2. Update `DATABASE_URL` in backend environment variables
3. Run migrations: `npx prisma migrate deploy` (in Railway console or locally)

### ML Scripts (Optional - Local or Railway Cron)

The ML scripts can be run:
- **Locally**: As a scheduled task (cron job)
- **Railway**: As a one-off service or cron job
- **GitHub Actions**: Scheduled workflow

Example Railway cron job:
```json
{
  "cronSchedule": "0 0 * * *",
  "command": "cd ml && pip install -r requirements.txt && python generate_insights.py"
}
```

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS configuration
- Environment variable protection

## 📊 Database Schema

Key models:
- **User**: User accounts and authentication
- **Expense**: Personal expenses
- **Group**: Expense groups
- **GroupExpense**: Shared expenses
- **GroupExpenseSplit**: Individual splits
- **StockHolding**: Portfolio holdings
- **MLInsight**: Precomputed ML insights

## 🧠 ML Models Explained

### Spending Pattern Analysis
- **Method**: Statistical analysis (mean, median, standard deviation)
- **Output**: Spending trends, anomalies, category breakdowns
- **Why**: Simple, explainable, no training required

### Budget Forecasting
- **Method**: Linear Regression (scikit-learn)
- **Output**: 3-month spending predictions
- **Why**: Interpretable, works well with time-series data

### Category Trend Analysis
- **Method**: Comparative statistics (first half vs second half)
- **Output**: Growing/declining categories
- **Why**: Simple trend detection without complex models

### Group Summary
- **Method**: Aggregation and balance calculations
- **Output**: Group expense summaries and who owes whom
- **Why**: SQL-driven, efficient, no ML needed

## 🎨 Design Philosophy

- **Minimal but Premium**: Clean UI with smooth animations
- **Financial Responsibility**: Visual cues for spending awareness
- **Product Thinking**: Features solve real problems
- **Resume Friendly**: Modern tech stack, clean code

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Expenses
- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `GET /api/expenses/stats/category` - Category statistics
- `GET /api/expenses/stats/monthly` - Monthly statistics

### Groups
- `GET /api/groups` - Get all groups
- `POST /api/groups` - Create group
- `POST /api/groups/:id/members` - Add member
- `POST /api/groups/:id/expenses` - Create group expense
- `GET /api/groups/:id/expenses` - Get group expenses
- `GET /api/groups/:id/summary` - Get group summary

### Portfolio
- `GET /api/portfolio` - Get portfolio
- `POST /api/portfolio` - Add/update holding
- `DELETE /api/portfolio/:symbol` - Delete holding

### Insights
- `GET /api/insights` - Get all insights
- `GET /api/insights/:type` - Get insight by type

## 🛠️ Development

### Running Tests
```bash
# Frontend tests
cd frontend
npm test

# Backend (add test framework as needed)
cd backend
npm test
```

### Database Migrations
```bash
cd backend
npx prisma migrate dev --name <migration-name>
npx prisma studio  # GUI for database
```

## 📄 License

This project is open source and available for educational purposes.

## 🤝 Contributing

This is a portfolio project. Feel free to fork and modify for your own use.

## 📧 Contact

For questions or feedback, please open an issue in the repository.

---

**Built with ❤️ for financial intelligence and responsibility**
