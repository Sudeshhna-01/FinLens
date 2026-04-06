# Settlement Delay Prediction Model

## Overview

The Settlement Delay Prediction Model is an explainable regression system designed to predict how long it will take for group expenses to be settled. This helps users understand payment risks and take proactive measures.

## 🎯 Model Features

### Primary Features
1. **Group Size** (Weight: 30%)
   - Number of members in the expense group
   - Larger groups typically have slower settlements
   - Normalized range: 2-10 members

2. **Expense Amount** (Weight: 20%)
   - Total amount of the expense
   - Higher amounts require more deliberation time
   - Normalized range: $10-$1000

3. **Past Settlement Behavior** (Weight: 35%)
   - User's average time to settle past expenses
   - Most predictive factor for future behavior
   - Normalized range: 1-30 days

4. **Payment Frequency** (Weight: 15%)
   - How often user initiates payments in groups
   - Indicates financial responsibility and engagement
   - Normalized range: 0-10 payments/month

## 🧠 Model Architecture

### Explainable Linear Regression
```
Predicted Delay = Base Delay + Σ(Feature × Weight × Scale)
```

- **Base Delay**: 2 days (minimum settlement time)
- **Scale Factor**: 25 (converts to realistic 1-30 day range)
- **Final Range**: Capped at 1-30 days

### Feature Normalization
All features are normalized to 0-1 range:
```
Normalized Value = (Value - Min) / (Max - Min)
```

## 📊 Risk Levels

| Predicted Days | Risk Level | Interpretation |
|---------------|-------------|----------------|
| 1-3 days      | Low         | Fast settlement expected |
| 4-7 days      | Medium      | Normal settlement time |
| 8-14 days     | High        | Delay likely, monitor |
| 15+ days      | Very High   | Significant delay risk |

## 🎯 Example Predictions

### Scenario 1: Ideal Case
- **Group Size**: 3 people
- **Amount**: $50
- **Past Behavior**: 2 days (fast)
- **Payment Frequency**: 8/month (high)
- **Prediction**: 6.4 days (Medium risk)

### Scenario 2: High Risk
- **Group Size**: 8 people
- **Amount**: $500
- **Past Behavior**: 15 days (slow)
- **Payment Frequency**: 1/month (low)
- **Prediction**: 14.7 days (Very High risk)

## 💡 Recommendations System

The model generates actionable recommendations based on feature contributions:

### High Group Size Impact
- "Consider splitting into smaller sub-groups"
- "Use payment tiers for large amounts"

### High Amount Impact
- "Require upfront approval for large expenses"
- "Set up payment plans for big tickets"

### Slow Past Behavior
- "User has history of slow payments"
- "Consider requiring deposits"
- "Set up automatic reminders"

### Low Payment Frequency
- "Encourage more frequent payment participation"
- "Offer incentives for early settlement"

## 🔧 Technical Implementation

### Model Components

1. **Feature Extraction** (`extract_features()`)
   - Normalizes input features
   - Handles edge cases and missing data

2. **Prediction Engine** (`predict_delay()`)
   - Calculates weighted linear combination
   - Applies scaling and capping
   - Generates explainable output

3. **Confidence Scoring** (`calculate_confidence()`)
   - Based on user history completeness
   - Higher confidence with more data

4. **Risk Assessment** (`get_risk_level()`)
   - Categorizes predictions into risk levels
   - Provides clear interpretation

### Database Integration

- **Storage**: Predictions saved to `MLInsight` table
- **Validity**: 3 days (refreshed periodically)
- **Type**: `settlement_prediction`
- **Access**: Via `/api/settlements/predictions` endpoint

## 📈 Model Performance

### Explainability Benefits
- ✅ **Transparent**: All calculations visible
- ✅ **Traceable**: Feature contributions shown
- ✅ **Interpretable**: Linear relationship
- ✅ **Actionable**: Clear recommendations

### Limitations
- 🔄 **No Real-time**: Batch processing only
- 📊 **Data Dependent**: Requires user history
- 🎯 **Simplified**: Linear model (no complex interactions)
- ⏰ **Historical**: Based on past behavior patterns

## 🚀 Usage

### Running Predictions
```bash
cd ml
python3 settlement_predictor.py
```

### API Access
```bash
# Get predictions for user's groups
GET /api/settlements/predictions
Authorization: Bearer <token>

# Get risk summary
GET /api/settlements/risk-summary
Authorization: Bearer <token>

# Generate new predictions (admin)
POST /api/settlements/generate-predictions
Authorization: Bearer <token>
```

### Demo Script
```bash
cd ml
python3 demo_settlement_model.py
```

## 🔍 Model Monitoring

### Key Metrics
- **Prediction Accuracy**: Compare predicted vs actual settlement times
- **Risk Distribution**: Monitor risk level frequencies
- **Feature Importance**: Track weight effectiveness
- **User Adoption**: Measure recommendation impact

### Continuous Improvement
- **Weight Tuning**: Adjust based on real-world performance
- **Feature Engineering**: Add new predictive factors
- **Threshold Optimization**: Refine risk level boundaries
- **A/B Testing**: Compare model variations

## 📚 Business Value

### For Users
- **Risk Awareness**: Understand payment delays before they happen
- **Proactive Management**: Take action based on predictions
- **Financial Planning**: Better cash flow management
- **Group Harmony**: Reduce payment-related conflicts

### For Platform
- **Reduced Defaults**: Fewer unpaid expenses
- **User Engagement**: More proactive financial management
- **Trust Building**: Transparent AI recommendations
- **Operational Efficiency**: Automated risk assessment

## 🔒 Privacy & Ethics

### Data Usage
- **Historical Only**: Uses past settlement data
- **Aggregate Features**: No sensitive transaction details
- **User Consent**: Clear explanation of predictions
- **Opt-out Available**: Users can disable predictions

### Fairness Considerations
- **Bias Monitoring**: Regular audits for demographic bias
- **Equal Treatment**: Same model for all users
- **Transparency**: Open model architecture
- **Appeal Process**: Manual review for disputed predictions
