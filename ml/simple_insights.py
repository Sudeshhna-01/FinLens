"""
Simplified FinLens ML Insights Generator (without pandas/scikit-learn)

This script generates basic financial insights using SQL queries and simple calculations.
"""

import os
import sys
import json
import uuid
from datetime import datetime, timedelta
from dotenv import load_dotenv
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

def analyze_spending_patterns_simple(user_id, conn):
    """Simple spending pattern analysis using SQL"""
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    # Basic statistics
    cursor.execute('''
        SELECT 
            COUNT(*) as total_count,
            COALESCE(SUM(amount), 0) as total_spent,
            COALESCE(AVG(amount), 0) as average_expense,
            COALESCE(MIN(amount), 0) as min_expense,
            COALESCE(MAX(amount), 0) as max_expense
        FROM "Expense" 
        WHERE "userId" = %s
    ''', (user_id,))
    
    stats = cursor.fetchone()
    
    # Category breakdown
    cursor.execute('''
        SELECT 
            category,
            COUNT(*) as count,
            SUM(amount) as total,
            AVG(amount) as average
        FROM "Expense" 
        WHERE "userId" = %s
        GROUP BY category
        ORDER BY total DESC
    ''', (user_id,))
    
    categories = cursor.fetchall()
    
    # Monthly spending
    cursor.execute('''
        SELECT 
            DATE_TRUNC('month', date) as month,
            SUM(amount) as monthly_total
        FROM "Expense" 
        WHERE "userId" = %s
        GROUP BY DATE_TRUNC('month', date)
        ORDER BY month DESC
        LIMIT 6
    ''', (user_id,))
    
    monthly = cursor.fetchall()
    cursor.close()
    
    if stats['total_count'] == 0:
        return {
            "status": "no_data",
            "message": "No expenses found for this user"
        }
    
    return {
        "status": "success",
        "total_expenses": float(stats['total_spent']),
        "average_expense": float(stats['average_expense']),
        "total_count": int(stats['total_count']),
        "min_expense": float(stats['min_expense']),
        "max_expense": float(stats['max_expense']),
        "category_breakdown": {
            cat['category']: {
                'count': int(cat['count']),
                'total': float(cat['total']),
                'average': float(cat['average'])
            } for cat in categories
        },
        "monthly_spending": [
            {
                'month': str(cat['month']),
                'total': float(cat['monthly_total'])
            } for cat in monthly
        ],
        "top_category": categories[0]['category'] if categories else None
    }

def save_insight(user_id, insight_type, data, conn):
    """Save insight to database"""
    cursor = conn.cursor()
    
    # Delete old insights of this type
    cursor.execute(
        'DELETE FROM "MLInsight" WHERE "userId" = %s AND type = %s',
        (user_id, insight_type)
    )
    
    # Insert new insight
    valid_until = datetime.now() + timedelta(days=7)
    insight_id = f"ml_{uuid.uuid4().hex[:12]}"  # Generate simple ID
    
    cursor.execute(
        '''
        INSERT INTO "MLInsight" (id, "userId", type, data, "generatedAt", "validUntil")
        VALUES (%s, %s, %s, %s, %s, %s)
        ''',
        (insight_id, user_id, insight_type, json.dumps(data), datetime.now(), valid_until)
    )
    
    conn.commit()
    cursor.close()

def generate_insights_for_user(user_id, conn):
    """Generate insights for a specific user"""
    print(f"\nGenerating insights for user {user_id}...")
    
    # Simple spending patterns
    print("  - Analyzing spending patterns...")
    patterns = analyze_spending_patterns_simple(user_id, conn)
    save_insight(user_id, 'spending_pattern', patterns, conn)
    
    print(f"  ✓ Insights generated for user {user_id}")

def main():
    """Main function to generate insights for all users"""
    print("FinLens Simple ML Insights Generator")
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
