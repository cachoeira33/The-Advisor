# Financial Dashboard SaaS Platform

A comprehensive multi-tenant SaaS financial dashboard platform with advanced forecasting, subscription billing, and multi-language support.

## 🚀 Features

### Core Platform
- **Multi-Tenant Architecture**: Manage multiple businesses per account with role-based access
- **Financial Management**: Transaction tracking, categorization, and budget management
- **Advanced Forecasting**: AI-powered predictions with scenario planning
- **Subscription Billing**: Stripe integration with webhook processing
- **Marketing Pages**: Conversion-optimized landing pages with analytics
- **Internationalization**: Support for English, Portuguese, Spanish, and Italian

### Technical Features
- **Authentication**: Supabase Auth with JWT tokens
- **Database**: PostgreSQL with Row Level Security (RLS)
- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Real-time**: WebSocket connections for live updates
- **File Processing**: CSV/OFX import with validation
- **Security**: Rate limiting, input validation, and encryption

## 🏗️ Architecture

```
Frontend (React/Vite) ←→ Backend API (Express) ←→ Database (Supabase)
                                    ↓
                            External Services
                         (Stripe, Analytics, Email)
```

### Database Schema
- **accounts**: Top-level tenant accounts
- **users**: User profiles with preferences
- **businesses**: Individual businesses within accounts
- **user_business_roles**: Role-based access control
- **transactions**: Financial transactions with categorization
- **categories**: Income and expense categories
- **budgets**: Budget planning and tracking
- **forecasts**: Financial forecasting models
- **forecast_scenarios**: Scenario variations

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Stripe account (for billing)

### Environment Configuration

1. **Frontend (.env)**:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
VITE_GA_MEASUREMENT_ID=your_ga_measurement_id
```

2. **Backend (.env)**:
```env
NODE_ENV=development
PORT=3001
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

### Quick Start

1. **Install Dependencies**:
```bash
npm install
```

2. **Set up Supabase**:
   - Click "Connect to Supabase" in the top right
   - Run the provided migrations in the Supabase SQL editor

3. **Configure Stripe**:
   - Create a Stripe account and get your API keys
   - Update the price IDs in `web/src/config/stripe.ts`
   - Set up webhook endpoints for subscription events

4. **Start Development**:
```bash
npm run dev
```

## 📊 User Roles & Permissions

| Role | Permissions |
|------|-------------|
| **OWNER** | Full access, billing, user management |
| **ADMIN** | Business management, user invites |
| **ANALYST** | Financial data, forecasting, reports |
| **VIEWER** | Read-only access to dashboards |

## 🔄 Forecasting Models

### Linear Regression
- Analyzes historical trends
- Projects future revenue/expenses
- Best for stable, growing businesses

### Seasonal Adjustment
- Accounts for seasonal patterns
- Monthly/quarterly variations
- Ideal for seasonal businesses

### Monte Carlo Simulation
- Multiple scenario generation
- Risk assessment and probability
- Advanced uncertainty modeling

## 💳 Billing Integration

### Subscription Plans
- **Free**: 1 business, basic features
- **Professional**: 5 businesses, advanced forecasting
- **Enterprise**: Unlimited businesses, white-label options

### Stripe Integration
- Checkout session creation
- Webhook processing for subscription events
- Automatic plan upgrades/downgrades
- Failed payment handling

## 🌍 Multi-Language Support

Automatic language detection and content translation for:
- **English** (default)
- **Portuguese** (Brazil)
- **Spanish** (Latin America)
- **Italian** (Italy)

## 🚀 Deployment

### Development Environment
```bash
npm run dev:full  # Starts both frontend and backend
```

### Production Deployment
```bash
npm run build     # Build both applications
npm start         # Start production servers
```

### Docker Deployment
```bash
docker-compose up -d
```

## 📈 Analytics & Monitoring

- **Google Analytics 4**: User behavior tracking
- **Conversion Tracking**: Signup and subscription events
- **Error Monitoring**: Sentry integration
- **Performance Monitoring**: API response times and database queries

## 🔒 Security Features

- **Authentication**: Supabase Auth with email/password
- **Authorization**: Row Level Security (RLS) policies
- **Rate Limiting**: Prevent API abuse
- **Input Validation**: Zod schema validation
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Content sanitization
- **CSRF Protection**: Token validation

## 🧪 Testing

```bash
npm run test      # Run all tests
npm run test:web  # Frontend tests
npm run test:api  # Backend tests
```

## 📋 Maintenance

### Database Migrations
```bash
npm run db:migrate  # Run pending migrations
npm run db:seed     # Seed sample data
```

### Monitoring
- Monitor Supabase dashboard for database performance
- Check Stripe dashboard for billing issues
- Review error logs and performance metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement changes with tests
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For technical support or questions:
- Check the documentation in `/docs`
- Review the troubleshooting guide
- Contact the development team

---

Built with ❤️ using modern web technologies and best practices.