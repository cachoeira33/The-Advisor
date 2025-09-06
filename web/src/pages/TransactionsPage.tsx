import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Plus, Upload, Filter, Download } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { TransactionTable } from '../components/dashboard/TransactionTable';
import { Modal } from '../components/ui/Modal';
import { useTransactions } from '../hooks/useTransactions';
import { useBusiness } from '../hooks/useBusiness';

export function TransactionsPage() {
  const { t } = useTranslation();
  const { selectedBusiness } = useBusiness();
  const { transactions, isLoading } = useTransactions(selectedBusiness?.id);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

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
          >
            <Upload className="w-4 h-4 mr-2" />
            {t('transactions.import')}
          </Button>
          
          <Button
            variant="outline"
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

      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm">
          <Filter className="w-4 h-4 mr-2" />
          {t('common.filter')}
        </Button>
        
        <select className="text-sm border-gray-300 rounded-md focus:border-primary-500 focus:ring-primary-500">
          <option value="">All Categories</option>
          <option value="income">Income</option>
          <option value="expense">Expenses</option>
        </select>
        
        <select className="text-sm border-gray-300 rounded-md focus:border-primary-500 focus:ring-primary-500">
          <option value="">All Time</option>
          <option value="month">This Month</option>
          <option value="quarter">This Quarter</option>
          <option value="year">This Year</option>
        </select>
      </div>

      <TransactionTable transactions={transactions} />

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={t('transactions.add')}
      >
        <div className="text-center py-8">
          <p className="text-gray-600">Transaction form would go here</p>
        </div>
      </Modal>

      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title={t('transactions.import')}
      >
        <div className="text-center py-8">
          <p className="text-gray-600">Import functionality would go here</p>
        </div>
      </Modal>
    </motion.div>
  );
}