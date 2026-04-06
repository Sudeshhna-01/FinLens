"""
FinLens Settlement Delay Prediction Model

This module predicts settlement delays for group expenses using explainable regression.
Features: Group size, expense amount, past settlement behavior, user payment frequency.
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

class SettlementDelayPredictor:
    """
    Explainable regression model for predicting settlement delays.
    Uses weighted linear combination of features for transparency.
    """
    
    def __init__(self):
        # Feature weights (determined through domain knowledge and simple statistical analysis)
        self.weights = {
            'group_size': 0.3,        # Larger groups = slower settlement
            'expense_amount': 0.2,     # Higher amounts = more deliberation time
            'past_behavior': 0.35,      # Historical settlement speed (most important)
            'payment_frequency': 0.15    # How often user pays in groups
        }
        
        # Base delay in days
        self.base_delay = 2.0
        
        # Feature scaling parameters
        self.scaling_params = {
            'group_size': {'max': 10, 'min': 2},
            'expense_amount': {'max': 1000, 'min': 10},
            'past_behavior': {'max': 30, 'min': 1},
            'payment_frequency': {'max': 10, 'min': 0}
        }
    
    def normalize_feature(self, value, feature_name):
        """Normalize feature to 0-1 range"""
        params = self.scaling_params[feature_name]
        range_val = params['max'] - params['min']
        if range_val == 0:
            return 0
        return max(0, min(1, (value - params['min']) / range_val))
    
    def extract_features(self, group_expense_data, user_history):
        """Extract and normalize features for prediction"""
        features = {}
        
        # Group size (normalized)
        features['group_size'] = self.normalize_feature(
            group_expense_data['member_count'], 
            'group_size'
        )
        
        # Expense amount (normalized)
        features['expense_amount'] = self.normalize_feature(
            group_expense_data['amount'], 
            'expense_amount'
        )
        
        # Past settlement behavior (average days to settle, normalized)
        avg_settlement_days = user_history.get('avg_settlement_days', 7)
        features['past_behavior'] = self.normalize_feature(
            avg_settlement_days, 
            'past_behavior'
        )
        
        # Payment frequency (how often user initiates payments, normalized)
        payment_freq = user_history.get('payment_frequency', 2)
        features['payment_frequency'] = self.normalize_feature(
            payment_freq, 
            'payment_frequency'
        )
        
        return features
    
    def predict_delay(self, group_expense_data, user_history):
        """
        Predict settlement delay in days using explainable linear regression.
        
        Args:
            group_expense_data: Dict with group expense info
            user_history: Dict with user's payment history
            
        Returns:
            Dict with prediction and feature contributions
        """
        features = self.extract_features(group_expense_data, user_history)
        
        # Calculate weighted sum
        weighted_score = sum(
            self.weights[feature] * value 
            for feature, value in features.items()
        )
        
        # Convert to days (scale to realistic range: 1-30 days)
        predicted_delay = self.base_delay + (weighted_score * 25)
        
        # Cap at reasonable limits
        predicted_delay = max(1, min(30, predicted_delay))
        
        # Calculate feature contributions for explainability
        contributions = {}
        for feature, value in features.items():
            contributions[feature] = {
                'value': value,
                'weight': self.weights[feature],
                'contribution': self.weights[feature] * value * 25,
                'description': self.get_feature_description(feature, value)
            }
        
        return {
            'predicted_days': round(predicted_delay, 1),
            'confidence': self.calculate_confidence(features),
            'risk_level': self.get_risk_level(predicted_delay),
            'feature_contributions': contributions,
            'recommendations': self.get_recommendations(predicted_delay, contributions)
        }
    
    def get_feature_description(self, feature, value):
        """Get human-readable description of feature impact"""
        descriptions = {
            'group_size': f"Group size impact: {'High' if value > 0.7 else 'Medium' if value > 0.3 else 'Low'}",
            'expense_amount': f"Amount impact: {'High' if value > 0.7 else 'Medium' if value > 0.3 else 'Low'}",
            'past_behavior': f"Payment history: {'Slow' if value > 0.7 else 'Average' if value > 0.3 else 'Fast'}",
            'payment_frequency': f"Payment frequency: {'Low' if value > 0.7 else 'Medium' if value > 0.3 else 'High'}"
        }
        return descriptions.get(feature, f"{feature}: {value:.2f}")
    
    def calculate_confidence(self, features):
        """Calculate prediction confidence based on feature completeness"""
        # Higher confidence when user has more history
        history_confidence = min(1.0, features['past_behavior'] * 2)
        
        # Adjust based on data quality
        confidence = history_confidence * 0.8 + 0.2  # Base confidence of 20%
        
        return round(confidence, 2)
    
    def get_risk_level(self, predicted_days):
        """Categorize risk level based on predicted delay"""
        if predicted_days <= 3:
            return "Low"
        elif predicted_days <= 7:
            return "Medium"
        elif predicted_days <= 14:
            return "High"
        else:
            return "Very High"
    
    def get_recommendations(self, predicted_days, contributions):
        """Generate actionable recommendations"""
        recommendations = []
        
        if predicted_days > 7:
            recommendations.append("Consider setting up automatic payment reminders")
        
        if contributions['group_size']['contribution'] > 5:
            recommendations.append("For large groups, consider splitting into smaller sub-groups")
        
        if contributions['expense_amount']['contribution'] > 5:
            recommendations.append("For large expenses, require upfront approval from all members")
        
        if contributions['past_behavior']['contribution'] > 8:
            recommendations.append("User has history of slow payments - consider requiring deposits")
        
        if contributions['payment_frequency']['contribution'] < 2:
            recommendations.append("Encourage more frequent payment participation")
        
        return recommendations

def get_user_payment_history(user_id, conn):
    """Get user's payment and settlement history"""
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        # Get user's group expenses and settlement patterns
        cursor.execute('''
            SELECT 
                ge.amount,
                ge.date as expense_date,
                COUNT(gm."userId") as member_count,
                -- Calculate average settlement time for this user's past expenses
                AVG(
                    CASE 
                        WHEN ges."isPaid" = true THEN 
                            EXTRACT(EPOCH FROM (ges."updatedAt" - ge.date)) / 86400
                        ELSE NULL 
                    END
                ) as avg_settlement_days
            FROM "GroupExpense" ge
            JOIN "Group" g ON ge."groupId" = g.id
            JOIN "GroupMember" gm ON g.id = gm."groupId"
            LEFT JOIN "GroupExpenseSplit" ges ON ge.id = ges."groupExpenseId"
                AND EXISTS (
                    SELECT 1 FROM "GroupMember" gm_s
                    WHERE gm_s.id = ges."groupMemberId" AND gm_s."userId" = %s
                )
            WHERE (g."creatorId" = %s OR gm."userId" = %s)
            AND ge.date >= NOW() - INTERVAL '90 days'
            GROUP BY ge.id, ge.amount, ge.date
            ORDER BY ge.date DESC
            LIMIT 20
        ''', (user_id, user_id, user_id))
        
        expenses = cursor.fetchall()
        
        # Calculate payment frequency (how often user pays)
        cursor.execute('''
            SELECT 
                COUNT(DISTINCT ge.id) as payments_made
            FROM "GroupExpense" ge
            WHERE ge."paidBy" = %s
            AND ge.date >= NOW() - INTERVAL '90 days'
        ''', (user_id,))
        
        payment_result = cursor.fetchone()
        payments_made = payment_result['payments_made'] if payment_result else 0
        
        cursor.close()
        
        print(f"Expenses for user {user_id}: {len(expenses)}")
        print(f"Payments made: {payments_made}")
        
        if not expenses:
            return {
                'avg_settlement_days': 7,  # Default assumption
                'payment_frequency': max(1, payments_made / 3),  # Per month, minimum 1
                'total_expenses': 0
            }
        
        # Calculate averages
        settlement_times = [
            e['avg_settlement_days'] for e in expenses 
            if e['avg_settlement_days'] is not None
        ]
        
        avg_settlement = sum(settlement_times) / len(settlement_times) if settlement_times else 7
        
        return {
            'avg_settlement_days': avg_settlement,
            'payment_frequency': max(1, payments_made / 3),  # Per month, minimum 1
            'total_expenses': len(expenses)
        }
        
    except Exception as e:
        print(f"Error getting user history for {user_id}: {e}")
        cursor.close()
        return {
            'avg_settlement_days': 7,
            'payment_frequency': 1,
            'total_expenses': 0
        }

