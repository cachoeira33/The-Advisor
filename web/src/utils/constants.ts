// Application constants
export const APP_NAME = 'FinancePro';
export const APP_VERSION = '1.0.0';

// API endpoints
export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Pagination
export const DEFAULT_PAGE_SIZE = 50;
export const MAX_PAGE_SIZE = 100;

// Date formats
export const DATE_FORMAT = 'yyyy-MM-dd';
export const DISPLAY_DATE_FORMAT = 'MMM dd, yyyy';

// Supported currencies
export const SUPPORTED_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
];

// Local storage keys
export const STORAGE_KEYS = {
  THEME: 'financepro_theme',
  LANGUAGE: 'financepro_language',
  DASHBOARD_LAYOUT: 'financepro_dashboard_layout',
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  SERVER_ERROR: 'An unexpected server error occurred.',
};