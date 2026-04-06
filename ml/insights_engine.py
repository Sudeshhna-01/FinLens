"""
Ledgerly Human-Readable Insights Engine

Converts raw analytics + ML outputs into meaningful, explainable insights.
Rule-based logic with ML-output-driven processing only.
"""

import os
import sys
import json
import uuid
from datetime import datetime, timedelta
from typing import Optional
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

class InsightsEngine:
    """
    Human-readable insights engine using rule-based logic and ML outputs.
    Converts analytics data into natural language insights.
    """
    
    def __init__(self):
        self.insight_templates = {
            'spending_behavior': {
                'high_frequency': {
                    'trigger': 'daily_avg_expenses > 5',
                    'message': "You're making {count} transactions daily, which is {level} than your average.",
                    'awareness': "This indicates active spending habits - consider tracking categories."
                },
                'category_dominance': {
                    'trigger': 'top_category_percentage > 40',
                    'message': "{category} accounts for {percentage}% of your spending this month.",
                    'awareness': "Category concentration can impact budget flexibility."
                },
                'weekend_spike': {
                    'trigger': 'weekend_spending > weekday_avg * 1.5',
                    'message': "Your weekend spending is {percentage}% higher than weekdays.",
                    'awareness': "Weekend patterns often reveal discretionary spending trends."
                }
            },
            'overspending': {
                'budget_exceeded': {
                    'trigger': 'monthly_spent > monthly_budget',
                    'message': "This month you spent ${overspend} more than your typical month (~${typical}/month).",
                    'awareness': "Spending above your norm may be temporary — check the categories driving the increase."
                },
                'category_overspend': {
                    'trigger': 'category_spent > category_budget * 1.2',
                    'message': "{category} spending is ${overspend} over typical levels.",
                    'awareness': "Category-specific monitoring prevents budget creep."
                },
                'rapid_increase': {
                    'trigger': 'monthly_increase > 30',
                    'message': "Spending increased {percentage}% compared to last month.",
                    'awareness': "Sudden increases often reflect lifestyle changes or emergencies."
                }
            },
            'group_accountability': {
                'settlement_delay': {
                    'trigger': 'predicted_delay > 7',
                    'message': "Group expense '{group}' may take {days} days to settle.",
                    'awareness': "Longer settlement times affect group cash flow dynamics."
                },
                'multiple_pending': {
                    'trigger': 'pending_settlements > 3',
                    'message': "You have {count} pending group settlements totaling ${amount}.",
                    'awareness': "Multiple pending settlements can create payment complexity."
                },
                'high_risk_groups': {
                    'trigger': 'high_risk_groups > 1',
                    'message': "{count} of your groups have high settlement risk.",
                    'awareness': "High-risk groups may benefit from clearer payment agreements."
                }
            },
            'spending_vs_investing': {
                'consumption_heavy': {
                    'trigger': 'spending_ratio > 0.8',
                    'message': "{percentage}% of your money goes to spending vs investing.",
                    'awareness': "Balance between consumption and investment affects long-term wealth."
                },
                'investment_light': {
                    'trigger': 'investment_ratio < 0.1',
                    'message': "Only {percentage}% of your money is invested for growth.",
                    'awareness': "Investment allocation supports future financial goals."
                }
            },
            'forecast_and_trends': {
                'spending_projection': {
                    'trigger': 'rolling_monthly_avg',
                    'message': "Your last few months average about ${avg_monthly:.0f}/month; next month may land near ${forecast:.0f} if the pattern holds.",
                    'awareness': "Forecasts follow your history — big one-off expenses will skew this."
                },
                'savings_momentum': {
                    'trigger': 'last7_vs_prev7',
                    'message': "Last 7 days you spent ${last7:.0f} vs ${prev7:.0f} the prior week — about {pct:.0f}% less.",
                    'awareness': "Momentum matters: consider steering the difference toward savings or debt paydown."
                },
                'large_ticket_habit': {
                    'trigger': 'avg_expense_above_threshold',
                    'message': "Your typical expense is around ${avg_txn:.0f}, which is higher than your own usual spend per transaction.",
                    'awareness': "Breaking large purchases into planned line items can make trends easier to spot."
                }
            }
        }
    
    def get_user_analytics(self, user_id, conn):
        """Get comprehensive analytics for a user"""
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Personal spending analytics
        cursor.execute('''
            SELECT 
                COUNT(*) as total_expenses,
                COALESCE(SUM(amount), 0) as total_spent,
                COALESCE(AVG(amount), 0) as avg_expense,
                DATE_TRUNC('month', date) as month
            FROM "Expense"
            WHERE "userId" = %s
            AND date >= NOW() - INTERVAL '90 days'
            GROUP BY DATE_TRUNC('month', date)
            ORDER BY month DESC
            LIMIT 3
        ''', (user_id,))
        
        monthly_data = cursor.fetchall()
        
        # Category breakdown
        cursor.execute('''
            SELECT 
                category,
                COUNT(*) as count,
                SUM(amount) as total
            FROM "Expense"
            WHERE "userId" = %s
            AND date >= NOW() - INTERVAL '30 days'
            GROUP BY category
            ORDER BY total DESC
        ''', (user_id,))
        
        category_data = cursor.fetchall()
        
        # Weekend vs weekday spending
        cursor.execute('''
            SELECT 
                CASE WHEN EXTRACT(DOW FROM date) IN (0, 6) THEN 'weekend' ELSE 'weekday' END as day_type,
                AVG(amount) as avg_amount,
                COUNT(*) as transaction_count
            FROM "Expense"
            WHERE "userId" = %s
            AND date >= NOW() - INTERVAL '30 days'
            GROUP BY day_type
        ''', (user_id,))
        
        day_patterns = cursor.fetchall()
        
        # Group expense analytics (splits reference GroupMember via groupMemberId)
        cursor.execute('''
            SELECT 
                COUNT(DISTINCT ge.id) as total_group_expenses,
                COALESCE(SUM(ge.amount), 0) as total_group_spent,
                COUNT(CASE WHEN ges."isPaid" = false THEN 1 END) as pending_settlements,
                COALESCE(SUM(CASE WHEN ges."isPaid" = false THEN ges.amount ELSE 0 END), 0) as pending_amount
            FROM "GroupExpense" ge
            JOIN "Group" g ON ge."groupId" = g.id
            JOIN "GroupMember" gm ON g.id = gm."groupId" AND gm."userId" = %s
            LEFT JOIN "GroupExpenseSplit" ges ON ge.id = ges."groupExpenseId"
                AND EXISTS (
                    SELECT 1 FROM "GroupMember" gm_s
                    WHERE gm_s.id = ges."groupMemberId" AND gm_s."userId" = %s
                )
            WHERE ge.date >= NOW() - INTERVAL '30 days'
        ''', (user_id, user_id))
        
        group_data = cursor.fetchone()
        
        # ML predictions (settlement delays)
        cursor.execute('''
            SELECT data, "generatedAt"
            FROM "MLInsight"
            WHERE "userId" = %s
            AND type = 'settlement_prediction'
            AND "validUntil" > NOW()
            ORDER BY "generatedAt" DESC
            LIMIT 5
        ''', (user_id,))
        
        ml_predictions = cursor.fetchall()
        
        # Portfolio data (if available) — use saved mark price or cost basis
        cursor.execute('''
            SELECT 
                COUNT(*) as holdings_count,
                COALESCE(SUM(quantity * COALESCE("currentPrice", "avgPrice")), 0) as total_value
            FROM "StockHolding"
            WHERE "userId" = %s
        ''', (user_id,))
        
        portfolio_data = cursor.fetchone()

        # Rolling windows for momentum insights
        cursor.execute('''
            SELECT 
                COALESCE(SUM(CASE WHEN date >= NOW() - INTERVAL '7 days' THEN amount ELSE 0 END), 0) as last7,
                COALESCE(SUM(CASE WHEN date >= NOW() - INTERVAL '14 days' AND date < NOW() - INTERVAL '7 days' THEN amount ELSE 0 END), 0) as prev7,
                COALESCE(AVG(amount), 0) as avg_txn_30d
            FROM "Expense"
            WHERE "userId" = %s
            AND date >= NOW() - INTERVAL '30 days'
        ''', (user_id,))
        
        spending_windows = cursor.fetchone()
        
        cursor.close()
        
        return {
            'monthly_data': monthly_data,
            'category_data': category_data,
            'day_patterns': day_patterns,
            'group_data': group_data,
            'ml_predictions': ml_predictions,
            'portfolio_data': portfolio_data,
            'spending_windows': spending_windows
        }
    
    def evaluate_insight_conditions(self, analytics, user_id):
        """Evaluate all insight conditions against analytics data"""
        insights = []
        
        # Spending behavior insights
        insights.extend(self._evaluate_spending_behavior(analytics, user_id))
        
        # Overspending insights
        insights.extend(self._evaluate_overspending(analytics, user_id))
        
        # Group accountability insights
        insights.extend(self._evaluate_group_accountability(analytics, user_id))
        
        # Spending vs investing insights
        insights.extend(self._evaluate_spending_vs_investing(analytics, user_id))

        # Forecasts & trends
        insights.extend(self._evaluate_forecast_and_trends(analytics, user_id))
        
        return insights
    
    def _evaluate_spending_behavior(self, analytics, user_id):
        """Generate spending behavior insights"""
        insights = []
        
        if not analytics['monthly_data']:
            return insights
        
        current_month = analytics['monthly_data'][0]
        daily_avg = current_month['total_expenses'] / 30
        
        # High frequency spending
        if daily_avg > 5:
            level = "much higher" if daily_avg > 10 else "higher"
            insights.append(self._create_insight(
                'spending_behavior',
                'high_frequency',
                {
                    'count': round(daily_avg, 1),
                    'level': level
                },
                user_id
            ))
        
        # Category dominance
        if analytics['category_data']:
            top_category = analytics['category_data'][0]
            total_spent = sum(cat['total'] for cat in analytics['category_data'])
            top_percentage = (top_category['total'] / total_spent) * 100 if total_spent > 0 else 0
            
            if top_percentage > 40:
                insights.append(self._create_insight(
                    'spending_behavior',
                    'category_dominance',
                    {
                        'category': top_category['category'],
                        'percentage': round(top_percentage, 1)
                    },
                    user_id
                ))
        
        # Weekend spending spike
        weekend_data = [d for d in analytics['day_patterns'] if d['day_type'] == 'weekend']
        weekday_data = [d for d in analytics['day_patterns'] if d['day_type'] == 'weekday']
        
        if weekend_data and weekday_data:
            weekend_avg = weekend_data[0]['avg_amount']
            weekday_avg = weekday_data[0]['avg_amount']
            
            if weekend_avg > weekday_avg * 1.5:
                percentage = round(((weekend_avg / weekday_avg) - 1) * 100, 0)
                insights.append(self._create_insight(
                    'spending_behavior',
                    'weekend_spike',
                    {
                        'percentage': percentage
                    },
                    user_id
                ))
        
        return insights
    
    def _evaluate_overspending(self, analytics, user_id):
        """Generate overspending insights"""
        insights = []
        
        if not analytics['monthly_data']:
            return insights
        
        current_month = analytics['monthly_data'][0]

        # Use user's own history as a baseline (no hardcoded budgets).
        # Consider "typical" as the average monthly spend across the last available months.
        monthly_totals = [float(m.get('total_spent') or 0) for m in analytics['monthly_data'] if m]
        typical_month = sum(monthly_totals) / len(monthly_totals) if monthly_totals else 0

        if typical_month > 0 and current_month['total_spent'] > typical_month * 1.2:
            overspend = current_month['total_spent'] - typical_month
            insights.append(self._create_insight(
                'overspending',
                'budget_exceeded',
                {
                    'overspend': round(overspend, 2),
                    'typical': round(typical_month, 2)
                },
                user_id
            ))
        
        # Monthly increase check
        if len(analytics['monthly_data']) >= 2:
            current = analytics['monthly_data'][0]['total_spent']
            previous = analytics['monthly_data'][1]['total_spent']
            
            if previous > 0:
                increase = ((current - previous) / previous) * 100
                if increase > 30:
                    insights.append(self._create_insight(
                        'overspending',
                        'rapid_increase',
                        {
                            'percentage': round(increase, 0)
                        },
                        user_id
                    ))
        
        return insights
    
    def _evaluate_group_accountability(self, analytics, user_id):
        """Generate group accountability insights"""
        insights = []
        
        if not analytics['ml_predictions']:
            return insights
        
        # Check settlement delay predictions
        for prediction in analytics['ml_predictions']:
            pred_data = json.loads(prediction['data']) if isinstance(prediction['data'], str) else prediction['data']
            
            if pred_data.get('predicted_days', 0) > 7:
                insights.append(self._create_insight(
                    'group_accountability',
                    'settlement_delay',
                    {
                        'group': pred_data.get('group_name', 'Unknown group'),
                        'days': pred_data.get('predicted_days', 0)
                    },
                    user_id
                ))
        
        # Multiple pending settlements
        if analytics['group_data'] and analytics['group_data']['pending_settlements'] > 3:
            insights.append(self._create_insight(
                'group_accountability',
                'multiple_pending',
                {
                    'count': analytics['group_data']['pending_settlements'],
                    'amount': round(analytics['group_data']['pending_amount'], 2)
                },
                user_id
            ))
        
        return insights
    
    def _evaluate_spending_vs_investing(self, analytics, user_id):
        """Generate spending vs investing insights"""
        insights = []
        
        pd = analytics.get('portfolio_data') or {}
        if not pd.get('holdings_count'):
            return insights
        
        current_month = analytics['monthly_data'][0] if analytics['monthly_data'] else {'total_spent': 0}
        portfolio_value = float(pd.get('total_value') or 0)
        monthly_spending = current_month['total_spent']
        
        total_financial_activity = monthly_spending + portfolio_value
        
        if total_financial_activity > 0:
            spending_ratio = monthly_spending / total_financial_activity
            investment_ratio = portfolio_value / total_financial_activity
            
            # Consumption-heavy pattern
            if spending_ratio > 0.8:
                insights.append(self._create_insight(
                    'spending_vs_investing',
                    'consumption_heavy',
                    {
                        'percentage': round(spending_ratio * 100, 1)
                    },
                    user_id
                ))
            
            # Investment-light pattern
            elif investment_ratio < 0.1:
                insights.append(self._create_insight(
                    'spending_vs_investing',
                    'investment_light',
                    {
                        'percentage': round(investment_ratio * 100, 1)
                    },
                    user_id
                ))
        
        return insights

    def _evaluate_forecast_and_trends(self, analytics, user_id):
        """Rolling spend forecast, week-over-week momentum, large-ticket signal."""
        insights = []
        monthly = analytics.get('monthly_data') or []
        sw = analytics.get('spending_windows')

        if len(monthly) >= 2:
            amounts = [float(m['total_spent']) for m in monthly[:3]]
            avg_monthly = sum(amounts) / len(amounts)
            forecast = avg_monthly
            insights.append(self._create_insight(
                'forecast_and_trends',
                'spending_projection',
                {
                    'avg_monthly': round(avg_monthly, 2),
                    'forecast': round(forecast, 2)
                },
                user_id
            ))

        if sw and sw.get('prev7', 0) and sw['prev7'] > 0:
            last7 = float(sw['last7'] or 0)
            prev7 = float(sw['prev7'] or 0)
            if last7 < prev7 * 0.92:
                pct = (1.0 - last7 / prev7) * 100.0
                insights.append(self._create_insight(
                    'forecast_and_trends',
                    'savings_momentum',
                    {
                        'last7': round(last7, 2),
                        'prev7': round(prev7, 2),
                        'pct': round(pct, 0)
                    },
                    user_id
                ))

        if sw and float(sw.get('avg_txn_30d') or 0) > 75:
            insights.append(self._create_insight(
                'forecast_and_trends',
                'large_ticket_habit',
                {
                    'avg_txn': round(float(sw['avg_txn_30d']), 2)
                },
                user_id
            ))

        return insights
    
    def _create_insight(self, category, insight_type, variables, user_id):
        """Create a structured insight from template"""
        template = self.insight_templates[category][insight_type]
        
        # Format message with variables
        message = template['message'].format(**variables)
        awareness = template['awareness']
        
        return {
            'id': f"insight_{uuid.uuid4().hex[:8]}",
            'category': category,
            'type': insight_type,
            'trigger': template['trigger'],
            'message': message,
            'awareness': awareness,
            'variables': variables,
            'user_id': user_id,
            'generated_at': datetime.now().isoformat(),
            'priority': self._calculate_priority(category, insight_type)
        }
    
    def _calculate_priority(self, category, insight_type):
        """Calculate insight priority for sorting"""
        priority_map = {
            'overspending': 3,
            'group_accountability': 2,
            'forecast_and_trends': 2,
            'spending_behavior': 1,
            'spending_vs_investing': 1
        }
        
        return priority_map.get(category, 1)
    
    def generate_insights_for_user(self, user_id, conn):
        """Generate all insights for a specific user"""
        print(f"\nGenerating insights for user {user_id}...")
        
        # Get analytics data
        analytics = self.get_user_analytics(user_id, conn)
        
        # Evaluate all insight conditions
        insights = self.evaluate_insight_conditions(analytics, user_id)
        
        # Sort by priority
        insights.sort(key=lambda x: x['priority'], reverse=True)
        
        print(f"  ✓ Generated {len(insights)} insights")
        return insights

