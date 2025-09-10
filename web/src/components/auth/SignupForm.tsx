// src/components/auth/SignupForm.tsx

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const signupSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

export function SignupForm() {
  const { t } = useTranslation();
  const { signUp } = useAuth();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    try {
      const { error, data: userData } = await signUp(data.email, data.password, data.fullName);

      if (error) {
        if (error.message.includes('user already registered')) {
          toast.error('This email is already registered. Please log in.');
        } else {
          toast.error(error.message);
        }
      } else if (userData?.user) {
        toast.success('Account created successfully! Please check your email to verify your account.');
        navigate('/onboarding');
      }
    } catch (error) {
      toast.error('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">{t('auth.createAccount')}</h2>
        <p className="mt-2 text-gray-600">Get started with your financial dashboard</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input
          label={t('auth.fullName')}
          type="text"
          icon={<User className="w-5 h-5" />}
          error={errors.fullName?.message}
          {...register('fullName')}
        />

        <Input
          label={t('auth.email')}
          type="email"
          icon={<Mail className="w-5 h-5" />}
          error={errors.email?.message}
          {...register('email')}
        />

        <div className="relative">
          <Input
            label={t('auth.password')}
            type={showPassword ? 'text' : 'password'}
            icon={<Lock className="w-5 h-5" />}
            error={errors.password?.message}
            {...register('password')}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center top-6"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5 text-gray-400" />
            ) : (
              <Eye className="w-5 h-5 text-gray-400" />
            )}
          </button>
        </div>

        <div className="relative">
          <Input
            label={t('auth.confirmPassword')}
            type={showConfirmPassword ? 'text' : 'password'}
            icon={<Lock className="w-5 h-5" />}
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center top-6"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? (
              <EyeOff className="w-5 h-5 text-gray-400" />
            ) : (
              <Eye className="w-5 h-5 text-gray-400" />
            )}
          </button>
        </div>

        <Button
          type="submit"
          className="w-full"
          loading={isSubmitting}
        >
          {t('auth.signup')}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          {t('auth.alreadyHaveAccount')}{' '}
          <a href="/login" className="font-medium text-primary-600 hover:text-primary-500">
            {t('auth.login')}
          </a>
        </p>
      </div>
    </motion.div>
  );
}