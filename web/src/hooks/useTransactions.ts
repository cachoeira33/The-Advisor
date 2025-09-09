import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../config/supabase';
import { Transaction } from '../types';

export interface TransactionFilters {
  search?: string;
  type?: 'ALL' | 'INCOME' | 'EXPENSE';
  category_id?: string;
  date_from?: string;
  date_to?: string;
  amount_min?: string;
  amount_max?: string;
}

export function useTransactions(businessId?: string, filters?: TransactionFilters) {
  search?: string;
  type?: 'ALL' | 'INCOME' | 'EXPENSE';
  category_id?: string;
  date_from?: string;
  date_to?: string;
  amount_min?: string;
  amount_max?: string;
}

export function useTransactions(businessId?: string, filters?: TransactionFilters) {
  const queryClient = useQueryClient();

  // CORRIGIDO PARA A SINTAXE DE OBJETO
  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ['transactions', businessId, filters],
    queryFn: async () => {
      if (!businessId) return [];
      
      let query = supabase
        .from('transactions')
        .select(`
          *,
          category:categories(name, color)
        `)
        .eq('business_id', businessId);

      // Apply filters
      if (filters?.search) {
        query = query.ilike('description', `%${filters.search}%`);
      }
      
      if (filters?.type && filters.type !== 'ALL') {
        query = query.eq('type', filters.type);
      }
      
      if (filters?.category_id) {
        query = query.eq('category_id', filters.category_id);
      }
      
      if (filters?.date_from) {
        query = query.gte('date', filters.date_from);
      }
      
      if (filters?.date_to) {
        query = query.lte('date', filters.date_to);
      }
      
      if (filters?.amount_min) {
        const minAmount = parseFloat(filters.amount_min);
        query = query.gte('amount', minAmount);
      }
      
      if (filters?.amount_max) {
        const maxAmount = parseFloat(filters.amount_max);
        query = query.lte('amount', maxAmount);
      }

      query = query.order('date', { ascending: false });

      const { data, error } = await query;
      // Apply filters
      if (filters?.search) {
        query = query.ilike('description', `%${filters.search}%`);
      }
      
      if (filters?.type && filters.type !== 'ALL') {
        query = query.eq('type', filters.type);
      }
      
      if (filters?.category_id) {
        query = query.eq('category_id', filters.category_id);
      }
      
      if (filters?.date_from) {
        query = query.gte('date', filters.date_from);
      }
      
      if (filters?.date_to) {
        query = query.lte('date', filters.date_to);
      }
      
      if (filters?.amount_min) {
        const minAmount = parseFloat(filters.amount_min);
        query = query.gte('amount', minAmount);
      }
      
      if (filters?.amount_max) {
        const maxAmount = parseFloat(filters.amount_max);
        query = query.lte('amount', maxAmount);
      }

      query = query.order('date', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
    enabled: !!businessId,
  });

  // CORRIGIDO PARA A SINTAXE DE OBJETO COM "mutationFn"
  const createTransactionMutation = useMutation({
    mutationFn: async (transaction: Partial<Transaction>) => {
      const { data, error } = await supabase
        .from('transactions')
        .insert([transaction])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', businessId] });
    },
  });

  // CORRIGIDO PARA A SINTAXE DE OBJETO COM "mutationFn"
  const updateTransactionMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Transaction> & { id: string }) => {
      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', businessId] });
    },
  });

  // CORRIGIDO PARA A SINTAXE DE OBJETO COM "mutationFn"
  const deleteTransactionMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', businessId] });
    },
  });

  // CORRIGIDO PARA A SINTAXE DE OBJETO COM "mutationFn"
  const importTransactionsMutation = useMutation({
    mutationFn: async (file: File) => {
      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      // Parse CSV file
      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const transactions = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        if (values.length >= 3) {
          const transaction = {
            business_id: businessId,
            description: values[headers.indexOf('description')] || values[0],
            amount: parseFloat(values[headers.indexOf('amount')] || values[1]),
            date: new Date(values[headers.indexOf('date')] || values[2]).toISOString(),
            type: parseFloat(values[headers.indexOf('amount')] || values[1]) > 0 ? 'INCOME' : 'EXPENSE',
            currency: 'USD',
          };
          transactions.push(transaction);
        }
        if (values.length >= 3) {
          const transaction = {
            business_id: businessId,
            description: values[headers.indexOf('description')] || values[0],
            amount: parseFloat(values[headers.indexOf('amount')] || values[1]),
            date: new Date(values[headers.indexOf('date')] || values[2]).toISOString(),
            type: parseFloat(values[headers.indexOf('amount')] || values[1]) > 0 ? 'INCOME' : 'EXPENSE',
            currency: 'USD',
          };
          transactions.push(transaction);
        }
      }

      // Insert transactions
      const { data, error } = await supabase
        .from('transactions')
        .insert(transactions);

      if (error) throw error;
      return { count: transactions.length };
      const { data, error } = await supabase
        .from('transactions')
        .insert(transactions);

      if (error) throw error;
      return { count: transactions.length };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', businessId] });
    },
  });

  return {
    transactions,
    isLoading,
    createTransaction: createTransactionMutation.mutate,
    updateTransaction: updateTransactionMutation.mutate,
    deleteTransaction: deleteTransactionMutation.mutate,
    importTransactions: importTransactionsMutation.mutate,
    isCreating: createTransactionMutation.isPending,
    isUpdating: updateTransactionMutation.isPending,
    isDeleting: deleteTransactionMutation.isPending,
    isImporting: importTransactionsMutation.isPending,
  };
}