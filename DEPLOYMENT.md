# Deployment Guide - FinLens

This guide walks you through deploying FinLens on free tiers of Vercel (frontend) and Railway (backend + database).

## Prerequisites

- GitHub account
- Vercel account (free tier)
- Railway account (free tier with $5 credit)
- Basic understanding of environment variables

## Step 1: Prepare Your Repository

1. Push your code to GitHub
2. Ensure all environment variables are documented in `.env.example` files

## Step 2: Deploy Database (Railway)

1. Go to [Railway](https://railway.app) and sign in
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Click "Add Service" → "Database" → "PostgreSQL"
5. Railway will create a PostgreSQL database
6. Click on the PostgreSQL service → "Variables" tab
7. Copy the `DATABASE_URL` value (you'll need this for the backend)

## Step 3: Deploy Backend (Railway)

1. In the same Railway project, click "Add Service" → "GitHub Repo"
2. Select your repository again
3. In the service settings:
   - **Root Directory**: Set to `backend`
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `npm start`
4. Go to "Variables" tab and add:
   ```
   DATABASE_URL=<paste from PostgreSQL service>
   JWT_SECRET=<generate a random secure string>
   PORT=<Railway sets this automatically>
   ```
5. Go to "Settings" → "Deploy" → Enable "Auto Deploy"
6. After deployment, run migrations:
   - Click "Deployments" → "View Logs"
   - Or use Railway CLI: `railway run npx prisma migrate deploy`
7. Copy the backend URL (e.g., `https://your-app.railway.app`)

## Step 4: Deploy Frontend (Vercel)

1. Go to [Vercel](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Output Directory**: `build`
5. Add environment variable:
   ```
   REACT_APP_API_URL=<your-railway-backend-url>/api
   ```
6. Click "Deploy"
7. After deployment, Vercel will provide a URL (e.g., `https://your-app.vercel.app`)

## Step 5: Update CORS (Backend)

1. Go back to Railway backend service
2. Update `backend/src/server.js` to allow your Vercel domain:
   ```javascript
   app.use(cors({
     origin: ['http://localhost:3000', 'https://your-app.vercel.app'],
     credentials: true
   }));
   ```
3. Redeploy the backend

## Step 6: Set Up ML Insights (Optional)

### Option A: Local Cron Job
```bash
# Add to crontab (runs daily at midnight)
0 0 * * * cd /path/to/FinLens/ml && python generate_insights.py
```

### Option B: Railway Cron Job
1. In Railway, add a new service
2. Use a Dockerfile or script that runs the ML script
3. Set up a cron schedule in Railway

### Option C: GitHub Actions
Create `.github/workflows/ml-insights.yml`:
```yaml
name: Generate ML Insights
on:
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight
  workflow_dispatch:

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-python@v2
        with:
          python-version: '3.9'
      - name: Install dependencies
        run: |
          cd ml
          pip install -r requirements.txt
      - name: Generate insights
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
        run: |
          cd ml
          python generate_insights.py
```

## Step 7: Verify Deployment

1. Visit your Vercel frontend URL
2. Register a new account
3. Add some expenses
4. Check that data persists (refresh page)
5. Verify API calls work (check browser Network tab)

## Troubleshooting

### Backend Issues
- **Database connection errors**: Verify `DATABASE_URL` is correct
- **Migration errors**: Run `npx prisma migrate deploy` manually
- **CORS errors**: Update CORS settings in `server.js`

### Frontend Issues
- **API calls failing**: Verify `REACT_APP_API_URL` is set correctly
- **Build errors**: Check Node.js version (should be 18+)
- **Environment variables**: Ensure they're set in Vercel dashboard

### ML Script Issues
- **Database connection**: Ensure `DATABASE_URL` is accessible from where script runs
- **Python dependencies**: Install all packages from `requirements.txt`
- **Permission errors**: Ensure script has read/write access to database

## Free Tier Limits

### Vercel
- 100GB bandwidth/month
- Unlimited deployments
- Automatic HTTPS

### Railway
- $5 free credit/month
- PostgreSQL: ~500MB storage
- Compute: ~500 hours/month
- Auto-sleeps after inactivity (wakes on request)

### Optimization Tips
1. **Database**: Use indexes on frequently queried columns
2. **API**: Implement pagination for large datasets
3. **Frontend**: Enable React production build optimizations
4. **ML**: Run insights generation during off-peak hours

## Monitoring

### Railway
- View logs in Railway dashboard
- Set up alerts for errors
- Monitor resource usage

### Vercel
- View analytics in Vercel dashboard
- Check function logs
- Monitor build times

## Security Checklist

- [ ] JWT_SECRET is a strong random string
- [ ] DATABASE_URL is not exposed in frontend
- [ ] CORS is configured correctly
- [ ] Environment variables are set in deployment platform
- [ ] HTTPS is enabled (automatic on Vercel/Railway)
- [ ] Database has proper access controls

## Cost Estimation

**Free Tier Usage:**
- Vercel: $0/month (within limits)
- Railway: $0/month (within $5 credit)
- **Total: $0/month** ✅

**If you exceed free tiers:**
- Vercel Pro: $20/month
- Railway: Pay-as-you-go (~$5-10/month for small apps)

---

**Congratulations!** Your FinLens platform is now live on free tiers! 🎉
