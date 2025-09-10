import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import { Edit3, Plus, Save, TrendingUp, DollarSign, CreditCard, TrendingDown, Activity } from 'lucide-react';
import { QuickActions, commonQuickActions } from '../components/common/QuickActions';
import { TransactionTable } from '../components/dashboard/TransactionTable';
import { StatsCard } from '../components/common/StatsCard';
import { DashboardWidget, WidgetConfig } from '../components/dashboard/DashboardWidget';
import { WidgetSelector } from '../components/dashboard/WidgetSelector';
import { BalanceChart } from '../components/dashboard/charts/BalanceChart';
import { RevenueExpensesChart } from '../components/dashboard/charts/RevenueExpensesChart';
import { ExpensesCategoryChart } from '../components/dashboard/charts/ExpensesCategoryChart';
import { Button } from '../components/ui/Button';
import { useTransactions } from '../hooks/useTransactions';
import { useBusiness } from '../hooks/useBusiness';
import { supabase } from '../config/supabase';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const ResponsiveGridLayout = WidthProvider(Responsive);

export function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);
  const [isWidgetSelectorOpen, setIsWidgetSelectorOpen] = useState(false);
  const [widgets, setWidgets] = useState<WidgetConfig[]>([]);
  const [layouts, setLayouts] = useState<{ [key: string]: Layout[] }>({});
  const [isSaving, setIsSaving] = useState(false);

  // ===================================================================
  // CORREÇÃO: TODOS OS HOOKS SÃO CHAMADOS NO TOPO, INCONDICIONALMENTE
  // ===================================================================
  const { selectedBusiness, isLoading: isBusinessLoading } = useBusiness();
  
  // O hook useTransactions é chamado aqui, mas só vai fazer a busca
  // de dados quando selectedBusiness.id estiver disponível, graças
  // à opção "enabled: !!businessId" que já existe no seu hook.
  const { transactions = [], isLoading: isTransactionsLoading } = useTransactions(selectedBusiness?.id);
  // ===================================================================

  // Load dashboard layout on mount
  useEffect(() => {
    if (user && selectedBusiness) {
      loadDashboardLayout();
    }
  }, [user, selectedBusiness]);

  const loadDashboardLayout = async () => {
    try {
      const { data, error } = await supabase
        .from('dashboard_layouts')
        .select('*')
        .eq('user_id', user!.id)
        .eq('business_id', selectedBusiness!.id)
        .single();

      if (data && !error) {
        setWidgets(data.widgets || getDefaultWidgets());
        setLayouts(data.layouts || {});
      } else {
        // Set default widgets if no layout exists
        setWidgets(getDefaultWidgets());
      }
    } catch (error) {
      console.error('Error loading dashboard layout:', error);
      setWidgets(getDefaultWidgets());
    }
  };

  const getDefaultWidgets = (): WidgetConfig[] => [
    {
      id: 'revenue-card',
      type: 'metric',
      title: 'Revenue',
      component: MetricCard,
      defaultW: 3,
      defaultH: 2,
    },
    {
      id: 'expenses-card',
      type: 'metric',
      title: 'Expenses',
      component: MetricCard,
      defaultW: 3,
      defaultH: 2,
    },
    {
      id: 'profit-card',
      type: 'metric',
      title: 'Profit',
      component: MetricCard,
      defaultW: 3,
      defaultH: 2,
    },
    {
      id: 'profit-margin-card',
      type: 'metric',
      title: 'Profit Margin',
      component: MetricCard,
      defaultW: 3,
      defaultH: 2,
    },
    {
      id: 'recent-transactions',
      type: 'table',
      title: 'Recent Transactions',
      component: TransactionTable,
      defaultW: 12,
      defaultH: 6,
    },
    {
    type: 'actions',
    title: 'Quick Actions',
    component: () => null,
    defaultW: 6,
    defaultH: 3,
    minW: 4,
    minH: 2,
    },
  ];

  const saveDashboardLayout = async () => {
    if (!user || !selectedBusiness) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('dashboard_layouts')
        .upsert({
          user_id: user.id,
          business_id: selectedBusiness.id,
          widgets,
          layouts,
        });

      if (error) throw error;
      toast.success('Dashboard layout saved!');
    } catch (error) {
      console.error('Error saving dashboard layout:', error);
      toast.error('Failed to save dashboard layout');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLayoutChange = (layout: Layout[], layouts: { [key: string]: Layout[] }) => {
    setLayouts(layouts);
  };

  const handleAddWidget = (widget: WidgetConfig) => {
    setWidgets(prev => [...prev, widget]);
  };

  const handleRemoveWidget = (widgetId: string) => {
    setWidgets(prev => prev.filter(w => w.id !== widgetId));
  };
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

  const getWidgetComponent = (widget: WidgetConfig) => {
    switch (widget.id) {
      case 'revenue-card':
        return (
          <StatsCard
            title={t('dashboard.revenue')}
            value={formatCurrency(totalRevenue)}
            change={{ value: '+12.5%', trend: 'up' as const }}
            icon={DollarSign}
            iconColor="text-green-600"
            loading={isTransactionsLoading}
          />
        );
      case 'expenses-card':
        return (
          <StatsCard
            title={t('dashboard.expenses')}
            value={formatCurrency(totalExpenses)}
            change={{ value: '+5.2%', trend: 'up' as const }}
            icon={TrendingDown}
            iconColor="text-red-600"
            loading={isTransactionsLoading}
          />
        );
      case 'profit-card':
        return (
          <StatsCard
            title={t('dashboard.profit')}
            value={formatCurrency(profit)}
            change={{ value: '+18.3%', trend: 'up' as const }}
            icon={TrendingUp}
            iconColor="text-primary-600"
            loading={isTransactionsLoading}
          />
        );
      case 'profit-margin-card':
        return (
          <StatsCard
            title={t('dashboard.profitMargin')}
            value={`${profitMargin.toFixed(1)}%`}
            change={{ value: '+2.1%', trend: 'up' as const }}
            icon={Activity}
            iconColor="text-accent-600"
            loading={isTransactionsLoading}
          />
        );
      case 'quick-actions':
        return (
          <QuickActions
            actions={quickActions}
            title="Quick Actions"
        />
        );
        
      case 'recent-transactions':
        return (
          <TransactionTable 
            transactions={transactions.slice(0, 10)} 
            loading={isTransactionsLoading}
          />
        );
      default:
        if (widget.title.includes('Balance Evolution')) {
          return <BalanceChart transactions={transactions} timeframe="30d" />;
        }
        if (widget.title.includes('Revenue vs Expenses')) {
          return <RevenueExpensesChart transactions={transactions} />;
        }
        if (widget.title.includes('Expenses by Category')) {
          return <ExpensesCategoryChart transactions={transactions} />;
        }
        return <div className="p-4 text-center text-gray-500">Widget not implemented</div>;
    }
  };

  const generateLayout = () => {
    return widgets.map((widget, index) => ({
      i: widget.id,
      x: (index * (widget.defaultW || 3)) % 12,
      y: Math.floor((index * (widget.defaultW || 3)) / 12) * (widget.defaultH || 2),
      w: widget.defaultW || 3,
      h: widget.defaultH || 2,
      minW: widget.minW || 2,
      minH: widget.minH || 2,
    }));
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
          <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.title')}</h1>
          <p className="text-gray-600">
            Welcome back! Here's what's happening with {selectedBusiness?.name || 'your business'}.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {isEditMode && (
            <>
              <Button
                variant="outline"
                onClick={() => setIsWidgetSelectorOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Widget
              </Button>
              <Button
                onClick={saveDashboardLayout}
                loading={isSaving}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Layout
              </Button>
            </>
          )}
          <Button
            variant={isEditMode ? 'primary' : 'outline'}
            onClick={() => setIsEditMode(!isEditMode)}
          >
            <Edit3 className="w-4 h-4 mr-2" />
            {isEditMode ? 'Exit Edit' : 'Edit Dashboard'}
          </Button>
        </div>
      </div>

      <div className="min-h-96">
        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          onLayoutChange={handleLayoutChange}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={60}
          isDraggable={isEditMode}
          isResizable={isEditMode}
          margin={[16, 16]}
        >
          {widgets.map((widget) => (
            <div key={widget.id}>
              <DashboardWidget
                widget={widget}
                isEditMode={isEditMode}
                onRemove={handleRemoveWidget}
              >
                {getWidgetComponent(widget)}
              </DashboardWidget>
            </div>
          ))}
        </ResponsiveGridLayout>
      </div>

      <WidgetSelector
        isOpen={isWidgetSelectorOpen}
        onClose={() => setIsWidgetSelectorOpen(false)}
        onAddWidget={handleAddWidget}
      />
    </motion.div>
  );
}