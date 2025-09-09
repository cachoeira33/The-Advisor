import { useQuery } from '@tanstack/react-query';
import { supabase } from '../config/supabase';
import { Category } from '../types';

export function useCategories(businessId?: string) {
  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ['categories', businessId],
    queryFn: async () => {
      if (!businessId) return [];
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('business_id', businessId)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!businessId,
  });

  return {
    categories,
    isLoading,
  };
}