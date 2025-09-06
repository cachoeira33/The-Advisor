// src/pages/OnboardingPage.tsx

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { useOnboarding } from '../hooks/useOnboarding';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

// --- ALTERADO: Esquema de validação para ser opcional
const onboardingSchema = z.object({
  name: z.string().min(2, { message: 'Business name or full name is required' }).optional(),
  industry: z.string().optional(),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

export function OnboardingPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { createBusiness, createPersonalProfile, isLoadingBusiness, isLoadingPersonal } = useOnboarding();
  const [accountType, setAccountType] = useState<'personal' | 'business' | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
  });

  const onSubmit = async (data: OnboardingFormData) => {
    if (!user) return toast.error('User not authenticated.');

    if (accountType === 'business') {
      if (!data.name || data.name.length < 2) {
        return toast.error('Business name is required.');
      }
      try {
        await createBusiness({
          userId: user.id,
          businessData: {
            name: data.name,
            industry: data.industry || 'General', // Default industry
          },
        });
        toast.success('Business profile created successfully!');
        navigate('/dashboard');
      } catch (error) {
        toast.error('Failed to create business profile.');
        console.error(error);
      }
    } else if (accountType === 'personal') {
      if (!data.name || data.name.length < 2) {
        return toast.error('Your name is required.');
      }
      try {
        await createPersonalProfile({
          userId: user.id,
          profileData: {
            name: data.name,
          },
        });
        toast.success('Personal profile created successfully!');
        navigate('/dashboard');
      } catch (error) {
        toast.error('Failed to create personal profile.');
        console.error(error);
      }
    }
  };

  if (!accountType) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            {t('onboarding.welcome')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            How will you be using FinancePro?
          </p>
        </div>
        <div className="mt-8 space-y-4">
          <Button onClick={() => setAccountType('personal')}>
            {t('onboarding.personalUse')}
          </Button>
          <Button onClick={() => setAccountType('business')}>
            {t('onboarding.businessUse')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          {accountType === 'personal' ? 'Personal Details' : 'Business Details'}
        </h2>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label={accountType === 'personal' ? 'Your Name' : 'Business Name'}
            type="text"
            error={errors.name?.message}
            {...register('name')}
          />
          {accountType === 'business' && (
            <Input
              label="Industry"
              type="text"
              error={errors.industry?.message}
              {...register('industry')}
            />
          )}
          <Button 
            type="submit" 
            className="w-full" 
            loading={accountType === 'business' ? isLoadingBusiness : isLoadingPersonal}
          >
            {accountType === 'personal' ? 'Continue' : 'Create Business Profile'}
          </Button>
        </form>
      </div>
    </div>
  );
}