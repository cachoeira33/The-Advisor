import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { TrendingUp, Calculator, DollarSign, Calendar, Plus, Target } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { useTransactions } from '../hooks/useTransactions';
import { useBusiness } from '../hooks/useBusiness';
import { useRecurringItems } from '../hooks/useRecurringItems';
import { RecurringItemModal } from '../components/forecasting/RecurringItemModal';
import { PurchaseSimulator } from '../components/forecasting/PurchaseSimulator';

export function ForecastingPage() {
  const { t } = useTranslation();
  const { selectedBusiness } = useBusiness();
  const { transactions } = useTransactions(selectedBusiness?.id);
  const { recurringItems, createRecurringItem, updateRecurringItem, deleteRecurringItem } = useRecurringItems(selectedBusiness?.id);
  
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
  const [editingRecurring, setEditingRecurring] = useState(null);
  const [simulationData, setSimulationData] = useState(null);

  // Generate forecast data
  const generateForecastData = () => {
    const months = [];
    const currentDate = new Date();
    
    // Calculate historical average
    const monthlyData = new Map();
    transactions.forEach(transaction => {
      const monthKey = new Date(transaction.date).toISOString().slice(0, 7);
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { income: 0, expenses: 0 });
      }
      const data = monthlyData.get(monthKey);
      if (transaction.type === 'INCOME') {
        data.income += transaction.amount;
      } else {
        data.expenses += Math.abs(transaction.amount);
      }
    });

    const historicalMonths = Array.from(monthlyData.values());
    const avgIncome = historicalMonths.reduce((sum, m) => sum + m.income, 0) / Math.max(1, historicalMonths.length);
    const avgExpenses = historicalMonths.reduce((sum, m) => sum + m.expenses, 0) / Math.max(1, historicalMonths.length);

    // Add recurring items
    const recurringIncome = recurringItems.filter(item => item.type === 'INCOME').reduce((sum, item) => sum + item.amount, 0);
    const recurringExpenses = recurringItems.filter(item => item.type === 'EXPENSE').reduce((sum, item) => sum + Math.abs(item.amount), 0);

    let currentBalance = transactions.reduce((sum, t) => sum + (t.type === 'INCOME' ? t.amount : -Math.abs(t.amount)), 0);

    // Generate 12 months forecast
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i + 1, 1);
      const monthIncome = avgIncome + recurringIncome;
      const monthExpenses = avgExpenses + recurringExpenses;
      const netFlow = monthIncome - monthExpenses;
      currentBalance += netFlow;

      months.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        income: monthIncome,
        expenses: monthExpenses,
        balance: currentBalance,
        netFlow,
      });
    }

    return months;
  };

  const forecastData = generateForecastData();

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: selectedBusiness?.currency || 'USD',
    }).format(value);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('forecasting.title')}</h1>
          <p className="text-gray-600">
            Plan your financial future with budgeting and forecasting tools
          </p>
        </div>
      </div>

      {/* Recurring Items Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Target className="w-6 h-6 text-primary-600 mr-3" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Recurring Items</h2>
              <p className="text-sm text-gray-600">Manage your regular income and expenses</p>
            </div>
          </div>
          <Button onClick={() => setIsRecurringModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-green-600 mb-3">Monthly Income</h3>
            <div className="space-y-2">
              {recurringItems.filter(item => item.type === 'INCOME').map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{item.description}</p>
                    <p className="text-sm text-gray-600">{formatCurrency(item.amount)}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => setEditingRecurring(item)}>
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteRecurringItem(item.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-medium text-red-600 mb-3">Monthly Expenses</h3>
            <div className="space-y-2">
              {recurringItems.filter(item => item.type === 'EXPENSE').map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{item.description}</p>
                    <p className="text-sm text-gray-600">{formatCurrency(Math.abs(item.amount))}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => setEditingRecurring(item)}>
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteRecurringItem(item.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Forecast Chart */}
      <Card className="p-6">
        <div className="flex items-center mb-6">
          <TrendingUp className="w-6 h-6 text-primary-600 mr-3" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">12-Month Financial Forecast</h2>
            <p className="text-sm text-gray-600">Projected balance based on historical data and recurring items</p>
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Line 
                type="monotone" 
                dataKey="balance" 
                stroke="#2563EB" 
                strokeWidth={3}
                dot={{ fill: '#2563EB', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Purchase Simulator */}
      <PurchaseSimulator 
        forecastData={forecastData}
        onSimulate={setSimulationData}
      />

      {/* Simulation Results */}
      {simulationData && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Simulation Results</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={simulationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={formatCurrency} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Line 
                  type="monotone" 
                  dataKey="originalBalance" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Original Forecast"
                />
                <Line 
                  type="monotone" 
                  dataKey="simulatedBalance" 
                  stroke="#EF4444" 
                  strokeWidth={2}
                  name="With Purchase"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      <RecurringItemModal
        isOpen={isRecurringModalOpen || !!editingRecurring}
        onClose={() => {
          setIsRecurringModalOpen(false);
          setEditingRecurring(null);
        }}
        onSubmit={editingRecurring ? updateRecurringItem : createRecurringItem}
        item={editingRecurring}
        businessId={selectedBusiness?.id || ''}
      />
    </motion.div>
  );
}