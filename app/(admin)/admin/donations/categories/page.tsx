/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Badge } from '@/app/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Separator } from '@/app/components/ui/separator';
import { Checkbox } from '@/app/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/app/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import {
  Heart,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Eye,
  EyeOff,
  Star,
  StarOff,
  Loader2,
  Save,
  X,
  GripVertical,
} from 'lucide-react';
import ProfessionalLoader from '@/app/components/ProfessionalLoader';
import { Id } from '@/convex/_generated/dataModel';
import { DonationCategoryFormData } from '@/lib/types/donation';
import { validateDonationCategory } from '@/lib/validators/donation';

const DonationCategoriesPage = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState<DonationCategoryFormData>({
    name: '',
    description: '',
    icon: '',
    color: '#3b82f6',
    minAmount: undefined,
    maxAmount: undefined,
    isPopular: false,
  });

  // Convex queries and mutations
  const categories = useQuery(api.donationCategories.getAllCategories);
  const createCategory = useMutation(api.donationCategories.createCategory);
  const updateCategory = useMutation(api.donationCategories.updateCategory);
  const deleteCategory = useMutation(api.donationCategories.deleteCategory);
  const initializeDefaults = useMutation(api.donationCategories.initializeDefaultCategories);

  const handleInputChange = (field: keyof DonationCategoryFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      icon: '',
      color: '#3b82f6',
      minAmount: undefined,
      maxAmount: undefined,
      isPopular: false,
    });
  };

  const handleCreateCategory = async () => {
    const validation = validateDonationCategory(formData);
    if (!validation.success) {
      toast.error("Please fix the form errors");
      return;
    }

    setIsSubmitting(true);
    try {
      await createCategory(formData);
      toast.success("Category created successfully");
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Create category error:', error);
      toast.error("Failed to create category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCategory = async () => {
    if (!editingCategory) return;

    const validation = validateDonationCategory(formData);
    if (!validation.success) {
      toast.error("Please fix the form errors");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateCategory({
        categoryId: editingCategory._id,
        ...formData,
      });
      toast.success("Category updated successfully");
      setIsEditDialogOpen(false);
      setEditingCategory(null);
      resetForm();
    } catch (error) {
      console.error('Update category error:', error);
      toast.error("Failed to update category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (categoryId: Id<"donationCategories">) => {
    if (!confirm("Are you sure you want to delete this category? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteCategory({ categoryId });
      toast.success("Category deleted successfully");
    } catch (error) {
      console.error('Delete category error:', error);
      toast.error("Failed to delete category");
    }
  };

  const handleToggleActive = async (categoryId: Id<"donationCategories">, isActive: boolean) => {
    try {
      await updateCategory({
        categoryId,
        isActive: !isActive,
      });
      toast.success(`Category ${!isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Toggle active error:', error);
      toast.error("Failed to update category");
    }
  };

  const handleTogglePopular = async (categoryId: Id<"donationCategories">, isPopular: boolean) => {
    try {
      await updateCategory({
        categoryId,
        isPopular: !isPopular,
      });
      toast.success(`Category ${!isPopular ? 'marked as popular' : 'removed from popular'} successfully`);
    } catch (error) {
      console.error('Toggle popular error:', error);
      toast.error("Failed to update category");
    }
  };

  const openEditDialog = (category: any) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      icon: category.icon || '',
      color: category.color || '#3b82f6',
      minAmount: category.minAmount,
      maxAmount: category.maxAmount,
      isPopular: category.isPopular || false,
    });
    setIsEditDialogOpen(true);
  };

  const handleInitializeDefaults = async () => {
    if (!confirm("This will create default donation categories. Continue?")) {
      return;
    }

    try {
      await initializeDefaults({});
      toast.success("Default categories initialized successfully");
    } catch (error) {
      console.error('Initialize defaults error:', error);
      toast.error("Failed to initialize default categories");
    }
  };

  if (!categories) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Donation Categories</h1>
          <p className="text-muted-foreground">
            Manage donation categories and their settings.
          </p>
        </div>
        <div className="flex items-center justify-center py-20">
          <ProfessionalLoader 
            message="Loading categories..." 
            size="lg"
            className="py-12"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Donation Categories</h1>
          <p className="text-muted-foreground">
            Manage donation categories and their settings.
          </p>
        </div>
        <div className="flex gap-2">
          {categories.length === 0 && (
            <Button
              onClick={handleInitializeDefaults}
              variant="outline"
            >
              Initialize Defaults
            </Button>
          )}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Category</DialogTitle>
              </DialogHeader>
              <CategoryForm
                formData={formData}
                onInputChange={handleInputChange}
                onSubmit={handleCreateCategory}
                onCancel={() => {
                  setIsCreateDialogOpen(false);
                  resetForm();
                }}
                isSubmitting={isSubmitting}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Categories</span>
            <Badge variant="secondary">
              {categories.length} categories
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Popular</TableHead>
                  <TableHead>Amount Limits</TableHead>
                  <TableHead>Sort Order</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category._id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: category.color + '20' }}
                        >
                          <Heart 
                            className="h-4 w-4" 
                            style={{ color: category.color }}
                          />
                        </div>
                        <div>
                          <div className="font-medium">{category.name}</div>
                          {category.isDefault && (
                            <Badge variant="outline" className="text-xs">
                              Default
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-600 max-w-xs truncate">
                        {category.description || 'No description'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={category.isActive ? "default" : "secondary"}
                        className="flex items-center gap-1 w-fit"
                      >
                        {category.isActive ? (
                          <Eye className="h-3 w-3" />
                        ) : (
                          <EyeOff className="h-3 w-3" />
                        )}
                        {category.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={category.isPopular ? "default" : "outline"}
                        className="flex items-center gap-1 w-fit"
                      >
                        {category.isPopular ? (
                          <Star className="h-3 w-3" />
                        ) : (
                          <StarOff className="h-3 w-3" />
                        )}
                        {category.isPopular ? 'Popular' : 'Regular'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {category.minAmount && (
                          <div>Min: ₹{category.minAmount}</div>
                        )}
                        {category.maxAmount && (
                          <div>Max: ₹{category.maxAmount}</div>
                        )}
                        {!category.minAmount && !category.maxAmount && (
                          <span className="text-gray-500">No limits</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <GripVertical className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{category.sortOrder}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(category)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleToggleActive(category._id, category.isActive)}
                          >
                            {category.isActive ? (
                              <>
                                <EyeOff className="h-4 w-4 mr-2" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <Eye className="h-4 w-4 mr-2" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleTogglePopular(category._id, category.isPopular)}
                          >
                            {category.isPopular ? (
                              <>
                                <StarOff className="h-4 w-4 mr-2" />
                                Remove from Popular
                              </>
                            ) : (
                              <>
                                <Star className="h-4 w-4 mr-2" />
                                Mark as Popular
                              </>
                            )}
                          </DropdownMenuItem>
                          {!category.isDefault && (
                            <DropdownMenuItem
                              onClick={() => handleDeleteCategory(category._id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {categories.length === 0 && (
            <div className="text-center py-8">
              <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No categories found
              </h3>
              <p className="text-gray-500 mb-4">
                Create your first donation category or initialize default categories.
              </p>
              <Button onClick={handleInitializeDefaults} variant="outline">
                Initialize Default Categories
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <CategoryForm
            formData={formData}
            onInputChange={handleInputChange}
            onSubmit={handleEditCategory}
            onCancel={() => {
              setIsEditDialogOpen(false);
              setEditingCategory(null);
              resetForm();
            }}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Category Form Component
interface CategoryFormProps {
  formData: DonationCategoryFormData;
  onInputChange: (field: keyof DonationCategoryFormData, value: any) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const CategoryForm: React.FC<CategoryFormProps> = ({
  formData,
  onInputChange,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Category Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => onInputChange('name', e.target.value)}
            placeholder="e.g., Education Support"
          />
        </div>
        <div>
          <Label htmlFor="color">Color</Label>
          <div className="flex items-center space-x-2">
            <Input
              id="color"
              type="color"
              value={formData.color}
              onChange={(e) => onInputChange('color', e.target.value)}
              className="w-16 h-10"
            />
            <Input
              value={formData.color}
              onChange={(e) => onInputChange('color', e.target.value)}
              placeholder="#3b82f6"
              className="flex-1"
            />
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => onInputChange('description', e.target.value)}
          placeholder="Brief description of this category..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="minAmount">Minimum Amount (₹)</Label>
          <Input
            id="minAmount"
            type="number"
            value={formData.minAmount || ''}
            onChange={(e) => onInputChange('minAmount', e.target.value ? Number(e.target.value) : undefined)}
            placeholder="e.g., 100"
            min="1"
          />
        </div>
        <div>
          <Label htmlFor="maxAmount">Maximum Amount (₹)</Label>
          <Input
            id="maxAmount"
            type="number"
            value={formData.maxAmount || ''}
            onChange={(e) => onInputChange('maxAmount', e.target.value ? Number(e.target.value) : undefined)}
            placeholder="e.g., 10000"
            min="1"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="isPopular"
          checked={formData.isPopular}
          onCheckedChange={(checked) => onInputChange('isPopular', checked)}
        />
        <Label htmlFor="isPopular">Mark as popular category</Label>
      </div>

      <Separator />

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button onClick={onSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {isSubmitting ? 'Saving...' : 'Save Category'}
        </Button>
      </div>
    </div>
  );
};

export default DonationCategoriesPage;
