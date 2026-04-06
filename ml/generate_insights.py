"""
FinLens ML Insights Generator

This script generates machine learning-driven financial insights:
- Spending pattern analysis
- Budget forecasting
- Category trend analysis
- Group expense summaries

All insights are precomputed and stored in the database for efficient retrieval.
This ensures the ML models don't run continuously (free-tier friendly).
"""

import os
import sys
import json
from datetime import datetime, timedelta
from dotenv import load_dotenv
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
import psycopg2
from psycopg2.extras import RealDictCursor

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL')
if not DATABASE_URL:
    print("Error: DATABASE_URL not found in environment variables")
    sys.exit(1)

def get_db_connection():
    """Establish database connection"""
    try:
        conn = psycopg2.connect(DATABASE_URL)
        return conn
    except Exception as e:
        print(f"Error connecting to database: {e}")
        sys.exit(1)

def get_user_expenses(user_id, conn):
    """Fetch all expenses for a user"""
    query = """
        SELECT id, amount, description, category, date
        FROM "Expense"
        WHERE "userId" = %s
        ORDER BY date ASC
    """
    df = pd.read_sql_query(query, conn, params=(user_id,))
    if not df.empty:
        df['date'] = pd.to_datetime(df['date'])
    return df

def get_group_expenses(user_id, conn):
    """Fetch group expenses for a user"""
    query = """
        SELECT ge.id, ge.amount, ge.category, ge.date, g.name as group_name
        FROM "GroupExpense" ge
        JOIN "Group" g ON ge."groupId" = g.id
        WHERE g."creatorId" = %s OR EXISTS (
            SELECT 1 FROM "GroupMember" gm
            WHERE gm."groupId" = g.id AND gm."userId" = %s
        )
        ORDER BY ge.date ASC
    """
    df = pd.read_sql_query(query, conn, params=(user_id, user_id))
    if not df.empty:
        df['date'] = pd.to_datetime(df['date'])
    return df

def analyze_spending_patterns(df):
    """
    Analyze spending patterns using statistical methods
    Returns insights about spending behavior
    """
    if df.empty or len(df) < 3:
        return {
            "status": "insufficient_data",
            "message": "Need at least 3 expenses to analyze patterns"
        }

    insights = {}
    
    # Overall statistics
    insights['total_expenses'] = float(df['amount'].sum())
    insights['average_expense'] = float(df['amount'].mean())
    insights['median_expense'] = float(df['amount'].median())
    insights['total_count'] = int(len(df))
    
    # Monthly spending
    df['month'] = df['date'].dt.to_period('M')
    monthly_spending = df.groupby('month')['amount'].sum()
    insights['monthly_average'] = float(monthly_spending.mean())
    insights['monthly_trend'] = "increasing" if len(monthly_spending) > 1 and monthly_spending.iloc[-1] > monthly_spending.iloc[0] else "decreasing"
    
    # Category analysis
    category_stats = df.groupby('category')['amount'].agg(['sum', 'mean', 'count']).to_dict('index')
    insights['top_category'] = df.groupby('category')['amount'].sum().idxmax()
    insights['category_breakdown'] = {
        cat: {
            'total': float(stats['sum']),
            'average': float(stats['mean']),
            'count': int(stats['count'])
        }
        for cat, stats in category_stats.items()
    }
    
    # Anomaly detection (simple: expenses > 2 standard deviations)
    mean_amount = df['amount'].mean()
    std_amount = df['amount'].std()
    threshold = mean_amount + 2 * std_amount
    anomalies = df[df['amount'] > threshold]
    insights['anomalies'] = [
        {
            'date': row['date'].isoformat(),
            'amount': float(row['amount']),
            'description': row['description'],
            'category': row['category']
        }
        for _, row in anomalies.iterrows()
    ]
    
    # Day of week analysis
    df['day_of_week'] = df['date'].dt.day_name()
    day_stats = df.groupby('day_of_week')['amount'].sum().to_dict()
    insights['spending_by_day'] = {day: float(amount) for day, amount in day_stats.items()}
    insights['highest_spending_day'] = max(day_stats.items(), key=lambda x: x[1])[0]
    
    return insights

def forecast_budget(df, months_ahead=3):
    """
    Forecast future spending using linear regression
    """
    if df.empty or len(df) < 6:
        return {
            "status": "insufficient_data",
            "message": "Need at least 6 months of data for forecasting"
        }

    # Aggregate by month
    df['month'] = df['date'].dt.to_period('M')
    monthly = df.groupby('month')['amount'].sum().reset_index()
    monthly['month_num'] = range(len(monthly))
    
    if len(monthly) < 3:
        return {
            "status": "insufficient_data",
            "message": "Need at least 3 months of data"
        }
    
    # Prepare data for regression
    X = monthly[['month_num']].values
    y = monthly['amount'].values
    
    # Train model
    model = LinearRegression()
    model.fit(X, y)
    
    # Forecast next months
    last_month_num = monthly['month_num'].iloc[-1]
    future_months = np.array([[last_month_num + i + 1] for i in range(months_ahead)])
    forecasts = model.predict(future_months)
    
    # Calculate confidence (simple: based on R²)
    r_squared = model.score(X, y)
    
    forecast_data = []
    for i, forecast in enumerate(forecasts):
        month_date = pd.to_datetime(str(monthly['month'].iloc[-1])) + pd.DateOffset(months=i+1)
        forecast_data.append({
            'month': month_date.strftime('%Y-%m'),
            'predicted_amount': float(forecast),
            'confidence': float(r_squared * 100)  # Convert to percentage
        })
    
    return {
        "status": "success",
        "forecasts": forecast_data,
        "model_accuracy": float(r_squared * 100),
        "current_monthly_average": float(monthly['amount'].mean()),
        "trend": "increasing" if model.coef_[0] > 0 else "decreasing"
    }

