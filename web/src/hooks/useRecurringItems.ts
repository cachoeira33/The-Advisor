import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../config/supabase';

export interface RecurringItem {
  id: string;
  business_id: string;
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  frequency: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  created_at: string;
  updated_at: string;
}

export function useRecurringItems(businessId?: string) {
  const queryClient = useQueryClient();

  const { data: recurringItems = [], isLoading } = useQuery<RecurringItem[]>({
    queryKey: ['recurringItems', businessId],
    queryFn: async () => {
      if (!businessId) return [];
      
      const { data, error } = await supabase
        .from('recurring_items')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!businessId,
  });

  const createRecurringItemMutation = useMutation({
    mutationFn: async (item: Partial<RecurringItem>) => {
      const { data, error } = await supabase
        .from('recurring_items')
        .insert([item])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurringItems', businessId] });
    },
  });

  const updateRecurringItemMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<RecurringItem> & { id: string }) => {
      const { data, error } = await supabase
        .from('recurring_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurringItems', businessId] });
    },
  });

  const deleteRecurringItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('recurring_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurringItems', businessId] });
    },
  });

  return {
    recurringItems,
    isLoading,
    createRecurringItem: createRecurringItemMutation.mutate,
    updateRecurringItem: updateRecurringItemMutation.mutate,
    deleteRecurringItem: deleteRecurringItemMutation.mutate,
    isCreating: createRecurringItemMutation.isPending,
    isUpdating: updateRecurringItemMutation.isPending,
    isDeleting: deleteRecurringItemMutation.isPending,
  };
}