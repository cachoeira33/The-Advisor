import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FileBarChart, Download, Calendar, Filter } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { useTransactions } from '../hooks/useTransactions';
import { useBusiness } from '../hooks/useBusiness';
import { useCategories } from '../hooks/useCategories';

export function ReportsPage() {
  const { t } = useTranslation();
  const { selectedBusiness } = useBusiness();
  const { transactions } = useTransactions(selectedBusiness?.id);
  const { categories } = useCategories(selectedBusiness?.id);
  
  const [reportType, setReportType] = useState<'profit_loss' | 'cash_flow' | 'expenses_category' | 'income_source'>('profit_loss');
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 7));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: selectedBusiness?.currency || 'USD',
    }).format(value);
  };

  const getDateRange = () => {
    const date = new Date(selectedDate + '-01');
    switch (period) {
      case 'month':
        return {
          start: startOfMonth(date),
          end: endOfMonth(date),
        };
      case 'quarter':
        const quarterStart = new Date(date.getFullYear(), Math.floor(date.getMonth() / 3) * 3, 1);
        const quarterEnd = new Date(quarterStart.getFullYear(), quarterStart.getMonth() + 3, 0);
        return { start: quarterStart, end: quarterEnd };
      case 'year':
        return {
          start: new Date(date.getFullYear(), 0, 1),
          end: new Date(date.getFullYear(), 11, 31),
        };
      default:
        return { start: startOfMonth(date), end: endOfMonth(date) };
    }
  };

  const { start, end } = getDateRange();
  const filteredTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate >= start && transactionDate <= end;
  });

  const generateProfitLossData = () => {
    const income = filteredTransactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = filteredTransactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const profit = income - expenses;

    return { income, expenses, profit };
  };

  const generateCashFlowData = () => {
    const monthlyData = new Map();
    
    for (let i = 11; i >= 0; i--) {
      const month = subMonths(new Date(), i);
      const monthKey = format(month, 'yyyy-MM');
      monthlyData.set(monthKey, {
        month: format(month, 'MMM yyyy'),
        inflow: 0,
        outflow: 0,
      });
    }

    transactions.forEach(transaction => {
      const monthKey = format(new Date(transaction.date), 'yyyy-MM');
      const data = monthlyData.get(monthKey);
      if (data) {
        if (transaction.type === 'INCOME') {
          data.inflow += transaction.amount;
        } else {
          data.outflow += Math.abs(transaction.amount);
        }
      }
    });

    return Array.from(monthlyData.values());
  };

  const generateExpensesByCategoryData = () => {
    const categoryTotals = new Map();
    
    filteredTransactions
      .filter(t => t.type === 'EXPENSE')
      .forEach(transaction => {
        const categoryName = (transaction as any).category?.name || 'Uncategorized';
        const currentTotal = categoryTotals.get(categoryName) || 0;
        categoryTotals.set(categoryName, currentTotal + Math.abs(transaction.amount));
      });

    return Array.from(categoryTotals.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  const generateIncomeBySourceData = () => {
    const sourceTotals = new Map();
    
    filteredTransactions
      .filter(t => t.type === 'INCOME')
      .forEach(transaction => {
        const sourceName = (transaction as any).category?.name || 'Other Income';
        const currentTotal = sourceTotals.get(sourceName) || 0;
        sourceTotals.set(sourceName, currentTotal + transaction.amount);
      });

    return Array.from(sourceTotals.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  const exportToPDF = () => {
    // In a real implementation, you would use a library like jsPDF
    alert('PDF export functionality would be implemented here');
  };

  const exportToCSV = () => {
    let csvContent = '';
    let data = [];

    switch (reportType) {
      case 'profit_loss':
        const plData = generateProfitLossData();
        csvContent = 'Type,Amount\n';
        csvContent += `Income,${plData.income}\n`;
        csvContent += `Expenses,${plData.expenses}\n`;
        csvContent += `Profit,${plData.profit}\n`;
        break;
      case 'cash_flow':
        data = generateCashFlowData();
        csvContent = 'Month,Inflow,Outflow\n';
        data.forEach(row => {
          csvContent += `${row.month},${row.inflow},${row.outflow}\n`;
        });
        break;
      case 'expenses_category':
        data = generateExpensesByCategoryData();
        csvContent = 'Category,Amount\n';
        data.forEach(row => {
          csvContent += `${row.name},${row.value}\n`;
        });
        break;
      case 'income_source':
        data = generateIncomeBySourceData();
        csvContent = 'Source,Amount\n';
        data.forEach(row => {
          csvContent += `${row.name},${row.value}\n`;
        });
        break;
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}-${selectedDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const renderReport = () => {
    switch (reportType) {
      case 'profit_loss':
        const plData = generateProfitLossData();
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 text-center">
                <h3 className="text-lg font-semibold text-green-600">Total Income</h3>
                <p className="text-3xl font-bold text-green-700">{formatCurrency(plData.income)}</p>
              </Card>
              <Card className="p-6 text-center">
                <h3 className="text-lg font-semibold text-red-600">Total Expenses</h3>
                <p className="text-3xl font-bold text-red-700">{formatCurrency(plData.expenses)}</p>
              </Card>
              <Card className="p-6 text-center">
                <h3 className="text-lg font-semibold text-primary-600">Net Profit</h3>
                <p className={`text-3xl font-bold ${plData.profit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {formatCurrency(plData.profit)}
                </p>
              </Card>
            </div>
          </div>
        );

      case 'cash_flow':
        const cashFlowData = generateCashFlowData();
        return (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashFlowData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={formatCurrency} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="inflow" fill="#10B981" name="Inflow" />
                <Bar dataKey="outflow" fill="#EF4444" name="Outflow" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );

      case 'expenses_category':
        const expensesData = generateExpensesByCategoryData();
        const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
        return (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expensesData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {expensesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        );

      case 'income_source':
        const incomeData = generateIncomeBySourceData();
        return (
          <div className="space-y-4">
            {incomeData.map((source, index) => (
              <Card key={source.name} className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">{source.name}</h3>
                  <span className="text-lg font-semibold text-green-600">
                    {formatCurrency(source.value)}
                  </span>
                </div>
                <div className="mt-2 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{
                      width: `${(source.value / Math.max(...incomeData.map(s => s.value))) * 100}%`
                    }}
                  />
                </div>
              </Card>
            ))}
          </div>
        );

      default:
        return null;
    }
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
          <h1 className="text-2xl font-bold text-gray-900">Financial Reports</h1>
          <p className="text-gray-600">
            Generate comprehensive financial reports for {selectedBusiness?.name}
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={exportToPDF}>
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Report Controls */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Report Type
            </label>
            <select
              className="input"
              value={reportType}
              onChange={(e) => setReportType(e.target.value as any)}
            >
              <option value="profit_loss">Profit & Loss Statement</option>
              <option value="cash_flow">Cash Flow Statement</option>
              <option value="expenses_category">Expenses by Category</option>
              <option value="income_source">Income by Source</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Period
            </label>
            <select
              className="input"
              value={period}
              onChange={(e) => setPeriod(e.target.value as any)}
            >
              <option value="month">Month</option>
              <option value="quarter">Quarter</option>
              <option value="year">Year</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="month"
              className="input"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Report Content */}
      <Card className="p-6">
        <div className="flex items-center mb-6">
          <FileBarChart className="w-6 h-6 text-primary-600 mr-3" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {reportType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </h2>
            <p className="text-sm text-gray-600">
              {format(start, 'MMM dd, yyyy')} - {format(end, 'MMM dd, yyyy')}
            </p>
          </div>
        </div>

        {renderReport()}
      </Card>
    </motion.div>
  );
}