def analyze_category_trends(df):
    """
    Analyze trends in spending categories over time
    """
    if df.empty or len(df) < 6:
        return {
            "status": "insufficient_data",
            "message": "Need at least 6 expenses to analyze trends"
        }

    df['month'] = df['date'].dt.to_period('M')
    
    # Get category trends
    category_trends = {}
    categories = df['category'].unique()
    
    for category in categories:
        cat_df = df[df['category'] == category]
        monthly_cat = cat_df.groupby('month')['amount'].sum()
        
        if len(monthly_cat) >= 2:
            # Simple trend: compare first half vs second half
            mid_point = len(monthly_cat) // 2
            first_half_avg = monthly_cat.iloc[:mid_point].mean()
            second_half_avg = monthly_cat.iloc[mid_point:].mean()
            
            change_percent = ((second_half_avg - first_half_avg) / first_half_avg * 100) if first_half_avg > 0 else 0
            
            category_trends[category] = {
                'current_monthly_avg': float(monthly_cat.iloc[-3:].mean()) if len(monthly_cat) >= 3 else float(monthly_cat.mean()),
                'trend': 'increasing' if change_percent > 5 else 'decreasing' if change_percent < -5 else 'stable',
                'change_percent': float(change_percent),
                'total_spent': float(cat_df['amount'].sum())
            }
    
    # Find fastest growing/declining categories
    growing = sorted(
        [(cat, data) for cat, data in category_trends.items() if data['trend'] == 'increasing'],
        key=lambda x: x[1]['change_percent'],
        reverse=True
    )
    declining = sorted(
        [(cat, data) for cat, data in category_trends.items() if data['trend'] == 'decreasing'],
        key=lambda x: x[1]['change_percent']
    )
    
    return {
        "status": "success",
        "category_trends": category_trends,
        "fastest_growing": [cat for cat, _ in growing[:3]],
        "fastest_declining": [cat for cat, _ in declining[:3]]
    }

def analyze_group_summary(user_id, conn):
    """
    Analyze group expense summaries for a user
    """
    group_expenses = get_group_expenses(user_id, conn)
    
    if group_expenses.empty:
        return {
            "status": "no_groups",
            "message": "No group expenses found"
        }
    
    # Group by group name
    group_stats = group_expenses.groupby('group_name').agg({
        'amount': ['sum', 'mean', 'count']
    }).to_dict('index')
    
    summary = {
        "status": "success",
        "total_groups": int(group_expenses['group_name'].nunique()),
        "total_group_expenses": float(group_expenses['amount'].sum()),
        "group_breakdown": {
            group: {
                'total': float(stats[('amount', 'sum')]),
                'average': float(stats[('amount', 'mean')]),
                'count': int(stats[('amount', 'count')])
            }
            for group, stats in group_stats.items()
        }
    }
    
    return summary

def save_insight(user_id, insight_type, data, conn):
    """Save insight to database"""
    cursor = conn.cursor()
    
    # Delete old insights of this type
    cursor.execute(
        'DELETE FROM "MLInsight" WHERE "userId" = %s AND type = %s',
        (user_id, insight_type)
    )
    
    # Insert new insight
    valid_until = datetime.now() + timedelta(days=7)  # Insights valid for 7 days
    
    cursor.execute(
        '''
        INSERT INTO "MLInsight" ("userId", type, data, "generatedAt", "validUntil")
        VALUES (%s, %s, %s, %s, %s)
        ''',
        (user_id, insight_type, json.dumps(data), datetime.now(), valid_until)
    )
    
    conn.commit()
    cursor.close()

def generate_insights_for_user(user_id, conn):
    """Generate all insights for a specific user"""
    print(f"\nGenerating insights for user {user_id}...")
    
    expenses_df = get_user_expenses(user_id, conn)
    
    # Spending patterns
    print("  - Analyzing spending patterns...")
    patterns = analyze_spending_patterns(expenses_df)
    save_insight(user_id, 'spending_pattern', patterns, conn)
    
    # Budget forecast
    print("  - Generating budget forecast...")
    forecast = forecast_budget(expenses_df)
    save_insight(user_id, 'budget_forecast', forecast, conn)
    
    # Category trends
    print("  - Analyzing category trends...")
    trends = analyze_category_trends(expenses_df)
    save_insight(user_id, 'category_trend', trends, conn)
    
    # Group summary
    print("  - Analyzing group expenses...")
    group_summary = analyze_group_summary(user_id, conn)
    save_insight(user_id, 'group_summary', group_summary, conn)
    
    print(f"  ✓ Insights generated for user {user_id}")

def main():
    """Main function to generate insights for all users"""
    print("FinLens ML Insights Generator")
    print("=" * 50)
    
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    # Get all users
    cursor.execute('SELECT id FROM "User"')
    users = cursor.fetchall()
    cursor.close()
    
    if not users:
        print("No users found in database")
        conn.close()
        return
    
    print(f"Found {len(users)} users")
    
    # Generate insights for each user
    for user in users:
        try:
            generate_insights_for_user(user['id'], conn)
        except Exception as e:
            print(f"  ✗ Error generating insights for user {user['id']}: {e}")
    
    conn.close()
    print("\n" + "=" * 50)
    print("Insight generation complete!")

if __name__ == '__main__':
    main()
