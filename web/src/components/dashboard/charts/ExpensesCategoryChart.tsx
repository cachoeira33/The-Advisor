import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Transaction } from '../../../types';

interface ExpensesCategoryChartProps {
  transactions: Transaction[];
}

export function ExpensesCategoryChart({ transactions }: ExpensesCategoryChartProps) {
  const generateCategoryData = () => {
    const categoryTotals = new Map<string, number>();
    
    transactions
      .filter(t => t.type === 'EXPENSE')
      .forEach(transaction => {
        const categoryName = (transaction as any).category?.name || 'Uncategorized';
        const currentTotal = categoryTotals.get(categoryName) || 0;
        categoryTotals.set(categoryName, currentTotal + Math.abs(transaction.amount));
      });
    
    return Array.from(categoryTotals.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Top 8 categories
  };

  const data = generateCategoryData();

  const COLORS = [
    '#2563EB', '#10B981', '#F59E0B', '#EF4444',
    '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">No expense data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Expenses by Category</h3>
        <p className="text-sm text-gray-500">Top categories by spending</p>
      </div>
      <div className="p-4 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value) => value}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}