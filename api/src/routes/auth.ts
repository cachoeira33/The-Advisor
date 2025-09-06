import express from 'express';
import { z } from 'zod';
import { supabase } from '../config/supabase.js';
import { asyncHandler, createError } from '../middleware/errorHandler.js';
import { authRateLimiterMiddleware } from '../middleware/rateLimiter.js';

const router = express.Router();

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Rate limit auth endpoints
router.use(authRateLimiterMiddleware);

router.post('/signup', asyncHandler(async (req: express.Request, res: express.Response) => {
  const { email, password, fullName } = signupSchema.parse(req.body);

  // Check if user already exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();

  if (existingUser) {
    throw createError('User already exists', 400);
  }

  // Create user with Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    user_metadata: {
      full_name: fullName,
    },
    email_confirm: false, // Skip email confirmation for development
  });

  if (authError) {
    throw createError(authError.message, 400);
  }

  // Create user profile
  const { error: profileError } = await supabase
    .from('users')
    .insert([
      {
        id: authData.user.id,
        email,
        full_name: fullName,
        language: 'en',
        timezone: 'UTC',
      },
    ]);

  if (profileError) {
    throw createError('Failed to create user profile', 500);
  }

  // Create default account
  const { data: account, error: accountError } = await supabase
    .from('accounts')
    .insert([
      {
        name: `${fullName}'s Account`,
        slug: email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-'),
        plan_type: 'FREE',
        subscription_status: 'ACTIVE',
      },
    ])
    .select()
    .single();

  if (accountError) {
    throw createError('Failed to create account', 500);
  }

  res.status(201).json({
    message: 'User created successfully',
    user: {
      id: authData.user.id,
      email: authData.user.email,
      full_name: fullName,
    },
    account,
  });
}));

router.post('/login', asyncHandler(async (req: express.Request, res: express.Response) => {
  const { email, password } = loginSchema.parse(req.body);

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw createError('Invalid credentials', 401);
  }

  // Update last login
  await supabase
    .from('users')
    .update({ last_login_at: new Date().toISOString() })
    .eq('id', data.user.id);

  res.json({
    message: 'Login successful',
    user: data.user,
    session: data.session,
  });
}));

router.post('/logout', asyncHandler(async (_req: express.Request, res: express.Response) => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw createError('Logout failed', 500);
  }

  res.json({ message: 'Logout successful' });
}));

export { router as authRoutes };