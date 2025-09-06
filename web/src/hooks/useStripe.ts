import { useState } from 'react';
import { supabase } from '../config/supabase';
import toast from 'react-hot-toast';

export function useStripe() {
  const [loading, setLoading] = useState(false);

  const createCheckoutSession = async (priceId: string) => {
    try {
      setLoading(true);
      
      // FORMA CORRETA DE PEGAR O TOKEN
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error('User is not authenticated or session has expired.');
      }
      const accessToken = session.access_token;

      // Create checkout session via your API
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`, // Usando o token correto
        },
        body: JSON.stringify({
          priceId,
          successUrl: `${window.location.origin}/dashboard?success=true`,
          cancelUrl: `${window.location.origin}/pricing?canceled=true`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();
      
      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to start checkout process');
    } finally {
      setLoading(false);
    }
  };

  const createPortalSession = async () => {
    try {
      setLoading(true);
      
      // FORMA CORRETA DE PEGAR O TOKEN
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error('User is not authenticated or session has expired.');
      }
      const accessToken = session.access_token;

      const response = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`, // Usando o token correto
        },
        body: JSON.stringify({
          returnUrl: `${window.location.origin}/dashboard/settings`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create portal session');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Portal error:', error);
      toast.error('Failed to open billing portal');
    } finally {
      setLoading(false);
    }
  };

  return {
    createCheckoutSession,
    createPortalSession,
    loading,
  };
}