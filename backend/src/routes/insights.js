const express = require('express');
const path = require('path');
const fs = require('fs');
const { execFile } = require('child_process');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get human-readable insights for authenticated user
router.get('/human', async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get human insights for user
    const insights = await prisma.$queryRaw`
      SELECT 
        id, 
        type, 
        data, 
        "generatedAt", 
        "validUntil"
      FROM "MLInsight" 
      WHERE "userId" = ${userId}
      AND type = 'human_insight'
      AND "validUntil" > NOW()
      ORDER BY 
        CASE 
          WHEN CAST(JSON_EXTRACT(data, '$.priority') AS INTEGER) = 3 THEN 1
          WHEN CAST(JSON_EXTRACT(data, '$.priority') AS INTEGER) = 2 THEN 2
          WHEN CAST(JSON_EXTRACT(data, '$.priority') AS INTEGER) = 1 THEN 3
          ELSE 4
        END,
        "generatedAt" DESC
      LIMIT 10
    `;
    
    // Parse JSON data for each insight
    const parsedInsights = insights.map(insight => ({
      id: insight.id,
      ...JSON.parse(insight.data),
      generatedAt: insight.generatedAt,
      validUntil: insight.validUntil
    }));
    
    res.json({
      success: true,
      insights: parsedInsights,
      count: parsedInsights.length
    });
    
  } catch (error) {
    console.error('Error fetching human insights:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch insights'
    });
  }
});

// Get insights by category
router.get('/human/:category', async (req, res) => {
  try {
    const userId = req.user.id;
    const { category } = req.params;
    
    const validCategories = ['spending_behavior', 'overspending', 'group_accountability', 'spending_vs_investing'];
    
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid category'
      });
    }
    
    const insights = await prisma.$queryRaw`
      SELECT 
        id, 
        type, 
        data, 
        "generatedAt", 
        "validUntil"
      FROM "MLInsight" 
      WHERE "userId" = ${userId}
      AND type = 'human_insight'
      AND JSON_EXTRACT(data, '$.category') = ${category}
      AND "validUntil" > NOW()
      ORDER BY "generatedAt" DESC
      LIMIT 5
    `;
    
    const parsedInsights = insights.map(insight => ({
      id: insight.id,
      ...JSON.parse(insight.data),
      generatedAt: insight.generatedAt,
      validUntil: insight.validUntil
    }));
    
    res.json({
      success: true,
      category,
      insights: parsedInsights,
      count: parsedInsights.length
    });
    
  } catch (error) {
    console.error('Error fetching category insights:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch category insights'
    });
  }
});

// Get insights summary (counts by category and priority)
router.get('/human/summary', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const insights = await prisma.$queryRaw`
      SELECT 
        JSON_EXTRACT(data, '$.category') as category,
        JSON_EXTRACT(data, '$.type') as type,
        CAST(JSON_EXTRACT(data, '$.priority') AS INTEGER) as priority,
        COUNT(*) as count
      FROM "MLInsight" 
      WHERE "userId" = ${userId}
      AND type = 'human_insight'
      AND "validUntil" > NOW()
      GROUP BY JSON_EXTRACT(data, '$.category'), JSON_EXTRACT(data, '$.type'), JSON_EXTRACT(data, '$.priority')
      ORDER BY priority DESC, count DESC
    `;
    
    // Parse and structure summary
    const summary = {
      totalInsights: insights.reduce((sum, item) => sum + parseInt(item.count), 0),
      byCategory: {},
      byPriority: {
        high: 0,  // Priority 3
        medium: 0, // Priority 2
        low: 0    // Priority 1
      }
    };
    
    insights.forEach(insight => {
      const category = insight.category;
      const priority = parseInt(insight.priority);
      const count = parseInt(insight.count);
      
      // Category summary
      if (!summary.byCategory[category]) {
        summary.byCategory[category] = {
          count: 0,
          types: {}
        };
      }
      summary.byCategory[category].count += count;
      summary.byCategory[category].types[insight.type] = count;
      
      // Priority summary
      if (priority === 3) summary.byPriority.high += count;
      else if (priority === 2) summary.byPriority.medium += count;
      else if (priority === 1) summary.byPriority.low += count;
    });
    
    res.json({
      success: true,
      summary
    });
    
  } catch (error) {
    console.error('Error generating insights summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate insights summary'
    });
  }
});

// Generate new insights (admin/manual trigger)
router.post('/human/generate', async (req, res) => {
  try {
    // This would typically be a scheduled job, but allowing manual trigger for demo
    const { execSync } = require('child_process');
    
    // Run insights engine script
    const result = execSync('cd ../ml && python3 insights_engine.py', {
      encoding: 'utf8'
    });
    
    console.log('Human insights generated:', result);
    
    res.json({
      success: true,
      message: 'Human-readable insights generated successfully',
      output: result
    });
    
  } catch (error) {
    console.error('Error generating human insights:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate human insights'
    });
  }
});

router.use(authenticateToken);

// Let the current user refresh JUST their own insights (Python runs per-user)
router.post('/self/refresh', async (req, res) => {
  try {
    const userId = req.user.id;
    const mlDir = path.resolve(__dirname, '../../../ml');
    const venvPython = path.join(mlDir, 'venv', 'bin', 'python');
    const pythonCmd = fs.existsSync(venvPython) ? venvPython : 'python3';

    const runScript = (script, args = []) =>
      new Promise((resolve, reject) => {
        execFile(
          pythonCmd,
          [script, ...args],
          { cwd: mlDir, encoding: 'utf8' },
          (err, stdout, stderr) => {
            if (err) {
              console.error(`Error running ${script}:`, stderr || err.message);
              const wrapped = new Error(stderr || err.message || `Failed running ${script}`);
              wrapped.cause = err;
              return reject(wrapped);
            }
            resolve(stdout);
          }
        );
      });

    await runScript('insights_engine.py', ['--user', userId]);
    await runScript('portfolio_predictions.py', ['--user', userId]);

    res.json({
      success: true,
      message: 'Insights refreshed for your account.'
    });
  } catch (error) {
    console.error('Error refreshing self insights:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to refresh insights'
    });
  }
});

// Get all insights for user
router.get('/', async (req, res) => {
  try {
    const insights = await prisma.mLInsight.findMany({
      where: {
        userId: req.user.id,
        validUntil: { gte: new Date() }
      },
      orderBy: { generatedAt: 'desc' }
    });

    const parsedInsights = insights.map(insight => ({
      ...insight,
      data: JSON.parse(insight.data)
    }));

    res.json(parsedInsights);
  } catch (error) {
    console.error('Error fetching insights:', error);
    res.status(500).json({ error: 'Failed to fetch insights' });
  }
});

// Get insight by type
router.get('/:type', async (req, res) => {
  try {
    const { type } = req.params;

    const insight = await prisma.mLInsight.findFirst({
      where: {
        userId: req.user.id,
        type,
        validUntil: { gte: new Date() }
      },
      orderBy: { generatedAt: 'desc' }
    });

    if (!insight) {
      return res.status(404).json({ error: 'Insight not found' });
    }

    res.json({
      ...insight,
      data: JSON.parse(insight.data)
    });
  } catch (error) {
    console.error('Error fetching insight:', error);
    res.status(500).json({ error: 'Failed to fetch insight' });
  }
});

module.exports = router;
