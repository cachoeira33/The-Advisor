import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../config/supabase';
import { Transaction } from '../types';

// Interface para os filtros, definida uma única vez.
export interface TransactionFilters {
  search?: string;
  type?: 'ALL' | 'INCOME' | 'EXPENSE';
  category_id?: string;
  date_from?: string;
  date_to?: string;
  amount_min?: string;
  amount_max?: string;
}

// Única declaração da função do hook.
export function useTransactions(businessId?: string, filters?: TransactionFilters) {
  const queryClient = useQueryClient();

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

      // Aplica os filtros (bloco único, sem repetição)
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
        query = query.gte('amount', parseFloat(filters.amount_min));
      }
      if (filters?.amount_max) {
        query = query.lte('amount', parseFloat(filters.amount_max));
      }

      query = query.order('date', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
    enabled: !!businessId,
  });

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

  const deleteTransactionMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', businessId] });
    },
  });

  const importTransactionsMutation = useMutation({
    mutationFn: async (file: File) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim() !== ''); // Ignora linhas vazias
      if (lines.length < 2) return { count: 0 }; // Se não houver dados

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const transactionsToInsert = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        if (values.length >= 3) {
            const amount = parseFloat(values[headers.indexOf('amount')] || values[1]);
            if (isNaN(amount)) continue; // Pula linhas com valor inválido

            const transaction = {
              business_id: businessId,
              description: values[headers.indexOf('description')] || values[0],
              amount: amount,
              date: new Date(values[headers.indexOf('date')] || values[2]).toISOString(),
              type: amount > 0 ? 'INCOME' : 'EXPENSE',
              currency: 'USD', // Pode ser melhorado para detectar a moeda
            };
            transactionsToInsert.push(transaction);
        }
      }

      if (transactionsToInsert.length > 0) {
        const { error } = await supabase.from('transactions').insert(transactionsToInsert);
        if (error) throw error;
      }
      
      return { count: transactionsToInsert.length };
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