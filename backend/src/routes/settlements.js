const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get settlement predictions for user's groups
router.get('/predictions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get recent settlement predictions for groups the user belongs to
    const predictions = await prisma.$queryRaw`
      SELECT DISTINCT ON (data->>'expense_id') 
        id, 
        type, 
        data, 
        "generatedAt", 
        "validUntil"
      FROM "MLInsight" 
      WHERE type = 'settlement_prediction'
      AND "validUntil" > NOW()
      ORDER BY data->>'expense_id', "generatedAt" DESC
    `;
    
    // Filter predictions for groups user belongs to
    const userPredictions = [];
    
    for (const prediction of predictions) {
      const data = typeof prediction.data === 'string' 
        ? JSON.parse(prediction.data) 
        : prediction.data;
      
      // Check if user belongs to this group
      const groupExpense = await prisma.groupExpense.findUnique({
        where: { id: data.expense_id },
        include: {
          group: {
            include: {
              members: {
                where: { userId }
              }
            }
          }
        }
      });
      
      if (groupExpense && groupExpense.group.members.length > 0) {
        userPredictions.push({
          id: prediction.id,
          ...data,
          generatedAt: prediction.generatedAt,
          validUntil: prediction.validUntil
        });
      }
    }
    
    res.json({
      success: true,
      predictions: userPredictions,
      count: userPredictions.length
    });
    
  } catch (error) {
    console.error('Error fetching settlement predictions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch settlement predictions'
    });
  }
});

// Get settlement risk summary for user's groups
router.get('/risk-summary', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's groups
    const userGroups = await prisma.groupMember.findMany({
      where: { userId },
      include: {
        group: {
          include: {
            groupExpenses: {
              include: {
                splits: true
              }
            }
          }
        }
      }
    });
    
    const riskSummary = {
      totalGroups: userGroups.length,
      highRiskGroups: 0,
      mediumRiskGroups: 0,
      lowRiskGroups: 0,
      totalUnsettledAmount: 0,
      averageSettlementTime: 0
    };
    
    let totalSettlementTime = 0;
    let settledCount = 0;
    
    for (const groupMember of userGroups) {
      const group = groupMember.group;
      let groupRisk = 'Low';
      let unsettledAmount = 0;
      
      for (const expense of group.groupExpenses) {
        const unpaidSplits = expense.splits.filter(split => !split.isPaid);
        unsettledAmount += unpaidSplits.reduce((sum, split) => sum + split.amount, 0);
        
        // Calculate settlement time for paid splits
        const paidSplits = expense.splits.filter(split => split.isPaid);
        for (const split of paidSplits) {
          const daysToSettle = Math.ceil(
            (new Date(split.updatedAt) - new Date(expense.date)) / (1000 * 60 * 60 * 24)
          );
          totalSettlementTime += daysToSettle;
          settledCount++;
        }
      }
      
      // Determine risk level based on unsettled amount and time
      if (unsettledAmount > 500 || group.groupExpenses.length > 10) {
        groupRisk = 'High';
      } else if (unsettledAmount > 100 || group.groupExpenses.length > 5) {
        groupRisk = 'Medium';
      }
      
      if (groupRisk === 'High') riskSummary.highRiskGroups++;
      else if (groupRisk === 'Medium') riskSummary.mediumRiskGroups++;
      else riskSummary.lowRiskGroups++;
      
      riskSummary.totalUnsettledAmount += unsettledAmount;
    }
    
    riskSummary.averageSettlementTime = settledCount > 0 
      ? Math.round(totalSettlementTime / settledCount, 1)
      : 0;
    
    res.json({
      success: true,
      riskSummary
    });
    
  } catch (error) {
    console.error('Error generating risk summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate risk summary'
    });
  }
});

// Generate new settlement predictions (admin/manual trigger)
router.post('/generate-predictions', authenticateToken, async (req, res) => {
  try {
    // This would typically be a scheduled job, but allowing manual trigger for demo
    const { execSync } = require('child_process');
    
    // Run the settlement predictor script
    const result = execSync('cd ../ml && python3 settlement_predictor.py', {
      encoding: 'utf8'
    });
    
    console.log('Settlement predictions generated:', result);
    
    res.json({
      success: true,
      message: 'Settlement predictions generated successfully',
      output: result
    });
    
  } catch (error) {
    console.error('Error generating settlement predictions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate settlement predictions'
    });
  }
});

module.exports = router;
