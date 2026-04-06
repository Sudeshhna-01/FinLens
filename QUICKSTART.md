# Quick Start Guide - FinLens

Get FinLens running locally in 5 minutes!

## Prerequisites Check

```bash
# Check Node.js version (should be 18+)
node --version

# Check Python version (should be 3.8+)
python --version

# Check if PostgreSQL is accessible
# (You can use Railway's free PostgreSQL or local instance)
```

## Quick Setup (5 Steps)

### 1. Install Dependencies

```bash
# From project root
npm run install:all
```

Or manually:
```bash
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
cd ml && pip install -r requirements.txt && cd ..
```

### 2. Set Up Database

**Option A: Railway PostgreSQL (Recommended)**
1. Go to [railway.app](https://railway.app)
2. Create new project → Add PostgreSQL
3. Copy the `DATABASE_URL`

**Option B: Local PostgreSQL**
```bash
# Create database
createdb finlens
```

### 3. Configure Environment Variables

**Backend** (`backend/.env`):
```env
DATABASE_URL="postgresql://user:password@localhost:5432/finlens?schema=public"
JWT_SECRET="your-random-secret-key-here"
PORT=5000
FRONTEND_URL="http://localhost:3000"
```

**Frontend** (`frontend/.env`):
```env
REACT_APP_API_URL="http://localhost:5000/api"
```

**ML** (`ml/.env`):
```env
DATABASE_URL="postgresql://user:password@localhost:5432/finlens?schema=public"
```

### 4. Initialize Database

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

### 5. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

**Terminal 3 - ML Insights (Optional):**
```bash
cd ml
python generate_insights.py
```

## Verify It Works

1. Open [http://localhost:3000](http://localhost:3000)
2. Register a new account
3. Add an expense
4. Check the dashboard

## Common Issues

### Database Connection Error
- Verify `DATABASE_URL` is correct
- Ensure PostgreSQL is running
- Check firewall/network settings

### Port Already in Use
- Change `PORT` in `backend/.env`
- Update `REACT_APP_API_URL` in `frontend/.env`

### Prisma Errors
- Run `npx prisma generate` again
- Check database connection
- Verify schema is correct

### ML Script Errors
- Install Python dependencies: `pip install -r requirements.txt`
- Verify `DATABASE_URL` in `ml/.env`
- Check Python version (3.8+)

## Next Steps

- Read [README.md](README.md) for full documentation
- Check [ARCHITECTURE.md](ARCHITECTURE.md) for system design
- See [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment

## Development Tips

### Database Management
```bash
# View database in browser
cd backend
npx prisma studio
```

### Generate ML Insights
```bash
cd ml
python generate_insights.py
```

### Run All Services
```bash
# From root (requires concurrently)
npm run dev
```

---

**Happy coding! 🚀**
