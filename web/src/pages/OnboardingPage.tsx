import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { User, Building2, ArrowRight, Check } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { useAuth } from '../hooks/useAuth';
import { useBusiness } from '../hooks/useBusiness';
import { supabase } from '../config/supabase';
import toast from 'react-hot-toast';

const businessSchema = z.object({
  name: z.string().min(1, 'Business name is required'),
  industry: z.string().min(1, 'Industry is required'),
  currency: z.string().length(3, 'Currency must be 3 characters'),
  fiscal_year_start: z.number().min(1).max(12),
});

type BusinessFormData = z.infer<typeof businessSchema>;

export function OnboardingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createBusiness } = useBusiness();
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState<'PERSONAL' | 'BUSINESS' | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BusinessFormData>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      currency: 'USD',
      fiscal_year_start: 1,
    },
  });

  const handleUserTypeSelection = async (type: 'PERSONAL' | 'BUSINESS') => {
    setUserType(type);
    
    // Update user profile with selected type
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          preferences: { 
            user_type: type,
            onboarding_completed: false 
          } 
        })
        .eq('id', user?.id);

      if (error) throw error;
      setStep(2);
    } catch (error) {
      toast.error('Failed to save user type');
    }
  };

  const handleBusinessSetup = async (data: BusinessFormData) => {
    try {
      await createBusiness(data);
      
      // Mark onboarding as completed
      await supabase
        .from('users')
        .update({ 
          preferences: { 
            user_type: userType,
            onboarding_completed: true 
          } 
        })
        .eq('id', user?.id);

      toast.success('Welcome to FinancePro!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to create business');
    }
  };

  const handlePersonalSetup = async () => {
    try {
      // Create a default personal "business" for personal users
      await createBusiness({
        name: 'Personal Finances',
        industry: 'Personal',
        currency: 'USD',
        fiscal_year_start: 1,
      });

      // Mark onboarding as completed
      await supabase
        .from('users')
        .update({ 
          preferences: { 
            user_type: userType,
            onboarding_completed: true 
          } 
        })
        .eq('id', user?.id);

      toast.success('Welcome to FinancePro!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to setup personal account');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to FinancePro</h1>
          <p className="text-gray-600">Let's set up your account in just a few steps</p>
        </motion.div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {step > 1 ? <Check className="w-4 h-4" /> : '1'}
            </div>
            <div className={`w-16 h-1 ${step >= 2 ? 'bg-primary-600' : 'bg-gray-200'}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {step > 2 ? <Check className="w-4 h-4" /> : '2'}
            </div>
          </div>
        </div>

        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
                How will you be using FinancePro?
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                  onClick={() => handleUserTypeSelection('PERSONAL')}
                  className="p-6 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all duration-200 text-left group"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200">
                      <User className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 ml-4">Personal Use</h3>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Manage your personal finances, track expenses, and plan your budget.
                  </p>
                  <ul className="mt-4 text-sm text-gray-500 space-y-1">
                    <li>• Personal expense tracking</li>
                    <li>• Budget planning</li>
                    <li>• Purchase simulations</li>
                  </ul>
                </button>

                <button
                  onClick={() => handleUserTypeSelection('BUSINESS')}
                  className="p-6 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all duration-200 text-left group"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200">
                      <Building2 className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 ml-4">Business Use</h3>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Manage multiple businesses, generate reports, and track cash flow.
                  </p>
                  <ul className="mt-4 text-sm text-gray-500 space-y-1">
                    <li>• Multi-business management</li>
                    <li>• Financial reports</li>
                    <li>• Advanced forecasting</li>
                  </ul>
                </button>
              </div>
            </Card>
          </motion.div>
        )}

        {step === 2 && userType === 'BUSINESS' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
                Tell us about your business
              </h2>
              
              <form onSubmit={handleSubmit(handleBusinessSetup)} className="space-y-6">
                <Input
                  label="Business Name"
                  error={errors.name?.message}
                  {...register('name')}
                />

                <Input
                  label="Industry"
                  error={errors.industry?.message}
                  {...register('industry')}
                />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Currency
                    </label>
                    <select
                      className="input"
                      {...register('currency')}
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="BRL">BRL - Brazilian Real</option>
                      <option value="CAD">CAD - Canadian Dollar</option>
                    </select>
                    {errors.currency && (
                      <p className="mt-1 text-sm text-red-600">{errors.currency.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fiscal Year Start
                    </label>
                    <select
                      className="input"
                      {...register('fiscal_year_start', { valueAsNumber: true })}
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {new Date(2000, i, 1).toLocaleDateString('en-US', { month: 'long' })}
                        </option>
                      ))}
                    </select>
                    {errors.fiscal_year_start && (
                      <p className="mt-1 text-sm text-red-600">{errors.fiscal_year_start.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    loading={isSubmitting}
                    className="group"
                  >
                    Complete Setup
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}

        {step === 2 && userType === 'PERSONAL' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="w-8 h-8 text-green-600" />
              </div>
              
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                You're all set!
              </h2>
              
              <p className="text-gray-600 mb-8">
                We'll create your personal finance dashboard with all the tools you need to manage your money effectively.
              </p>

              <div className="flex justify-center space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
                <Button
                  onClick={handlePersonalSetup}
                  loading={isSubmitting}
                  className="group"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}