# Multi-Tenant SaaS Financial Dashboard - Technical Specification

## Executive Summary

The Financial Dashboard SaaS platform is a comprehensive multi-tenant solution designed to help businesses manage their financial data, forecasting, and business intelligence. The platform supports multiple businesses per account, advanced financial analytics, subscription billing, and conversion-optimized marketing.

## Architecture Overview

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   (React/Vite)  │◄──►│   (Express/TS)  │◄──►│   (Supabase)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CDN/Assets    │    │   External APIs │    │   File Storage  │
│   (Static)      │    │   (Stripe/GA)   │    │   (Supabase)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Multi-Tenant Data Model
```
Account (1) ──── (N) Business ──── (N) Transaction
    │                   │              │
    │                   │              └── (N) Category
    │                   │
    │                   └── (N) Budget
    │                   └── (N) Forecast
    │                   └── (N) User_Business_Role
    │
    └── (N) User ──── (N) User_Business_Role
```

## Database Schema

### Core Tables

#### accounts
- `id` (uuid, PK)
- `name` (text)
- `slug` (text, unique)
- `plan_type` (enum: FREE, BASIC, PRO, ENTERPRISE)
- `stripe_customer_id` (text)
- `subscription_status` (enum: ACTIVE, CANCELED, PAST_DUE)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

#### users
- `id` (uuid, PK, references auth.users)
- `email` (text, unique)
- `full_name` (text)
- `avatar_url` (text)
- `language` (text, default 'en')
- `timezone` (text)
- `last_login_at` (timestamptz)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

#### businesses
- `id` (uuid, PK)
- `account_id` (uuid, FK → accounts.id)
- `name` (text)
- `industry` (text)
- `currency` (text, default 'USD')
- `fiscal_year_start` (integer, default 1)
- `logo_url` (text)
- `settings` (jsonb)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

#### user_business_roles
- `id` (uuid, PK)
- `user_id` (uuid, FK → users.id)
- `business_id` (uuid, FK → businesses.id)
- `account_id` (uuid, FK → accounts.id)
- `role` (enum: OWNER, ADMIN, ANALYST, VIEWER)
- `permissions` (jsonb)
- `invited_by` (uuid, FK → users.id)
- `accepted_at` (timestamptz)
- `created_at` (timestamptz)

## API Endpoints

### Authentication
```
POST   /api/auth/signup
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/reset-password
GET    /api/auth/profile
PUT    /api/auth/profile
```

### Account Management
```
GET    /api/accounts
POST   /api/accounts
GET    /api/accounts/:id
PUT    /api/accounts/:id
DELETE /api/accounts/:id
```

### Business Management
```
GET    /api/businesses
POST   /api/businesses
GET    /api/businesses/:id
PUT    /api/businesses/:id
DELETE /api/businesses/:id
POST   /api/businesses/:id/invite
```

### Financial Data
```
GET    /api/businesses/:id/transactions
POST   /api/businesses/:id/transactions
PUT    /api/businesses/:id/transactions/:transactionId
DELETE /api/businesses/:id/transactions/:transactionId
POST   /api/businesses/:id/transactions/import
GET    /api/businesses/:id/categories
POST   /api/businesses/:id/categories
```

### Forecasting
```
GET    /api/businesses/:id/forecasts
POST   /api/businesses/:id/forecasts
GET    /api/businesses/:id/forecasts/:forecastId
PUT    /api/businesses/:id/forecasts/:forecastId
DELETE /api/businesses/:id/forecasts/:forecastId
POST   /api/businesses/:id/forecasts/:forecastId/scenarios
```

## Frontend Architecture

### Component Structure
```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   ├── auth/            # Authentication components
│   ├── dashboard/       # Dashboard-specific components
│   ├── financial/       # Financial management components
│   ├── forecasting/     # Forecasting components
│   └── marketing/       # Landing page components
├── pages/               # Route components
├── hooks/               # Custom React hooks
├── services/            # API service layer
├── stores/              # State management
├── utils/               # Utility functions
└── types/               # TypeScript type definitions
```

### Routing Structure
```
/                        # Landing page
/pricing                 # Pricing page
/features                # Features page
/login                   # Authentication
/signup                  # Registration
/dashboard               # Main dashboard
/dashboard/businesses    # Business selection
/business/:id/           # Business dashboard
  ├── overview           # Financial overview
  ├── transactions       # Transaction management
  ├── categories         # Category management
  ├── budgets           # Budget planning
  ├── forecasts         # Forecasting & scenarios
  ├── reports           # Financial reports
  └── settings          # Business settings
/account/                # Account management
  ├── profile            # User profile
  ├── billing            # Subscription management
  ├── team               # Team management
  └── settings           # Account settings
```

