import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  User, 
  Building2, 
  CreditCard, 
  Palette, 
  Settings as SettingsIcon,
  Tag
} from 'lucide-react';
import { ProfileSettings } from '../components/settings/ProfileSettings';
import { BusinessSettings } from '../components/settings/BusinessSettings';
import { BillingSettings } from '../components/billing/BillingSettings';
import { CategorySettings } from '../components/settings/CategorySettings';
import { PreferencesSettings } from '../components/settings/PreferencesSettings';

type SettingsTab = 'profile' | 'business' | 'categories' | 'billing' | 'preferences';

export function SettingsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  const tabs = [
    {
      id: 'profile' as const,
      label: t('settings.profile'),
      icon: User,
      component: ProfileSettings,
    },
    {
      id: 'business' as const,
      label: t('settings.business'),
      icon: Building2,
      component: BusinessSettings,
    },
    {
      id: 'categories' as const,
      label: t('settings.categories'),
      icon: Tag,
      component: CategorySettings,
    },
    {
      id: 'billing' as const,
      label: t('settings.billing'),
      icon: CreditCard,
      component: BillingSettings,
    },
    {
      id: 'preferences' as const,
      label: t('settings.preferences'),
      icon: Palette,
      component: PreferencesSettings,
    },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || ProfileSettings;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="flex items-center">
        <SettingsIcon className="w-8 h-8 text-primary-600 mr-3" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('settings.title')}</h1>
          <p className="text-gray-600">Manage your account and application preferences</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:w-64 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-5 h-5 mr-3" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ActiveComponent />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}