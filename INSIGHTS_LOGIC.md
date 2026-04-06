# Ledgerly Insights Engine - Logic Flow

## 🧠 Core Architecture

The insights engine uses **rule-based logic** with **ML-output integration** to generate human-readable financial insights.

## 📊 Input Data Sources

### 1. SQL Analytics Results
```sql
-- Personal spending patterns
SELECT category, COUNT(*), SUM(amount), AVG(amount) 
FROM "Expense" WHERE "userId" = ? 
GROUP BY category

-- Monthly trends
SELECT DATE_TRUNC('month', date), SUM(amount)
FROM "Expense" WHERE "userId" = ?
GROUP BY DATE_TRUNC('month', date)

-- Weekend vs Weekday
SELECT CASE WHEN EXTRACT(DOW FROM date) IN (0,6) THEN 'weekend' ELSE 'weekday' END,
       AVG(amount), COUNT(*)
FROM "Expense" WHERE "userId" = ?
GROUP BY day_type
```

### 2. ML Predictions (Precomputed)
- Settlement delay predictions from `settlement_predictor.py`
- Risk scores and confidence levels
- Valid for 3 days from generation

### 3. Portfolio Data
- Stock holdings and current values
- Investment vs spending ratios
- Asset allocation patterns

## 🎯 Insight Generation Logic

### Logic Flow Diagram
```
User Analytics → Rule Evaluation → Insight Generation → Priority Scoring → Storage
     ↓                ↓                    ↓                  ↓
SQL Queries     Condition Checks    Template Formatting  Risk-Based Sorting
ML Outputs      Trigger Matching    Variable Insertion   Priority Ranking
```

### Rule Evaluation Matrix

| Category | Insight Type | Trigger Condition | Priority |
|----------|--------------|------------------|-----------|
| Spending Behavior | High Frequency | `daily_avg_expenses > 5` | 1 |
| Spending Behavior | Category Dominance | `top_category_percentage > 40` | 1 |
| Spending Behavior | Weekend Spike | `weekend_spending > weekday_avg * 1.5` | 1 |
| Overspending | Budget Exceeded | `monthly_spent > monthly_budget` | 3 |
| Overspending | Rapid Increase | `monthly_increase > 30` | 3 |
| Group Accountability | Settlement Delay | `predicted_delay > 7` | 2 |
| Group Accountability | Multiple Pending | `pending_settlements > 3` | 2 |
| Spending vs Investing | Consumption Heavy | `spending_ratio > 0.8` | 1 |
| Spending vs Investing | Investment Light | `investment_ratio < 0.1` | 1 |

## 📝 Sample Insight Messages

### Spending Behavior Insights

**High Frequency Spending**
- **Trigger**: `daily_avg_expenses > 5`
- **Message**: "You're making 8.3 transactions daily, which is higher than your average."
- **Awareness**: "This indicates active spending habits - consider tracking categories."

**Category Dominance**
- **Trigger**: `top_category_percentage > 40`
- **Message**: "Food accounts for 45.2% of your spending this month."
- **Awareness**: "Category concentration can impact budget flexibility."

**Weekend Spike**
- **Trigger**: `weekend_spending > weekday_avg * 1.5`
- **Message**: "Your weekend spending is 75% higher than weekdays."
- **Awareness**: "Weekend patterns often reveal discretionary spending trends."

### Overspending Insights

**Budget Exceeded**
- **Trigger**: `monthly_spent > monthly_budget`
- **Message**: "You've spent $342.50 over your $2000 budget this month."
- **Awareness**: "Budget awareness helps maintain financial balance."

**Rapid Increase**
- **Trigger**: `monthly_increase > 30`
- **Message**: "Spending increased 45% compared to last month."
- **Awareness**: "Sudden increases often reflect lifestyle changes or emergencies."

### Group Accountability Insights

