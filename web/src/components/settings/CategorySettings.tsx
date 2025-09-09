import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Palette, Plus, Edit, Trash2 } from 'lucide-react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { useCategories } from '../../hooks/useCategories';
import { useBusiness } from '../../hooks/useBusiness';
import { useCategoryMutations } from '../../hooks/useCategoryMutations';
import toast from 'react-hot-toast';

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  color: z.string().min(4, 'Color is required'),
  type: z.enum(['INCOME', 'EXPENSE']),
  icon: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

const PRESET_COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#EAB308',
  '#84CC16', '#22C55E', '#10B981', '#14B8A6',
  '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1',
  '#8B5CF6', '#A855F7', '#D946EF', '#EC4899',
];

export function CategorySettings() {
  const { selectedBusiness } = useBusiness();
  const { categories } = useCategories(selectedBusiness?.id);
  const { createCategory, updateCategory, deleteCategory } = useCategoryMutations(selectedBusiness?.id);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      color: '#6B7280',
      type: 'EXPENSE',
    },
  });

  const watchedColor = watch('color');

  const handleCreateCategory = async (data: CategoryFormData) => {
    try {
      await createCategory({
        ...data,
        business_id: selectedBusiness?.id,
      });
      toast.success('Category created successfully');
      setIsModalOpen(false);
      reset();
    } catch (error) {
      toast.error('Failed to create category');
    }
  };

  const handleUpdateCategory = async (data: CategoryFormData) => {
    if (!editingCategory) return;
    
    try {
      await updateCategory({ id: editingCategory.id, ...data });
      toast.success('Category updated successfully');
      setEditingCategory(null);
      reset();
    } catch (error) {
      toast.error('Failed to update category');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }
    
    try {
      await deleteCategory(id);
      toast.success('Category deleted successfully');
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  const openEditModal = (category: any) => {
    setEditingCategory(category);
    reset({
      name: category.name,
      color: category.color,
      type: category.type,
      icon: category.icon || '',
    });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    reset();
  };

  const incomeCategories = categories.filter(cat => cat.type === 'INCOME');
  const expenseCategories = categories.filter(cat => cat.type === 'EXPENSE');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Category Settings</h2>
          <p className="text-gray-600">Manage your transaction categories</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Income Categories */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-green-600 mb-4">Income Categories</h3>
          <div className="space-y-3">
            {incomeCategories.map((category) => (
              <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div
                    className="w-4 h-4 rounded-full mr-3"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="font-medium text-gray-900">{category.name}</span>
                  {category.is_system && (
                    <span className="ml-2 px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded">
                      System
                    </span>
                  )}
                </div>
                {!category.is_system && (
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditModal(category)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCategory(category.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Expense Categories */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-red-600 mb-4">Expense Categories</h3>
          <div className="space-y-3">
            {expenseCategories.map((category) => (
              <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div
                    className="w-4 h-4 rounded-full mr-3"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="font-medium text-gray-900">{category.name}</span>
                  {category.is_system && (
                    <span className="ml-2 px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded">
                      System
                    </span>
                  )}
                </div>
                {!category.is_system && (
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditModal(category)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCategory(category.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Modal
        isOpen={isModalOpen || !!editingCategory}
        onClose={closeModal}
        title={editingCategory ? 'Edit Category' : 'Add New Category'}
      >
        <form onSubmit={handleSubmit(editingCategory ? handleUpdateCategory : handleCreateCategory)} className="space-y-4">
          <Input
            label="Category Name"
            error={errors.name?.message}
            {...register('name')}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              className="input"
              {...register('type')}
            >
              <option value="INCOME">Income</option>
              <option value="EXPENSE">Expense</option>
            </select>
            {errors.type && (
              <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color
            </label>
            <div className="flex items-center space-x-3 mb-3">
              <div
                className="w-8 h-8 rounded-full border-2 border-gray-300"
                style={{ backgroundColor: watchedColor }}
              />
              <input
                type="color"
                className="w-16 h-8 rounded border border-gray-300"
                {...register('color')}
              />
            </div>
            <div className="grid grid-cols-8 gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className="w-8 h-8 rounded-full border-2 border-gray-300 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  onClick={() => setValue('color', color)}
                />
              ))}
            </div>
            {errors.color && (
              <p className="mt-1 text-sm text-red-600">{errors.color.message}</p>
            )}
          </div>

          <Input
            label="Icon (Optional)"
            placeholder="e.g., 🏠, 🚗, 💰"
            error={errors.icon?.message}
            {...register('icon')}
          />

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {editingCategory ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}