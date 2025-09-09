import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Palette, DollarSign } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';

export function PreferencesSettings() {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'pt', name: 'Português', flag: '🇧🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  ];

  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  ];

  const themes = [
    { id: 'light', name: 'Light', description: 'Clean and bright interface' },
    { id: 'dark', name: 'Dark', description: 'Easy on the eyes' },
    { id: 'system', name: 'System', description: 'Follow system preference' },
  ];

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    toast.success('Language updated successfully');
  };

  const handleThemeChange = (themeId: string) => {
    // In a real implementation, you would update the theme
    toast.success('Theme updated successfully');
  };

  const handleCurrencyChange = (currencyCode: string) => {
    // In a real implementation, you would update the default currency
    toast.success('Default currency updated successfully');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Preferences</h2>
        <p className="text-gray-600">Customize your application experience</p>
      </div>

      {/* Language Settings */}
      <Card className="p-6">
        <div className="flex items-center mb-4">
          <Globe className="w-6 h-6 text-primary-600 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Language</h3>
            <p className="text-sm text-gray-600">Choose your preferred language</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={`p-4 rounded-lg border-2 text-left transition-colors ${
                i18n.language === language.code
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <span className="text-2xl mr-3">{language.flag}</span>
                <div>
                  <p className="font-medium text-gray-900">{language.name}</p>
                  <p className="text-sm text-gray-500">{language.code.toUpperCase()}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Theme Settings */}
      <Card className="p-6">
        <div className="flex items-center mb-4">
          <Palette className="w-6 h-6 text-primary-600 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Theme</h3>
            <p className="text-sm text-gray-600">Choose your interface theme</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {themes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => handleThemeChange(theme.id)}
              className="p-4 rounded-lg border-2 text-left transition-colors border-gray-200 hover:border-gray-300"
            >
              <div>
                <p className="font-medium text-gray-900">{theme.name}</p>
                <p className="text-sm text-gray-500">{theme.description}</p>
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Currency Settings */}
      <Card className="p-6">
        <div className="flex items-center mb-4">
          <DollarSign className="w-6 h-6 text-primary-600 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Default Currency</h3>
            <p className="text-sm text-gray-600">Set your preferred currency for new businesses</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {currencies.map((currency) => (
            <button
              key={currency.code}
              onClick={() => handleCurrencyChange(currency.code)}
              className="p-4 rounded-lg border-2 text-left transition-colors border-gray-200 hover:border-gray-300"
            >
              <div className="flex items-center">
                <span className="text-xl font-bold text-primary-600 mr-3 w-8">
                  {currency.symbol}
                </span>
                <div>
                  <p className="font-medium text-gray-900">{currency.name}</p>
                  <p className="text-sm text-gray-500">{currency.code}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}