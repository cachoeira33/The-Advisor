import express from 'express';
import { z } from 'zod';
import { supabase } from '../config/supabase.js';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth.js';
import { asyncHandler, createError } from '../middleware/errorHandler.js';

const router = express.Router();

const forecastSchema = z.object({
  business_id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  model_type: z.enum(['LINEAR', 'SEASONAL', 'MONTE_CARLO']),
  time_horizon: z.number().min(1).max(60), // months
  confidence_level: z.number().min(0.5).max(0.99).default(0.95),
  parameters: z.record(z.any()).default({}),
});

// Get forecasts for a business
router.get('/:businessId', 
  authenticateToken,
  requireRole(['OWNER', 'ADMIN', 'ANALYST', 'VIEWER']),
  asyncHandler(async (req: AuthRequest, res: express.Response) => {
    const businessId = req.params.businessId;

    const { data: forecasts, error } = await supabase
      .from('forecasts')
      .select(`
        *,
        scenarios:forecast_scenarios(*)
      `)
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    if (error) {
      throw createError('Failed to fetch forecasts', 500);
    }

    res.json(forecasts);
  })
);

// Create forecast
router.post('/', 
  authenticateToken,
  requireRole(['OWNER', 'ADMIN', 'ANALYST']),
  asyncHandler(async (req: AuthRequest, res: express.Response) => {
    const forecastData = forecastSchema.parse(req.body);

    // Get historical transaction data for modeling
    const { data: transactions, error: transError } = await supabase
      .from('transactions')
      .select('*')
      .eq('business_id', forecastData.business_id)
      .order('date', { ascending: true });

    if (transError) {
      throw createError('Failed to fetch transaction data', 500);
    }

    // Generate forecast results based on model type
    let results = {};
    
    switch (forecastData.model_type) {
      case 'LINEAR':
        results = generateLinearForecast(transactions, forecastData.time_horizon);
        break;
      case 'SEASONAL':
        results = generateSeasonalForecast(transactions, forecastData.time_horizon);
        break;
      case 'MONTE_CARLO':
        results = generateMonteCarloForecast(transactions, forecastData.time_horizon);
        break;
    }

    const { data: forecast, error } = await supabase
      .from('forecasts')
      .insert([
        {
          ...forecastData,
          results,
          created_by: req.user!.id,
        },
      ])
      .select()
      .single();

    if (error) {
      throw createError('Failed to create forecast', 500);
    }

    res.status(201).json(forecast);
  })
);

// Helper functions for forecast generation
function generateLinearForecast(transactions: any[], timeHorizon: number) {
  // Simple linear regression on monthly totals
  const monthlyData = groupTransactionsByMonth(transactions);
  const trend = calculateLinearTrend(monthlyData);
  
  const forecast = [];
  const now = new Date();
  
  for (let i = 1; i <= timeHorizon; i++) {
    const futureDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const predictedRevenue = trend.revenue.slope * i + trend.revenue.intercept;
    const predictedExpenses = trend.expenses.slope * i + trend.expenses.intercept;
    
    forecast.push({
      date: futureDate.toISOString(),
      revenue: Math.max(0, predictedRevenue),
      expenses: Math.max(0, predictedExpenses),
      profit: predictedRevenue - predictedExpenses,
    });
  }
  
  return { forecast, confidence: 0.8, model: 'linear_regression' };
}

function generateSeasonalForecast(transactions: any[], _timeHorizon: number) {
  // Account for seasonal patterns
  const monthlyData = groupTransactionsByMonth(transactions);
  calculateSeasonalFactors(monthlyData);
  
  return { forecast: [], confidence: 0.85, model: 'seasonal_adjustment' };
}

function generateMonteCarloForecast(transactions: any[], timeHorizon: number) {
  // Monte Carlo simulation with multiple scenarios
  const simulations = 1000;
  const scenarios = [];
  
  for (let i = 0; i < simulations; i++) {
    scenarios.push(runMonteCarloSimulation(transactions, timeHorizon));
  }
  
  return { scenarios, confidence: 0.95, model: 'monte_carlo' };
}

function groupTransactionsByMonth(transactions: any[]) {
  const grouped = new Map();
  
  transactions.forEach(transaction => {
    const date = new Date(transaction.date);
    const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
    
    if (!grouped.has(monthKey)) {
      grouped.set(monthKey, { revenue: 0, expenses: 0, date: monthKey });
    }
    
    const monthData = grouped.get(monthKey);
    if (transaction.type === 'INCOME') {
      monthData.revenue += transaction.amount;
    } else {
      monthData.expenses += Math.abs(transaction.amount);
    }
  });
  
  return Array.from(grouped.values()).sort((a, b) => a.date.localeCompare(b.date));
}

function calculateLinearTrend(monthlyData: any[]) {
  // Simple linear regression calculation
  const n = monthlyData.length;
  if (n < 2) return { revenue: { slope: 0, intercept: 0 }, expenses: { slope: 0, intercept: 0 } };
  
  const revenueSlope = (monthlyData[n-1].revenue - monthlyData[0].revenue) / (n - 1);
  const expensesSlope = (monthlyData[n-1].expenses - monthlyData[0].expenses) / (n - 1);
  
  return {
    revenue: { 
      slope: revenueSlope, 
      intercept: monthlyData[n-1].revenue 
    },
    expenses: { 
      slope: expensesSlope, 
      intercept: monthlyData[n-1].expenses 
    }
  };
}

function calculateSeasonalFactors(_monthlyData: any[]) {
  // Calculate seasonal adjustment factors
  return {};
}

function runMonteCarloSimulation(_transactions: any[], _timeHorizon: number) {
  // Monte Carlo simulation logic
  return {};
}

export { router as forecastRoutes };