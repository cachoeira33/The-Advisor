import express from 'express';
import { z } from 'zod';
import { supabase } from '../config/supabase.js';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth.js';
import { asyncHandler, createError } from '../middleware/errorHandler.js';

const router = express.Router();

const createBusinessSchema = z.object({
  name: z.string().min(1),
  industry: z.string().min(1),
  currency: z.string().length(3).default('USD'),
  fiscal_year_start: z.number().min(1).max(12).default(1),
});

const updateBusinessSchema = createBusinessSchema.partial();

// Get user's businesses
router.get('/', authenticateToken, asyncHandler(async (req: AuthRequest, res: express.Response) => {
  if (!req.user) {
    throw createError('User not authenticated', 401);
  }

  const { data: businesses, error } = await supabase
    .from('businesses')
    .select(`
      *,
      user_business_roles!inner(role),
      accounts(name, plan_type)
    `)
    .eq('user_business_roles.user_id', req.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    throw createError('Failed to fetch businesses', 500);
  }

  res.json(businesses);
}));

// Create business
router.post('/', authenticateToken, asyncHandler(async (req: AuthRequest, res: express.Response) => {
  if (!req.user) {
    throw createError('User not authenticated', 401);
  }

  const businessData = createBusinessSchema.parse(req.body);

  // Get user's account
  const { data: userProfile, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', req.user.id)
    .single();

  if (userError || !userProfile) {
    throw createError('User profile not found', 404);
  }

  // Get or create account
  let { data: account, error: accountError } = await supabase
    .from('accounts')
    .select('*')
    .limit(1)
    .single();

  if (accountError || !account) {
    // Create account if it doesn't exist
    const { data: newAccount, error: createAccountError } = await supabase
      .from('accounts')
      .insert([
        {
          name: `${userProfile.full_name}'s Account`,
          slug: userProfile.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-'),
          plan_type: 'FREE',
          subscription_status: 'ACTIVE',
        },
      ])
      .select()
      .single();

    if (createAccountError) {
      throw createError('Failed to create account', 500);
    }
    account = newAccount;
  }

  // Create business
  const { data: business, error: businessError } = await supabase
    .from('businesses')
    .insert([
      {
        ...businessData,
        account_id: account.id,
      },
    ])
    .select()
    .single();

  if (businessError) {
    throw createError('Failed to create business', 500);
  }

  // Assign owner role
  const { error: roleError } = await supabase
    .from('user_business_roles')
    .insert([
      {
        user_id: req.user.id,
        business_id: business.id,
        account_id: account.id,
        role: 'OWNER',
        accepted_at: new Date().toISOString(),
      },
    ]);

  if (roleError) {
    throw createError('Failed to assign business role', 500);
  }

  res.status(201).json(business);
}));

// Update business
router.put('/:id', 
  authenticateToken, 
  requireRole(['OWNER', 'ADMIN']), 
  asyncHandler(async (req: AuthRequest, res: express.Response) => {
    const businessId = req.params.id;
    const updates = updateBusinessSchema.parse(req.body);

    const { data: business, error } = await supabase
      .from('businesses')
      .update(updates)
      .eq('id', businessId)
      .select()
      .single();

    if (error) {
      throw createError('Failed to update business', 500);
    }

    if (!business) {
      throw createError('Business not found', 404);
    }

    res.json(business);
  })
);

export { router as businessRoutes };