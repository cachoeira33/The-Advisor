import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  try {
    const signature = req.headers.get('stripe-signature')
    const body = await req.text()
    
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // In a real implementation, you would verify the webhook signature here
    // For demo purposes, we'll parse the event directly
    const event = JSON.parse(body)

    console.log('Received Stripe webhook:', event.type)

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionChange(supabase, event.data.object)
        break
        
      case 'customer.subscription.deleted':
        await handleSubscriptionCanceled(supabase, event.data.object)
        break
        
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(supabase, event.data.object)
        break
        
      case 'invoice.payment_failed':
        await handlePaymentFailed(supabase, event.data.object)
        break
        
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: 'Webhook processing failed' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

async function handleSubscriptionChange(supabase: any, subscription: any) {
  const { error } = await supabase
    .from('accounts')
    .update({
      subscription_status: subscription.status.toUpperCase(),
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_customer_id', subscription.customer)

  if (error) {
    console.error('Failed to update subscription:', error)
    throw error
  }
}

async function handleSubscriptionCanceled(supabase: any, subscription: any) {
  const { error } = await supabase
    .from('accounts')
    .update({
      subscription_status: 'CANCELED',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_customer_id', subscription.customer)

  if (error) {
    console.error('Failed to cancel subscription:', error)
    throw error
  }
}

async function handlePaymentSucceeded(supabase: any, invoice: any) {
  console.log('Payment succeeded for invoice:', invoice.id)
  
  // Update account status to active if it was past due
  const { error } = await supabase
    .from('accounts')
    .update({
      subscription_status: 'ACTIVE',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_customer_id', invoice.customer)

  if (error) {
    console.error('Failed to update payment status:', error)
  }
}

async function handlePaymentFailed(supabase: any, invoice: any) {
  console.log('Payment failed for invoice:', invoice.id)
  
  const { error } = await supabase
    .from('accounts')
    .update({
      subscription_status: 'PAST_DUE',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_customer_id', invoice.customer)

  if (error) {
    console.error('Failed to update payment failure:', error)
  }
}