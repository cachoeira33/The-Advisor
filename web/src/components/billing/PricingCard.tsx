
import { motion } from 'framer-motion';
import { Check, Star } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { useStripe } from '../../hooks/useStripe';
import { useAuth } from '../../hooks/useAuth';

interface PricingCardProps {
  name: string;
  price: string;
  description: string;
  features: string[];
  priceId?: string;
  popular?: boolean;
  currentPlan?: boolean;
}

export function PricingCard({
  name,
  price,
  description,
  features,
  priceId,
  popular = false,
  currentPlan = false,
}: PricingCardProps) {
  const { createCheckoutSession, loading } = useStripe();
  const { user } = useAuth();

  const handleSubscribe = () => {
    if (!user) {
      window.location.href = '/login';
      return;
    }

    if (priceId) {
      createCheckoutSession(priceId);
    }
  };

  const getButtonText = () => {
    if (currentPlan) return 'Current Plan';
    if (price === '$0') return 'Get Started';
    if (name === 'Enterprise') return 'Contact Sales';
    return 'Start Free Trial';
  };

  const isDisabled = currentPlan || loading;

  return (
    <div className="relative">
      {popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <div className="inline-flex items-center px-4 py-1 rounded-full bg-primary-600 text-white text-sm font-medium">
            <Star className="w-4 h-4 mr-1" />
            Most Popular
          </div>
        </div>
      )}
      
      <Card className={`p-8 h-full ${popular ? 'ring-2 ring-primary-600' : ''}`}>
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900">{name}</h3>
            <p className="text-gray-600 mt-2">{description}</p>
            <div className="mt-4">
              <span className="text-4xl font-bold text-gray-900">{price}</span>
              {price !== '$0' && <span className="text-gray-600">/month</span>}
            </div>
          </div>
          
          <Button 
            className="w-full" 
            variant={popular ? 'primary' : 'outline'}
            onClick={handleSubscribe}
            disabled={isDisabled}
            loading={loading}
          >
            {getButtonText()}
          </Button>
          
          <div className="space-y-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center">
                <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-gray-700 text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}