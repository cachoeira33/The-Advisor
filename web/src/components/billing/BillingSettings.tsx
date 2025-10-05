
import { useTranslation } from 'react-i18next';
import { CreditCard, Calendar, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { useStripe } from '../../hooks/useStripe';
import { useAccount } from '../../hooks/useAccount';

export function BillingSettings() {
  const { t } = useTranslation();
  const { createPortalSession, loading } = useStripe();
  const { account } = useAccount();

  const getPlanName = (planType: string) => {
    switch (planType) {
      case 'FREE': return 'Free Plan';
      case 'PRO': return 'Professional';
      case 'ENTERPRISE': return 'Enterprise';
      default: return 'Unknown Plan';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'text-green-600 bg-green-100';
      case 'PAST_DUE': return 'text-red-600 bg-red-100';
      case 'CANCELED': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Billing & Subscription</h2>
        <p className="text-gray-600">Manage your subscription and billing information</p>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <CreditCard className="w-8 h-8 text-primary-600 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Current Plan</h3>
              <p className="text-gray-600">
                {account ? getPlanName(account.plan_type) : 'Loading...'}
              </p>
            </div>
          </div>
          {account && (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(account.subscription_status)}`}>
              {account.subscription_status}
            </span>
          )}
        </div>

        {account?.subscription_status === 'PAST_DUE' && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <div>
                <h4 className="text-sm font-medium text-red-800">Payment Required</h4>
                <p className="text-sm text-red-700">
                  Your subscription payment is past due. Please update your payment method.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-gray-400 mr-3" />
              <span className="text-gray-700">Billing Cycle</span>
            </div>
            <span className="text-gray-900">Monthly</span>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-gray-700">Need to update your billing information?</p>
              <p className="text-sm text-gray-500">
                Manage your subscription, payment methods, and billing history
              </p>
            </div>
            <Button
              onClick={createPortalSession}
              loading={loading}
              variant="outline"
            >
              Manage Billing
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upgrade Your Plan</h3>
        <p className="text-gray-600 mb-4">
          Get access to more features and higher limits with our Professional or Enterprise plans.
        </p>
        <Button variant="primary">
          View Plans
        </Button>
      </Card>
    </div>
  );
}