def save_insights(insights, conn):
    """Save insights to database"""
    cursor = conn.cursor()
    
    for insight in insights:
        cursor.execute('''
            INSERT INTO "MLInsight" (id, "userId", type, data, "generatedAt", "validUntil")
            VALUES (%s, %s, %s, %s, %s, %s)
        ''', (
            insight['id'],
            insight['user_id'],
            'human_insight',
            json.dumps(insight),
            datetime.now(),
            datetime.now() + timedelta(days=7)  # Valid for 7 days
        ))
    
    conn.commit()
    cursor.close()

def main(user_id: Optional[str] = None):
    """Main function to generate insights.

    If user_id is provided, only that user's insights are refreshed.
    Otherwise, all users are processed (cron / admin run).
    """
    print("Ledgerly Human-Readable Insights Engine")
    print("=" * 50)

    conn = get_db_connection()

    purge = conn.cursor()
    if user_id:
        purge.execute(
            'DELETE FROM "MLInsight" WHERE "userId" = %s AND type = %s',
            (user_id, 'human_insight'),
        )
    else:
        purge.execute('DELETE FROM "MLInsight" WHERE type = %s', ('human_insight',))
    purge.close()
    conn.commit()

    cursor = conn.cursor(cursor_factory=RealDictCursor)

    if user_id:
        users = [{'id': user_id}]
    else:
        cursor.execute('SELECT id FROM "User"')
        users = cursor.fetchall()
    cursor.close()

    if not users:
        print("No users found in database")
        conn.close()
        return

    print(f"Found {len(users)} user(s)")

    engine = InsightsEngine()
    all_insights = []

    for user in users:
        try:
            user_insights = engine.generate_insights_for_user(user['id'], conn)
            all_insights.extend(user_insights)
        except Exception as e:
            print(f"  ✗ Error generating insights for user {user['id']}: {e}")

    if all_insights:
        save_insights(all_insights, conn)
        print(f"\n✓ Generated and saved {len(all_insights)} total insights")
    else:
        print("\n✗ No insights generated")

    conn.close()
    print("\n" + "=" * 50)
    print("Insights generation complete!")


if __name__ == '__main__':
    import argparse

    parser = argparse.ArgumentParser(description='Generate human-readable ML insights.')
    parser.add_argument('--user', dest='user_id', help='User ID to refresh (optional)')
    args = parser.parse_args()
    main(user_id=args.user_id)
