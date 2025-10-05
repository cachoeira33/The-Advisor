
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { PricingCard } from '../components/billing/PricingCard';
import { STRIPE_PRICE_IDS } from '../config/stripe';
import { useAccount } from '../hooks/useAccount';

export function PricingPage() {
  const { t } = useTranslation();
  const { account } = useAccount();

  const plans = [
    {
      name: t('marketing.pricing.free.title'),
      price: t('marketing.pricing.free.price'),
      description: t('marketing.pricing.free.description'),
      features: t('marketing.pricing.free.features', { returnObjects: true }) as string[],
      priceId: STRIPE_PRICE_IDS.FREE,
      popular: false,
      currentPlan: account?.plan_type === 'FREE',
    },
    {
      name: t('marketing.pricing.pro.title'),
      price: t('marketing.pricing.pro.price'),
      description: t('marketing.pricing.pro.description'),
      features: t('marketing.pricing.pro.features', { returnObjects: true }) as string[],
      priceId: STRIPE_PRICE_IDS.PRO,
      popular: true,
      currentPlan: account?.plan_type === 'PRO',
    },
    {
      name: t('marketing.pricing.enterprise.title'),
      price: t('marketing.pricing.enterprise.price'),
      description: t('marketing.pricing.enterprise.description'),
      features: t('marketing.pricing.enterprise.features', { returnObjects: true }) as string[],
      priceId: STRIPE_PRICE_IDS.ENTERPRISE,
      popular: false,
      currentPlan: account?.plan_type === 'ENTERPRISE',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('marketing.pricing.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the perfect plan for your business needs. Start free, upgrade when you're ready.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <PricingCard {...plan} />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-gray-600">
            All plans include 14-day free trial • No credit card required • Cancel anytime
          </p>
        </motion.div>
      </div>
    </div>
  );
}