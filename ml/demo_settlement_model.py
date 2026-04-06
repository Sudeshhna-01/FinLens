"""
Demo script for Settlement Delay Prediction Model
Shows example predictions and explains the model's reasoning.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from settlement_predictor import SettlementDelayPredictor

def demo_model():
    """Demonstrate the settlement prediction model with various scenarios"""
    
    print("🔮 FinLens Settlement Delay Prediction Model Demo")
    print("=" * 60)
    
    predictor = SettlementDelayPredictor()
    
    # Test scenarios
    scenarios = [
        {
            'name': 'Small Group, Fast Payer',
            'group_expense': {
                'amount': 50,
                'member_count': 3
            },
            'user_history': {
                'avg_settlement_days': 2,
                'payment_frequency': 8
            }
        },
        {
            'name': 'Large Group, Slow Payer',
            'group_expense': {
                'amount': 500,
                'member_count': 8
            },
            'user_history': {
                'avg_settlement_days': 15,
                'payment_frequency': 1
            }
        },
        {
            'name': 'Medium Group, Average Payer',
            'group_expense': {
                'amount': 200,
                'member_count': 5
            },
            'user_history': {
                'avg_settlement_days': 7,
                'payment_frequency': 4
            }
        },
        {
            'name': 'Large Expense, New User',
            'group_expense': {
                'amount': 800,
                'member_count': 6
            },
            'user_history': {
                'avg_settlement_days': 7,
                'payment_frequency': 0
            }
        }
    ]
    
    for i, scenario in enumerate(scenarios, 1):
        print(f"\n📊 Scenario {i}: {scenario['name']}")
        print("-" * 40)
        
        # Make prediction
        prediction = predictor.predict_delay(
            scenario['group_expense'],
            scenario['user_history']
        )
        
        # Display results
        print(f"💰 Expense: ${scenario['group_expense']['amount']:.2f}")
        print(f"👥 Group Size: {scenario['group_expense']['member_count']} people")
        print(f"⏰ Past Settlement Time: {scenario['user_history']['avg_settlement_days']} days")
        print(f"💳 Payment Frequency: {scenario['user_history']['payment_frequency']}/month")
        print(f"\n🎯 Prediction: {prediction['predicted_days']} days")
        print(f"🚨 Risk Level: {prediction['risk_level']}")
        print(f"📈 Confidence: {prediction['confidence'] * 100:.0f}%")
        
        print("\n📋 Feature Contributions:")
        for feature, contrib in prediction['feature_contributions'].items():
            print(f"  • {feature.replace('_', ' ').title()}: {contrib['contribution']:.1f} days")
            print(f"    {contrib['description']}")
        
        if prediction['recommendations']:
            print("\n💡 Recommendations:")
            for rec in prediction['recommendations']:
                print(f"  • {rec}")
        
        print("\n" + "=" * 60)
    
    print("\n🧠 Model Explainability Summary:")
    print("-" * 30)
    print("✅ Linear regression with weighted features")
    print("✅ All contributions are transparent and traceable")
    print("✅ Feature weights based on domain expertise")
    print("✅ No black box components")
    
    print("\n📏 Feature Weights:")
    for feature, weight in predictor.weights.items():
        print(f"  • {feature.replace('_', ' ').title()}: {weight:.2f}")
    
    print("\n🎯 Model Characteristics:")
    print("  • Predictions range: 1-30 days")
    print("  • Base delay: 2 days")
    print("  • Most important factor: Past settlement behavior (35%)")
    print("  • Scaling: Normalized to 0-1 range")
    print("  • Confidence: Based on user history completeness")

if __name__ == '__main__':
    demo_model()
