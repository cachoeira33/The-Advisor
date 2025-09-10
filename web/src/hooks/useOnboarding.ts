import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '../config/supabase';

export function useOnboarding() {
  const { user } = useAuth();
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean | null>(null);
  const [userType, setUserType] = useState<'PERSONAL' | 'BUSINESS' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const checkOnboardingStatus = async () => {
      try {
        const { data: userData, error } = await supabase
          .from('users')
          .select('preferences')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user preferences:', error);
          setIsOnboardingComplete(false);
          setLoading(false);
          return;
        }

        const preferences = userData?.preferences || {};
        const onboardingComplete = preferences.onboarding_completed || false;
        const type = preferences.user_type || null;

        setIsOnboardingComplete(onboardingComplete);
        setUserType(type);
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        setIsOnboardingComplete(false);
      } finally {
        setLoading(false);
      }
    };

    checkOnboardingStatus();
  }, [user]);

  const completeOnboarding = async (type: 'PERSONAL' | 'BUSINESS') => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({
          preferences: {
            user_type: type,
            onboarding_completed: true,
          },
        })
        .eq('id', user.id);

      if (error) throw error;

      setIsOnboardingComplete(true);
      setUserType(type);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    }
  };

  return {
    isOnboardingComplete,
    userType,
    loading,
    completeOnboarding,
  };
}