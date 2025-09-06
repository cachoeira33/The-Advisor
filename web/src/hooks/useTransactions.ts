import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../config/supabase';
import { Transaction } from '../types';

export function useTransactions(businessId?: string) {
  const queryClient = useQueryClient();

  // CORRIGIDO PARA A SINTAXE DE OBJETO
  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ['transactions', businessId],
    queryFn: async () => {
      if (!businessId) return [];
      
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          category:categories(name, color)
        `)
        .eq('business_id', businessId)
        .order('date', { ascending: false });

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
      const formData = new FormData();
      formData.append('file', file);
      formData.append('business_id', businessId!);

      const response = await fetch('/api/transactions/import', {
        method: 'POST',
        // 'Authorization' header might be needed here if this route is protected
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Import failed');
      }

      return response.json();
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
    isCreating: createTransactionMutation.isLoading,
    isUpdating: updateTransactionMutation.isLoading,
    isDeleting: deleteTransactionMutation.isLoading,
    isImporting: importTransactionsMutation.isLoading,
  };
}