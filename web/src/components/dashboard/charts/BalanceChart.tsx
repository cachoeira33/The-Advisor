import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';
import { Transaction } from '../../../types';

interface BalanceChartProps {
  transactions: Transaction[];
  timeframe: '30d' | '6m' | '1y';
}

export function BalanceChart({ transactions, timeframe }: BalanceChartProps) {
  const generateBalanceData = () => {
    const days = timeframe === '30d' ? 30 : timeframe === '6m' ? 180 : 365;
    const data = [];
    let runningBalance = 0;

    // Sort transactions by date
    const sortedTransactions = [...transactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    for (let i = days; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      // Add transactions for this date
      const dayTransactions = sortedTransactions.filter(
        t => format(new Date(t.date), 'yyyy-MM-dd') === dateStr
      );
      
      dayTransactions.forEach(transaction => {
        runningBalance += transaction.type === 'INCOME' 
          ? transaction.amount 
          : -Math.abs(transaction.amount);
      });

      data.push({
        date: dateStr,
        balance: runningBalance,
        formattedDate: format(date, timeframe === '30d' ? 'MMM dd' : 'MMM yyyy'),
      });
    }

    return data;
  };

  const data = generateBalanceData();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="h-full">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Balance Evolution</h3>
        <p className="text-sm text-gray-500">
          {timeframe === '30d' ? 'Last 30 days' : 
           timeframe === '6m' ? 'Last 6 months' : 'Last year'}
        </p>
      </div>
      <div className="p-4 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="formattedDate" 
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickFormatter={formatCurrency}
            />
            <Tooltip 
              formatter={(value: number) => [formatCurrency(value), 'Balance']}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Line 
              type="monotone" 
              dataKey="balance" 
              stroke="#2563EB" 
              strokeWidth={2}
              dot={{ fill: '#2563EB', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}