def generate_settlement_predictions(conn):
    """Generate settlement delay predictions for all recent group expenses"""
    print("\nGenerating settlement delay predictions...")
    
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    predictor = SettlementDelayPredictor()
    
    # Get recent group expenses without predictions
    cursor.execute('''
        SELECT 
            ge.id,
            ge.amount,
            ge.date,
            g.name as group_name,
            COUNT(gm."userId") as member_count,
            ge."paidBy"
        FROM "GroupExpense" ge
        JOIN "Group" g ON ge."groupId" = g.id
        JOIN "GroupMember" gm ON g.id = gm."groupId"
        WHERE ge.date >= NOW() - INTERVAL '7 days'
        GROUP BY ge.id, g.name
        ORDER BY ge.date DESC
    ''')
    
    group_expenses = cursor.fetchall()
    predictions = []
    
    print(f"Found {len(group_expenses)} recent group expenses")
    
    for expense in group_expenses:
        try:
            # Get payment history for the payer
            user_history = get_user_payment_history(expense['paidBy'], conn)
            print(f"User history for {expense['paidBy']}: {user_history}")
            
            # Make prediction
            prediction = predictor.predict_delay(
                {
                    'amount': float(expense['amount']),
                    'member_count': expense['member_count']
                },
                user_history
            )
            
            # Add metadata
            prediction.update({
                'expense_id': expense['id'],
                'group_name': expense['group_name'],
                'amount': float(expense['amount']),
                'prediction_date': datetime.now().isoformat()
            })
            
            predictions.append(prediction)
            
            print(f"  - {expense['group_name']}: {prediction['predicted_days']} days ({prediction['risk_level']} risk)")
            
        except Exception as e:
            print(f"Error processing expense {expense['id']}: {e}")
            continue
    
    cursor.close()
    return predictions

