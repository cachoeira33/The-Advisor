
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, startOfMonth, subMonths } from 'date-fns';
import { Transaction } from '../../../types';

interface RevenueExpensesChartProps {
  transactions: Transaction[];
}

export function RevenueExpensesChart({ transactions }: RevenueExpensesChartProps) {
  const generateMonthlyData = () => {
    const data = [];
    
    for (let i = 11; i >= 0; i--) {
      const month = startOfMonth(subMonths(new Date(), i));
      const monthStr = format(month, 'yyyy-MM');
      
      const monthTransactions = transactions.filter(t => 
        format(new Date(t.date), 'yyyy-MM') === monthStr
      );
      
      const revenue = monthTransactions
        .filter(t => t.type === 'INCOME')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expenses = monthTransactions
        .filter(t => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
      data.push({
        month: format(month, 'MMM yyyy'),
        revenue,
        expenses,
      });
    }
    
    return data;
  };

  const data = generateMonthlyData();

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
        <h3 className="text-lg font-medium text-gray-900">Revenue vs Expenses</h3>
        <p className="text-sm text-gray-500">Monthly comparison over the last 12 months</p>
      </div>
      <div className="p-4 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickFormatter={formatCurrency}
            />
            <Tooltip 
              formatter={(value: number, name: string) => [
                formatCurrency(value), 
                name === 'revenue' ? 'Revenue' : 'Expenses'
              ]}
            />
            <Legend />
            <Bar dataKey="revenue" fill="#10B981" name="Revenue" />
            <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}