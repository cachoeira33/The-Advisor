import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { X, Calendar, DollarSign, Tag } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Transaction } from '../../types';
import { useCategories } from '../../hooks/useCategories';

const transactionSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  type: z.enum(['INCOME', 'EXPENSE']),
  date: z.string().min(1, 'Date is required'),
  category_id: z.string().optional(),
  reference: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TransactionFormData) => void;
  transaction?: Transaction;
  businessId: string;
  loading?: boolean;
}

export function TransactionModal({
  isOpen,
  onClose,
  onSubmit,
  transaction,
  businessId,
  loading = false,
}: TransactionModalProps) {
  const { t } = useTranslation();
  const { categories } = useCategories(businessId);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'EXPENSE',
      date: new Date().toISOString().split('T')[0],
    },
  });

  const watchedType = watch('type');

  useEffect(() => {
    if (transaction) {
      reset({
        description: transaction.description,
        amount: Math.abs(transaction.amount),
        type: transaction.type,
        date: new Date(transaction.date).toISOString().split('T')[0],
        category_id: transaction.category_id || '',
        reference: transaction.reference || '',
      });
    } else {
      reset({
        type: 'EXPENSE',
        date: new Date().toISOString().split('T')[0],
        description: '',
        amount: 0,
        category_id: '',
        reference: '',
      });
    }
  }, [transaction, reset]);

  const handleFormSubmit = (data: TransactionFormData) => {
    const formattedData = {
      ...data,
      amount: data.type === 'EXPENSE' ? -Math.abs(data.amount) : Math.abs(data.amount),
      date: new Date(data.date).toISOString(),
      business_id: businessId,
    };
    onSubmit(formattedData);
  };

  const filteredCategories = categories.filter(cat => cat.type === watchedType);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={transaction ? t('transactions.edit') : t('transactions.add')}
      size="md"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <Input
          label={t('transactions.description')}
          icon={<Tag className="w-5 h-5" />}
          error={errors.description?.message}
          {...register('description')}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label={t('transactions.amount')}
            type="number"
            step="0.01"
            icon={<DollarSign className="w-5 h-5" />}
            error={errors.amount?.message}
            {...register('amount', { valueAsNumber: true })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('transactions.type')}
            </label>
            <select
              className="input"
              {...register('type')}
            >
              <option value="INCOME">{t('transactions.income')}</option>
              <option value="EXPENSE">{t('transactions.expense')}</option>
            </select>
            {errors.type && (
              <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label={t('transactions.date')}
            type="date"
            icon={<Calendar className="w-5 h-5" />}
            error={errors.date?.message}
            {...register('date')}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('transactions.category')}
            </label>
            <select
              className="input"
              {...register('category_id')}
            >
              <option value="">Select category</option>
              {filteredCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Input
          label="Reference (Optional)"
          placeholder="Invoice number, check number, etc."
          error={errors.reference?.message}
          {...register('reference')}
        />

        <div className="flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" loading={loading}>
            {transaction ? t('common.save') : t('common.create')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}