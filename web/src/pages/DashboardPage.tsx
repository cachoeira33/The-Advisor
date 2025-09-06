import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  CreditCard
} from 'lucide-react';
import { MetricCard } from '../components/dashboard/MetricCard';
import { TransactionTable } from '../components/dashboard/TransactionTable';
import { useTransactions } from '../hooks/useTransactions';
import { useBusiness } from '../hooks/useBusiness';

export function DashboardPage() {
  const { t } = useTranslation();

  // ===================================================================
  // CORREÇÃO: TODOS OS HOOKS SÃO CHAMADOS NO TOPO, INCONDICIONALMENTE
  // ===================================================================
  const { selectedBusiness, isLoading: isBusinessLoading } = useBusiness();
  
  // O hook useTransactions é chamado aqui, mas só vai fazer a busca
  // de dados quando selectedBusiness.id estiver disponível, graças
  // à opção "enabled: !!businessId" que já existe no seu hook.
  const { data: transactions = [], isLoading: isTransactionsLoading } = useTransactions(selectedBusiness?.id);
  // ===================================================================

  // A lógica de carregamento agora verifica os dois hooks
  if (isBusinessLoading || isTransactionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  // Se o negócio não existir após o carregamento, exibe uma mensagem
  if (!selectedBusiness) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600">
        You don't have a business selected. Please go to settings to create one.
      </div>
    );
  }

  // Calculate metrics from transactions
  const totalRevenue = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const profit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: selectedBusiness?.currency || 'USD',
    }).format(amount);
  };

  const metrics = [
    {
      title: t('dashboard.revenue'),
      value: formatCurrency(totalRevenue),
      change: { value: '+12.5%', trend: 'up' as const },
      icon: DollarSign,
      iconColor: 'text-green-600',
    },
    {
      title: t('dashboard.expenses'),
      value: formatCurrency(totalExpenses),
      change: { value: '+5.2%', trend: 'up' as const },
      icon: TrendingDown,
      iconColor: 'text-red-600',
    },
    {
      title: t('dashboard.profit'),
      value: formatCurrency(profit),
      change: { value: '+18.3%', trend: 'up' as const },
      icon: TrendingUp,
      iconColor: 'text-primary-600',
    },
    {
      title: t('dashboard.profitMargin'),
      value: `${profitMargin.toFixed(1)}%`,
      change: { value: '+2.1%', trend: 'up' as const },
      icon: Activity,
      iconColor: 'text-accent-600',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.title')}</h1>
        <p className="text-gray-600">
          Welcome back! Here's what's happening with {selectedBusiness?.name || 'your business'}.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="dashboard-grid"
      >
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 + index * 0.05 }}
          >
            <MetricCard {...metric} />
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <TransactionTable transactions={transactions.slice(0, 10)} />
      </motion.div>
    </motion.div>
  );
}