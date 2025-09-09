import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2, Plus, Edit, Trash2 } from 'lucide-react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { useBusiness } from '../../hooks/useBusiness';
import toast from 'react-hot-toast';

const businessSchema = z.object({
  name: z.string().min(1, 'Business name is required'),
  industry: z.string().min(1, 'Industry is required'),
  currency: z.string().length(3, 'Currency must be 3 characters'),
  fiscal_year_start: z.number().min(1).max(12),
});

type BusinessFormData = z.infer<typeof businessSchema>;

export function BusinessSettings() {
  const { businesses, createBusiness, updateBusiness, selectedBusiness, setSelectedBusiness } = useBusiness();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BusinessFormData>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      currency: 'USD',
      fiscal_year_start: 1,
    },
  });

  const handleCreateBusiness = async (data: BusinessFormData) => {
    try {
      await createBusiness(data);
      toast.success('Business created successfully');
      setIsModalOpen(false);
      reset();
    } catch (error) {
      toast.error('Failed to create business');
    }
  };

  const handleUpdateBusiness = async (data: BusinessFormData) => {
    if (!editingBusiness) return;
    
    try {
      await updateBusiness({ id: editingBusiness.id, ...data });
      toast.success('Business updated successfully');
      setEditingBusiness(null);
      reset();
    } catch (error) {
      toast.error('Failed to update business');
    }
  };

  const openEditModal = (business: any) => {
    setEditingBusiness(business);
    reset({
      name: business.name,
      industry: business.industry,
      currency: business.currency,
      fiscal_year_start: business.fiscal_year_start,
    });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBusiness(null);
    reset();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Business Settings</h2>
          <p className="text-gray-600">Manage your businesses and their configurations</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Business
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {businesses.map((business) => (
          <Card key={business.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
                  <Building2 className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{business.name}</h3>
                  <p className="text-sm text-gray-600">{business.industry}</p>
                  <p className="text-sm text-gray-500">Currency: {business.currency}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEditModal(business)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {selectedBusiness?.id === business.id && (
              <div className="mt-4 p-3 bg-primary-50 rounded-lg">
                <p className="text-sm text-primary-700 font-medium">Currently Selected</p>
              </div>
            )}
            
            {selectedBusiness?.id !== business.id && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedBusiness(business)}
                >
                  Select Business
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen || !!editingBusiness}
        onClose={closeModal}
        title={editingBusiness ? 'Edit Business' : 'Add New Business'}
      >
        <form onSubmit={handleSubmit(editingBusiness ? handleUpdateBusiness : handleCreateBusiness)} className="space-y-4">
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
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {editingBusiness ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}