**Settlement Delay**
- **Trigger**: `predicted_delay > 7`
- **Message**: "Group expense 'Team Dinner' may take 12.4 days to settle."
- **Awareness**: "Longer settlement times affect group cash flow dynamics."

**Multiple Pending**
- **Trigger**: `pending_settlements > 3`
- **Message**: "You have 5 pending group settlements totaling $1,247.80."
- **Awareness**: "Multiple pending settlements can create payment complexity."

### Spending vs Investing Insights

**Consumption Heavy**
- **Trigger**: `spending_ratio > 0.8`
- **Message**: "85% of your money goes to spending vs investing."
- **Awareness**: "Balance between consumption and investment affects long-term wealth."

**Investment Light**
- **Trigger**: `investment_ratio < 0.1`
- **Message**: "Only 8% of your money is invested for growth."
- **Awareness**: "Investment allocation supports future financial goals."

## 🗄️ JSON Structure for Database Storage

```json
{
  "id": "insight_a1b2c3d4",
  "category": "overspending",
  "type": "budget_exceeded",
  "trigger": "monthly_spent > monthly_budget",
  "message": "You've spent $342.50 over your $2000 budget this month.",
  "awareness": "Budget awareness helps maintain financial balance.",
  "variables": {
    "overspend": 342.50,
    "budget": 2000
  },
  "user_id": "user_123",
  "generated_at": "2026-01-12T10:45:00.000Z",
  "priority": 3,
  "valid_until": "2026-01-19T10:45:00.000Z"
}
```

## 🎯 Priority Scoring System

### Priority Levels
- **Priority 3 (High)**: Budget issues, rapid spending increases
- **Priority 2 (Medium)**: Group accountability, settlement risks
- **Priority 1 (Low)**: Behavioral patterns, investment balance

### Sorting Logic
```python
insights.sort(key=lambda x: x['priority'], reverse=True)
```

## 🔄 Batch Processing Flow

### Generation Schedule
```bash
# Daily batch job
0 2 * * * cd /path/to/ml && python3 insights_engine.py

# After ML predictions complete
python3 settlement_predictor.py && python3 insights_engine.py
```

### Processing Steps
1. **Data Collection**: Gather user analytics from database
2. **Rule Evaluation**: Check all trigger conditions
3. **Insight Creation**: Format messages using templates
4. **Priority Assignment**: Score insights by importance
5. **Database Storage**: Save with 7-day validity
6. **API Serving**: Backend reads and serves stored insights

## 💡 Financial Responsibility Benefits

### Enhanced Awareness
- **Pattern Recognition**: Users see their spending behaviors
- **Risk Identification**: Early warning for potential issues
- **Trend Awareness**: Understanding of financial changes over time

### Proactive Management
- **Budget Monitoring**: Real-time overspending alerts
- **Group Harmony**: Settlement delay awareness improves relationships
- **Investment Balance**: Encourages healthy spending/investing ratio

### Behavioral Insights
- **Spending Triggers**: Identifies when/why spending increases
- **Category Focus**: Highlights concentration risks
- **Temporal Patterns**: Weekend vs weekday spending awareness

## 🚫 Constraints Compliance

✅ **No ML Training**: Uses only rule-based logic
✅ **No Live Inference**: Batch processing only
✅ **No Deep Learning**: Simple conditional logic
✅ **Rule-Based**: Clear if/else conditions
✅ **Explainable**: Human-readable messages with triggers
✅ **ML-Output-Driven**: Integrates settlement predictions

## 📊 Performance Characteristics

### Processing Efficiency
- **Batch Processing**: All users processed simultaneously
- **Database Optimized**: Efficient SQL queries with indexes
- **Template-Based**: Fast message generation
- **Scalable**: Linear time complexity per user

### Insight Quality
- **Actionable**: Each insight provides clear awareness
- **Non-Technical**: Natural language explanations
- **Context-Aware**: Variables personalize messages
- **Priority-Ranked**: Most important insights first
