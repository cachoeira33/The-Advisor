import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DollarSign, Calendar, Tag } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { RecurringItem } from '../../hooks/useRecurringItems';

const recurringItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  type: z.enum(['INCOME', 'EXPENSE']),
  frequency: z.enum(['MONTHLY', 'QUARTERLY', 'YEARLY']),
});

type RecurringItemFormData = z.infer<typeof recurringItemSchema>;

interface RecurringItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RecurringItemFormData) => void;
  item?: RecurringItem;
  businessId: string;
  loading?: boolean;
}

export function RecurringItemModal({
  isOpen,
  onClose,
  onSubmit,
  item,
  businessId,
  loading = false,
}: RecurringItemModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RecurringItemFormData>({
    resolver: zodResolver(recurringItemSchema),
    defaultValues: {
      type: 'EXPENSE',
      frequency: 'MONTHLY',
    },
  });

  useEffect(() => {
    if (item) {
      reset({
        description: item.description,
        amount: Math.abs(item.amount),
        type: item.type,
        frequency: item.frequency,
      });
    } else {
      reset({
        type: 'EXPENSE',
        frequency: 'MONTHLY',
        description: '',
        amount: 0,
      });
    }
  }, [item, reset]);

  const handleFormSubmit = (data: RecurringItemFormData) => {
    const formattedData = {
      ...data,
      amount: data.type === 'EXPENSE' ? -Math.abs(data.amount) : Math.abs(data.amount),
      business_id: businessId,
    };
    onSubmit(formattedData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={item ? 'Edit Recurring Item' : 'Add Recurring Item'}
      size="md"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <Input
          label="Description"
          icon={<Tag className="w-5 h-5" />}
          error={errors.description?.message}
          {...register('description')}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Amount"
            type="number"
            step="0.01"
            icon={<DollarSign className="w-5 h-5" />}
            error={errors.amount?.message}
            {...register('amount', { valueAsNumber: true })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              className="input"
              {...register('type')}
            >
              <option value="INCOME">Income</option>
              <option value="EXPENSE">Expense</option>
            </select>
            {errors.type && (
              <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Frequency
          </label>
          <select
            className="input"
            {...register('frequency')}
          >
            <option value="MONTHLY">Monthly</option>
            <option value="QUARTERLY">Quarterly</option>
            <option value="YEARLY">Yearly</option>
          </select>
          {errors.frequency && (
            <p className="mt-1 text-sm text-red-600">{errors.frequency.message}</p>
          )}
        </div>

        <div className="flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {item ? 'Save' : 'Create'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}