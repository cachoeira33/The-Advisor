import React from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Filter, Calendar, DollarSign } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { useCategories } from '../../hooks/useCategories';

export interface TransactionFilters {
  search: string;
  type: 'ALL' | 'INCOME' | 'EXPENSE';
  category_id: string;
  date_from: string;
  date_to: string;
  amount_min: string;
  amount_max: string;
}

interface TransactionFiltersProps {
  filters: TransactionFilters;
  onFiltersChange: (filters: TransactionFilters) => void;
  businessId: string;
  onClearFilters: () => void;
}

export function TransactionFiltersComponent({
  filters,
  onFiltersChange,
  businessId,
  onClearFilters,
}: TransactionFiltersProps) {
  const { t } = useTranslation();
  const { categories } = useCategories(businessId);

  const handleFilterChange = (key: keyof TransactionFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== '' && value !== 'ALL'
  );

  return (
    <Card className="p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Filter className="w-5 h-5 text-gray-400 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Filters</h3>
        </div>
        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={onClearFilters}>
            Clear Filters
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Input
          placeholder="Search transactions..."
          icon={<Search className="w-4 h-4" />}
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
        />

        <div>
          <select
            className="input"
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
          >
            <option value="ALL">All Types</option>
            <option value="INCOME">{t('transactions.income')}</option>
            <option value="EXPENSE">{t('transactions.expense')}</option>
          </select>
        </div>

        <div>
          <select
            className="input"
            value={filters.category_id}
            onChange={(e) => handleFilterChange('category_id', e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex space-x-2">
          <Input
            type="date"
            placeholder="From"
            value={filters.date_from}
            onChange={(e) => handleFilterChange('date_from', e.target.value)}
          />
          <Input
            type="date"
            placeholder="To"
            value={filters.date_to}
            onChange={(e) => handleFilterChange('date_to', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="flex space-x-2">
          <Input
            type="number"
            placeholder="Min amount"
            step="0.01"
            value={filters.amount_min}
            onChange={(e) => handleFilterChange('amount_min', e.target.value)}
          />
          <Input
            type="number"
            placeholder="Max amount"
            step="0.01"
            value={filters.amount_max}
            onChange={(e) => handleFilterChange('amount_max', e.target.value)}
          />
        </div>
      </div>
    </Card>
  );
}