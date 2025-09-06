export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  language: string;
  timezone: string;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Account {
  id: string;
  name: string;
  slug: string;
  plan_type: 'FREE' | 'BASIC' | 'PRO' | 'ENTERPRISE';
  stripe_customer_id?: string;
  subscription_status: 'ACTIVE' | 'CANCELED' | 'PAST_DUE';
  created_at: string;
  updated_at: string;
}

export interface Business {
  id: string;
  account_id: string;
  name: string;
  industry: string;
  currency: string;
  fiscal_year_start: number;
  logo_url?: string;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface UserBusinessRole {
  id: string;
  user_id: string;
  business_id: string;
  account_id: string;
  role: 'OWNER' | 'ADMIN' | 'ANALYST' | 'VIEWER';
  permissions: Record<string, any>;
  invited_by?: string;
  accepted_at?: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  business_id: string;
  description: string;
  amount: number;
  currency: string;
  category_id?: string;
  type: 'INCOME' | 'EXPENSE';
  date: string;
  reference?: string;
  tags: string[];
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  business_id: string;
  name: string;
  color: string;
  icon?: string;
  parent_id?: string;
  type: 'INCOME' | 'EXPENSE';
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export interface Budget {
  id: string;
  business_id: string;
  category_id: string;
  name: string;
  amount: number;
  period: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  start_date: string;
  end_date: string;
  alert_threshold: number;
  created_at: string;
  updated_at: string;
}

export interface Forecast {
  id: string;
  business_id: string;
  name: string;
  description?: string;
  model_type: 'LINEAR' | 'SEASONAL' | 'MONTE_CARLO';
  time_horizon: number;
  confidence_level: number;
  parameters: Record<string, any>;
  results: Record<string, any>;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ForecastScenario {
  id: string;
  forecast_id: string;
  name: string;
  description?: string;
  adjustments: Record<string, any>;
  results: Record<string, any>;
  created_at: string;
  updated_at: string;
}