"""
Demo script for Ledgerly Human-Readable Insights Engine
Shows example insights and explains the logic flow.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from insights_engine import InsightsEngine
import json

def demo_insights_engine():
    """Demonstrate the insights engine with sample data"""
    
    print("🧠 Ledgerly Human-Readable Insights Engine Demo")
    print("=" * 60)
    
    engine = InsightsEngine()
    
    # Sample analytics data for different user scenarios
    sample_scenarios = [
        {
            'name': 'High Spender with Group Issues',
            'user_id': 'demo_user_1',
            'analytics': {
                'monthly_data': [
                    {'total_expenses': 45, 'total_spent': 2500, 'avg_expense': 55.6}
                ],
                'category_data': [
                    {'category': 'Food', 'count': 20, 'total': 1200},
                    {'category': 'Entertainment', 'count': 15, 'total': 800},
                    {'category': 'Shopping', 'count': 10, 'total': 500}
                ],
                'day_patterns': [
                    {'day_type': 'weekend', 'avg_amount': 85, 'transaction_count': 25},
                    {'day_type': 'weekday', 'avg_amount': 35, 'transaction_count': 20}
                ],
                'group_data': {
                    'total_group_expenses': 5,
                    'total_group_spent': 800,
                    'pending_settlements': 4,
                    'pending_amount': 350
                },
                'ml_predictions': [
                    {
                        'data': {
                            'group_name': 'Weekend Party',
                            'predicted_days': 12.4,
                            'risk_level': 'Very High'
                        }
                    }
                ],
                'portfolio_data': {
                    'holdings_count': 0,
                    'total_value': 0
                }
            }
        },
        {
            'name': 'Balanced User with Investments',
            'user_id': 'demo_user_2',
            'analytics': {
                'monthly_data': [
                    {'total_expenses': 15, 'total_spent': 1200, 'avg_expense': 80}
                ],
                'category_data': [
                    {'category': 'Food', 'count': 8, 'total': 400},
                    {'category': 'Transport', 'count': 4, 'total': 200},
                    {'category': 'Utilities', 'count': 3, 'total': 600}
                ],
                'day_patterns': [
                    {'day_type': 'weekend', 'avg_amount': 45, 'transaction_count': 6},
                    {'day_type': 'weekday', 'avg_amount': 55, 'transaction_count': 9}
                ],
                'group_data': {
                    'total_group_expenses': 2,
                    'total_group_spent': 150,
                    'pending_settlements': 1,
                    'pending_amount': 75
                },
                'ml_predictions': [],
                'portfolio_data': {
                    'holdings_count': 5,
                    'total_value': 15000
                }
            }
        },
        {
            'name': 'New User with Limited History',
            'user_id': 'demo_user_3',
            'analytics': {
                'monthly_data': [
                    {'total_expenses': 8, 'total_spent': 450, 'avg_expense': 56.25}
                ],
                'category_data': [
                    {'category': 'Food', 'count': 6, 'total': 300},
                    {'category': 'Transport', 'count': 2, 'total': 150}
                ],
                'day_patterns': [
                    {'day_type': 'weekend', 'avg_amount': 65, 'transaction_count': 5},
                    {'day_type': 'weekday', 'avg_amount': 40, 'transaction_count': 3}
                ],
                'group_data': None,
                'ml_predictions': [],
                'portfolio_data': {
                    'holdings_count': 1,
                    'total_value': 500
                }
            }
        }
    ]
    
    for i, scenario in enumerate(sample_scenarios, 1):
        print(f"\n📊 Scenario {i}: {scenario['name']}")
        print("-" * 50)
        
        # Generate insights
        insights = engine.evaluate_insight_conditions(
            scenario['analytics'], 
            scenario['user_id']
        )
        
        if insights:
            print(f"Generated {len(insights)} insights:")
            
            for insight in insights:
                print(f"\n🎯 {insight['category'].replace('_', ' ').title()} Insight")
                print(f"   Type: {insight['type']}")
                print(f"   Trigger: {insight['trigger']}")
                print(f"   Message: {insight['message']}")
                print(f"   Awareness: {insight['awareness']}")
                print(f"   Priority: {insight['priority']}")
                print(f"   Variables: {insight['variables']}")
        else:
            print("No insights generated for this scenario")
        
        print("\n" + "=" * 60)
    
    print("\n🔍 Insights Engine Logic Flow")
    print("-" * 30)
    print("1. Data Collection → SQL queries + ML predictions")
    print("2. Rule Evaluation → Check trigger conditions")
    print("3. Insight Generation → Template formatting")
    print("4. Priority Scoring → Risk-based ranking")
    print("5. Storage → Database with 7-day validity")
    
    print("\n📋 Insight Categories & Triggers")
    print("-" * 35)
    categories = engine.insight_templates
    
    for category, insights in categories.items():
        print(f"\n{category.replace('_', ' ').title()}:")
        for insight_type, template in insights.items():
            print(f"  • {insight_type}: {template['trigger']}")
    
    print("\n💡 Financial Responsibility Benefits")
    print("-" * 40)
    print("✅ Enhanced Awareness: Users see spending patterns")
    print("✅ Risk Identification: Early warning for issues")
    print("✅ Behavioral Insights: Understanding of habits")
    print("✅ Proactive Management: Budget and group harmony")
    print("✅ Investment Balance: Long-term wealth focus")
    
    print("\n🚫 Compliance with Constraints")
    print("-" * 35)
    print("✅ No ML Training: Rule-based logic only")
    print("✅ No Live Inference: Batch processing")
    print("✅ No Deep Learning: Simple conditions")
    print("✅ Rule-Based: Clear if/else logic")
    print("✅ Explainable: Human-readable messages")
    print("✅ ML-Output-Driven: Uses settlement predictions")

if __name__ == '__main__':
    demo_insights_engine()
