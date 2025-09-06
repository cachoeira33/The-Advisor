import { useQuery } from '@tanstack/react-query';
import { supabase } from '../config/supabase';
import { Account } from '../types';

export function useAccount() {
  const { data: account, isLoading, isError } = useQuery<Account | null>({
    queryKey: ['account'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return null;
      }

      // Get user's account through business roles
      const { data: userRole, error } = await supabase
        .from('user_business_roles')
        .select('account_id, accounts!inner(*)')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error fetching user account:", error);
        // This tells React Query that the fetch failed
        throw new Error(error.message); 
      }

      // If userRole is null or the accounts property doesn't exist, return null
      if (!userRole || !userRole.accounts) {
        console.log("No account found for this user.");
        return null;
      }
      
      // Handle if accounts is an array or a single object
      const accountData = Array.isArray(userRole.accounts) 
        ? userRole.accounts[0] 
        : userRole.accounts;

      return accountData || null;
    }
  });

  return {
    account,
    isLoading,
    isError, // You can now use this to check for errors in your components
  };
}