def save_settlement_predictions(predictions, conn):
    """Save predictions to database"""
    cursor = conn.cursor()
    
    for prediction in predictions:
        prediction_id = f"sp_{uuid.uuid4().hex[:12]}"
        
        cursor.execute('''
            INSERT INTO "MLInsight" (id, "userId", type, data, "generatedAt", "validUntil")
            VALUES (%s, %s, %s, %s, %s, %s)
        ''', (
            prediction_id,
            'system',  # System-level insight
            'settlement_prediction',
            json.dumps(prediction),
            datetime.now(),
            datetime.now() + timedelta(days=3)  # Valid for 3 days
        ))
    
    conn.commit()
    cursor.close()

def main():
    """Main function to generate settlement predictions"""
    print("FinLens Settlement Delay Predictor")
    print("=" * 50)
    
    conn = get_db_connection()
    
    try:
        # Generate predictions
        predictions = generate_settlement_predictions(conn)
        
        if predictions:
            # Save to database
            save_settlement_predictions(predictions, conn)
            print(f"\n✓ Generated and saved {len(predictions)} settlement predictions")
        else:
            print("\n✗ No recent group expenses found for prediction")
    
    except Exception as e:
        print(f"✗ Error generating predictions: {e}")
    
    finally:
        conn.close()
    
    print("\n" + "=" * 50)
    print("Settlement prediction generation complete!")

if __name__ == '__main__':
    main()
