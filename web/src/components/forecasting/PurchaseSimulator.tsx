import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calculator, DollarSign, Calendar, CreditCard } from 'lucide-react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

const simulationSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  type: z.enum(['ONE_TIME', 'INSTALLMENTS']),
  installments: z.number().min(1).optional(),
  startMonth: z.number().min(0).max(11),
});

type SimulationFormData = z.infer<typeof simulationSchema>;

interface PurchaseSimulatorProps {
  forecastData: any[];
  onSimulate: (data: any[]) => void;
}

export function PurchaseSimulator({ forecastData, onSimulate }: PurchaseSimulatorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SimulationFormData>({
    resolver: zodResolver(simulationSchema),
    defaultValues: {
      type: 'ONE_TIME',
      installments: 1,
      startMonth: 0,
    },
  });

  const watchedType = watch('type');

  const handleSimulation = (data: SimulationFormData) => {
    const simulatedData = forecastData.map((month, index) => {
      let adjustment = 0;
      
      if (data.type === 'ONE_TIME' && index === data.startMonth) {
        adjustment = -data.amount;
      } else if (data.type === 'INSTALLMENTS' && data.installments) {
        const installmentAmount = data.amount / data.installments;
        if (index >= data.startMonth && index < data.startMonth + data.installments) {
          adjustment = -installmentAmount;
        }
      }

      return {
        ...month,
        originalBalance: month.balance,
        simulatedBalance: month.balance + adjustment,
        adjustment,
      };
    });

    // Recalculate cumulative balances
    let cumulativeAdjustment = 0;
    const finalData = simulatedData.map((month) => {
      cumulativeAdjustment += month.adjustment;
      return {
        ...month,
        simulatedBalance: month.originalBalance + cumulativeAdjustment,
      };
    });

    onSimulate(finalData);
    setIsExpanded(false);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Calculator className="w-6 h-6 text-primary-600 mr-3" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Purchase Simulator</h2>
            <p className="text-sm text-gray-600">Simulate the impact of a purchase on your cash flow</p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Cancel' : 'Simulate Purchase'}
        </Button>
      </div>

      {isExpanded && (
        <form onSubmit={handleSubmit(handleSimulation)} className="space-y-6">
          <Input
            label="Purchase Description"
            placeholder="e.g., New Laptop, Office Furniture"
            error={errors.description?.message}
            {...register('description')}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Total Amount"
              type="number"
              step="0.01"
              icon={<DollarSign className="w-5 h-5" />}
              error={errors.amount?.message}
              {...register('amount', { valueAsNumber: true })}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Type
              </label>
              <select
                className="input"
                {...register('type')}
              >
                <option value="ONE_TIME">One-time Payment</option>
                <option value="INSTALLMENTS">Installments</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {watchedType === 'INSTALLMENTS' && (
              <Input
                label="Number of Installments"
                type="number"
                min="1"
                max="12"
                error={errors.installments?.message}
                {...register('installments', { valueAsNumber: true })}
              />
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Month
              </label>
              <select
                className="input"
                {...register('startMonth', { valueAsNumber: true })}
              >
                {forecastData.slice(0, 12).map((month, index) => (
                  <option key={index} value={index}>
                    {month.month}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsExpanded(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              Run Simulation
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
}