## Security Architecture

### Authentication Flow
1. User registers/logs in via Supabase Auth
2. JWT token issued with user claims
3. Frontend stores token in HTTP-only cookie
4. All API requests include Authorization header
5. Backend validates token and extracts user context

### Authorization (RLS)
```sql
-- Users can only access their own data
CREATE POLICY "Users own data" ON users
  FOR ALL USING (auth.uid() = id);

-- Business access based on user_business_roles
CREATE POLICY "Business access" ON businesses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_business_roles 
      WHERE user_id = auth.uid() 
      AND business_id = businesses.id
    )
  );
```

## Payment Integration

### Stripe Webhook Events
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

### Billing Workflow
1. User selects plan on pricing page
2. Stripe Checkout session created
3. Payment processed via Stripe
4. Webhook updates subscription status
5. User gains access to plan features

## Forecasting Models

### Linear Regression Model
- Analyzes historical transaction patterns
- Projects revenue and expense trends
- Confidence intervals for predictions

### Seasonal Adjustment Model
- Accounts for seasonal business patterns
- Monthly/quarterly trend analysis
- Industry-specific adjustments

### Monte Carlo Simulation
- Multiple scenario generation
- Risk assessment and probability distributions
- Stress testing financial projections

## Performance Requirements

### Frontend
- Initial load: < 3 seconds
- Route transitions: < 500ms
- Chart rendering: < 1 second
- Mobile responsive: All breakpoints

### Backend
- API response time: < 200ms (95th percentile)
- Database queries: < 100ms average
- Webhook processing: < 5 seconds
- File uploads: Support up to 10MB

## Deployment Architecture

### Production Environment
```
┌─────────────────┐
│   Load Balancer │
│   (Nginx)       │
└─────────┬───────┘
          │
┌─────────▼───────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │
│   (Static)      │    │   (Node.js/PM2) │
└─────────────────┘    └─────────┬───────┘
                                 │
                       ┌─────────▼───────┐
                       │   Database      │
                       │   (Supabase)    │
                       └─────────────────┘
```

## Implementation Timeline

### Phase 1 (Week 1-2): Foundation
- Database schema design and implementation
- Authentication system setup
- Basic multi-tenant architecture
- Core API endpoints

### Phase 2 (Week 3-4): Financial Core
- Transaction management system
- CSV/OFX import functionality
- Category and budget management
- Basic reporting dashboard

### Phase 3 (Week 5-6): Advanced Features
- Forecasting engine implementation
- Scenario planning tools
- Advanced analytics and insights
- Performance optimization

### Phase 4 (Week 7-8): Business Features
- Stripe billing integration
- Marketing page optimization
- Multi-language implementation
- Production deployment

## Acceptance Criteria

### Multi-Tenancy
- [ ] Users can create and manage multiple businesses
- [ ] Data isolation between different accounts
- [ ] Role-based access control working correctly
- [ ] Proper data segregation in all queries

### Financial Management
- [ ] Import transactions from CSV/OFX files
- [ ] Categorize transactions automatically and manually
- [ ] Create and track budgets vs actuals
- [ ] Generate financial reports (P&L, Balance Sheet, Cash Flow)

### Forecasting
- [ ] Generate revenue and expense forecasts
- [ ] Create multiple scenarios for comparison
- [ ] Export forecasting data and reports
- [ ] Visualize trends and predictions

### Billing
- [ ] Subscription plan management
- [ ] Stripe payment processing
- [ ] Webhook handling for subscription events
- [ ] Usage-based billing calculations

### Performance
- [ ] Page load times under 3 seconds
- [ ] API responses under 200ms
- [ ] Mobile-responsive across all devices
- [ ] Offline capability for key features

## Security Checklist

- [ ] Input validation on all endpoints
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF protection
- [ ] Rate limiting on API endpoints
- [ ] Secure cookie configuration
- [ ] Environment variable protection
- [ ] Database backup and recovery procedures

## Monitoring and Analytics

### Application Monitoring
- Error tracking with Sentry
- Performance monitoring
- User behavior analytics
- Business metrics dashboard

### Business Intelligence
- Conversion funnel analysis
- Customer lifetime value tracking
- Churn prediction and prevention
- Revenue optimization insights