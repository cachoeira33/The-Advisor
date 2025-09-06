# API Documentation

## Authentication

All API endpoints require authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Base URL
```
Production: https://api.yourdomain.com
Development: http://localhost:3001
```

## Endpoints

### Authentication

#### POST /api/auth/signup
Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "fullName": "John Doe"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe"
  },
  "account": {
    "id": "uuid",
    "name": "John Doe's Account",
    "plan_type": "FREE"
  }
}
```

#### POST /api/auth/login
Authenticate user and get access token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  },
  "session": {
    "access_token": "jwt_token",
    "expires_at": "timestamp"
  }
}
```

### Business Management

#### GET /api/businesses
Get all businesses for the authenticated user.

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Tech Startup Inc.",
    "industry": "Technology",
    "currency": "USD",
    "created_at": "timestamp",
    "user_business_roles": {
      "role": "OWNER"
    }
  }
]
```

#### POST /api/businesses
Create a new business.

**Request Body:**
```json
{
  "name": "My Business",
  "industry": "Technology",
  "currency": "USD",
  "fiscal_year_start": 1
}
```

### Transaction Management

#### GET /api/transactions/:businessId
Get transactions for a specific business.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 50)
- `category`: Filter by category ID
- `type`: Filter by INCOME or EXPENSE
- `search`: Search in description

**Response:**
```json
[
  {
    "id": "uuid",
    "description": "Monthly SaaS Revenue",
    "amount": 45000,
    "currency": "USD",
    "type": "INCOME",
    "date": "2024-01-15T00:00:00Z",
    "category": {
      "name": "Sales Revenue",
      "color": "#10B981"
    }
  }
]
```

#### POST /api/transactions
Create a new transaction.

**Request Body:**
```json
{
  "business_id": "uuid",
  "description": "Office Supplies",
  "amount": -150.50,
  "type": "EXPENSE",
  "date": "2024-01-15T10:30:00Z",
  "category_id": "uuid",
  "reference": "INV-001"
}
```

### Forecasting

#### GET /api/forecasts/:businessId
Get forecasts for a business.

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Q1 2024 Forecast",
    "model_type": "LINEAR",
    "time_horizon": 3,
    "confidence_level": 0.95,
    "results": {
      "forecast": [
        {
          "date": "2024-02-01",
          "revenue": 50000,
          "expenses": 30000,
          "profit": 20000
        }
      ]
    },
    "scenarios": []
  }
]
```

#### POST /api/forecasts
Create a new forecast.

**Request Body:**
```json
{
  "business_id": "uuid",
  "name": "Q1 2024 Revenue Forecast",
  "model_type": "LINEAR",
  "time_horizon": 6,
  "confidence_level": 0.95,
  "parameters": {
    "include_seasonality": true,
    "growth_rate": 0.15
  }
}
```

### Billing

#### POST /api/billing/checkout
Create Stripe checkout session.

**Request Body:**
```json
{
  "priceId": "price_1234567890",
  "successUrl": "https://app.yourdomain.com/success",
  "cancelUrl": "https://app.yourdomain.com/cancel"
}
```

**Response:**
```json
{
  "url": "https://checkout.stripe.com/pay/..."
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": "Additional error details"
}
```

### HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `429`: Too Many Requests
- `500`: Internal Server Error

## Rate Limiting

- **General API**: 100 requests per minute per IP
- **Authentication**: 5 attempts per 15 minutes per IP
- **File Upload**: 5 uploads per minute per user

## Webhooks

### Stripe Webhooks
Configure webhook endpoint: `https://api.yourdomain.com/api/billing/webhook`

**Events:**
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`