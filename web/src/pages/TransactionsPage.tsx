import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Plus, Upload, Filter, Download, Edit, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { TransactionTable } from '../components/dashboard/TransactionTable';
import { Modal } from '../components/ui/Modal';
import { TransactionModal } from '../components/transactions/TransactionModal';
import { TransactionFiltersComponent, TransactionFilters } from '../components/transactions/TransactionFilters';
import { useTransactions, TransactionFilters as TFilters } from '../hooks/useTransactions';
import { useBusiness } from '../hooks/useBusiness';
import { Transaction } from '../types';
import toast from 'react-hot-toast';

export function TransactionsPage() {
  const { t } = useTranslation();
  const { selectedBusiness } = useBusiness();
  const [filters, setFilters] = useState<TransactionFilters>({
    search: '',
    type: 'ALL',
    category_id: '',
    date_from: '',
    date_to: '',
    amount_min: '',
    amount_max: '',
  });
  
  const { 
    transactions, 
    isLoading, 
    createTransaction, 
    updateTransaction, 
    deleteTransaction,
    importTransactions,
    isCreating,
    isUpdating,
    isDeleting,
    isImporting
  } = useTransactions(selectedBusiness?.id, filters);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const handleCreateTransaction = async (data: any) => {
    try {
      await createTransaction(data);
      toast.success('Transaction created successfully');
      setIsAddModalOpen(false);
    } catch (error) {
      toast.error('Failed to create transaction');
    }
  };

  const handleUpdateTransaction = async (data: any) => {
    if (!editingTransaction) return;
    
    try {
      await updateTransaction({ id: editingTransaction.id, ...data });
      toast.success('Transaction updated successfully');
      setEditingTransaction(null);
    } catch (error) {
      toast.error('Failed to update transaction');
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return;
    }
    
    try {
      await deleteTransaction(id);
      toast.success('Transaction deleted successfully');
    } catch (error) {
      toast.error('Failed to delete transaction');
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      await importTransactions(file);
      toast.success('Transactions imported successfully');
      setIsImportModalOpen(false);
    } catch (error) {
      toast.error('Failed to import transactions');
    }
  };

  const handleExport = () => {
    if (transactions.length === 0) {
      toast.error('No transactions to export');
      return;
    }

    const csvContent = [
      ['Date', 'Description', 'Amount', 'Type', 'Category'].join(','),
      ...transactions.map(t => [
        new Date(t.date).toLocaleDateString(),
        `"${t.description}"`,
        t.amount,
        t.type,
        (t as any).category?.name || 'Uncategorized'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      type: 'ALL',
      category_id: '',
      date_from: '',
      date_to: '',
      amount_min: '',
      amount_max: '',
    });
  };
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('transactions.title')}</h1>
          <p className="text-gray-600">
            Manage all transactions for {selectedBusiness?.name || 'your business'}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => setIsImportModalOpen(true)}
            loading={isImporting}
          >
            <Upload className="w-4 h-4 mr-2" />
            {t('transactions.import')}
          </Button>
          
          <Button
            variant="outline"
            onClick={handleExport}
          >
            <Download className="w-4 h-4 mr-2" />
            {t('transactions.export')}
          </Button>
          
          <Button
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('transactions.add')}
          </Button>
        </div>
      </div>

      <TransactionFiltersComponent
        filters={filters}
        onFiltersChange={setFilters}
        businessId={selectedBusiness?.id || ''}
        onClearFilters={clearFilters}
      />

      <TransactionTable 
        transactions={transactions} 
        onEdit={setEditingTransaction}
        onDelete={handleDeleteTransaction}
        loading={isLoading}
      />

      <TransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateTransaction}
        businessId={selectedBusiness?.id || ''}
        loading={isCreating}
      />

      <TransactionModal
        isOpen={!!editingTransaction}
        onClose={() => setEditingTransaction(null)}
        onSubmit={handleUpdateTransaction}
        transaction={editingTransaction || undefined}
        businessId={selectedBusiness?.id || ''}
        loading={isUpdating}
      />

      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title={t('transactions.import')}
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Upload a CSV file with columns: Description, Amount, Date
          </p>
          <input
            type="file"
            accept=".csv"
            onChange={handleImport}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
          />
        </div>
      </Modal>
    </motion.div>
  );
}