import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Building2, CreditCard, Bell, Shield, Palette, Globe } from 'lucide-react';
import { BillingSettings } from '../components/billing/BillingSettings';
import { ProfileSettings } from '../components/settings/ProfileSettings';
import { BusinessSettings } from '../components/settings/BusinessSettings';
import { CategorySettings } from '../components/settings/CategorySettings';
import { PreferencesSettings } from '../components/settings/PreferencesSettings';

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'business', name: 'Business', icon: Building2 },
    { id: 'categories', name: 'Categories', icon: Palette },
    { id: 'billing', name: 'Billing', icon: CreditCard },
    { id: 'preferences', name: 'Preferences', icon: Globe },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSettings />;
      case 'business':
        return <BusinessSettings />;
      case 'categories':
        return <CategorySettings />;
      case 'billing':
        return <BillingSettings />;
      case 'preferences':
        return <PreferencesSettings />;
      case 'notifications':
        return (
          <div className="text-center py-12">
            <p className="text-gray-600">Notification settings coming soon</p>
          </div>
        );
      case 'security':
        return (
          <div className="text-center py-12">
            <p className="text-gray-600">Security settings coming soon</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-6xl mx-auto"
    >
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-5 h-5 mr-3" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {renderTabContent()}
        </div>
      </div>
    </motion.div>
  );
}