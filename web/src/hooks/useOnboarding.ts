// src/hooks/useOnboarding.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../config/supabase';

// Função para criar o negócio e associar o usuário
const createBusinessAndRole = async (
  userId: string,
  businessData: { name: string; industry: string; }
) => {
  const { data: newBusiness, error: businessError } = await supabase
    .from('businesses')
    .insert([businessData])
    .select()
    .single();

  if (businessError) throw businessError;

  const { error: roleError } = await supabase
    .from('user_business_roles')
    .insert([{ user_id: userId, business_id: newBusiness.id, role: 'OWNER' }])
    .select()
    .single();

  if (roleError) throw roleError;
  return newBusiness;
};

// Função para criar um perfil pessoal (se necessário)
const createPersonalProfile = async (userId: string, profileData: { name: string }) => {
  const { data: newProfile, error: profileError } = await supabase
    .from('profiles') // Assumindo que você tem uma tabela `profiles`
    .insert([{ id: userId, full_name: profileData.name }])
    .select()
    .single();

  if (profileError) throw profileError;
  return newProfile;
};

export function useOnboarding() {
  const queryClient = useQueryClient();

  // Mutação para o fluxo de negócio
  const businessOnboardingMutation = useMutation({
    mutationFn: ({ userId, businessData }: { userId: string; businessData: { name: string; industry: string; }}) =>
      createBusinessAndRole(userId, businessData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
      // Adicione a invalidação de outras queries se necessário
    },
  });

  // Mutação para o fluxo pessoal
  const personalOnboardingMutation = useMutation({
    mutationFn: ({ userId, profileData }: { userId: string; profileData: { name: string } }) =>
      createPersonalProfile(userId, profileData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
  });

  return {
    createBusiness: businessOnboardingMutation.mutate,
    createPersonalProfile: personalOnboardingMutation.mutate,
    isLoadingBusiness: businessOnboardingMutation.isPending,
    isLoadingPersonal: personalOnboardingMutation.isPending,
  };
}