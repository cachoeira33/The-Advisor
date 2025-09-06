import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  Building2, 
  TrendingUp, 
  BarChart3, 
  Users, 
  FileSpreadsheet, 
  Smartphone,
  Globe,
  Shield
} from 'lucide-react';
import { Card } from '../ui/Card';

export function Features() {
  const { t } = useTranslation();

  const features = [
    {
      icon: Building2,
      title: t('marketing.features.multiTenant.title'),
      description: t('marketing.features.multiTenant.description'),
      color: 'text-primary-600',
      bgColor: 'bg-primary-100',
    },
    {
      icon: TrendingUp,
      title: t('marketing.features.forecasting.title'),
      description: t('marketing.features.forecasting.description'),
      color: 'text-secondary-600',
      bgColor: 'bg-secondary-100',
    },
    {
      icon: BarChart3,
      title: t('marketing.features.realTime.title'),
      description: t('marketing.features.realTime.description'),
      color: 'text-accent-600',
      bgColor: 'bg-accent-100',
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Invite team members with role-based permissions and collaborative workflows',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      icon: FileSpreadsheet,
      title: 'Import & Export',
      description: 'Seamlessly import from CSV, OFX, and export to multiple formats for analysis',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
    },
    {
      icon: Smartphone,
      title: 'Mobile Optimized',
      description: 'Access your financial data anywhere with our responsive mobile design',
      color: 'text-pink-600',
      bgColor: 'bg-pink-100',
    },
    {
      icon: Globe,
      title: 'Multi-Language',
      description: 'Support for English, Portuguese, Spanish, and Italian with automatic detection',
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-100',
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-level security with encryption, audit logs, and compliance certifications',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
  ];

  return (
    <section className="py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {t('marketing.features.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Built for modern businesses that need powerful financial insights without the complexity
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card hover className="p-6 h-full">
                <div className="space-y-4">
                  <div className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center`}>
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}