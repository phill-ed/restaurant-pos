'use client';

import React, { useState } from 'react';
import { usePOS } from '@/context/POSContext';
import MainLayout from '@/components/layout/MainLayout';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  Check, 
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Category, MenuItem } from '@/types';

export default function MenuPage() {
  const { categories, menuItems, addMenuItem, updateMenuItem, deleteMenuItem, addCategory } = usePOS();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [showAddCategory, setShowAddCategory] = useState(false);

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || item.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || 'Unknown';
  };

  const getCategoryColor = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.color || '#6B7280';
  };

  const getAvailabilityIcon = (availability: string) => {
    switch (availability) {
      case 'available':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'limited':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'unavailable':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Menu Management</h1>
            <p className="text-slate-500">Manage your menu items and categories</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowAddCategory(true)}
              className="btn btn-secondary"
            >
              Add Category
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="btn btn-primary flex items-center gap-2"
            >
              <Plus size={20} />
              Add Item
            </button>
          </div>
        </div>

        {/* Categories Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
              !selectedCategory 
                ? 'bg-emerald-600 text-white' 
                : 'bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            All Items
          </button>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                selectedCategory === category.id 
                  ? 'text-white' 
                  : 'bg-white text-slate-700 hover:bg-slate-100'
              }`}
              style={selectedCategory === category.id ? { backgroundColor: category.color } : {}}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10"
          />
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map(item => (
            <div 
              key={item.id} 
              className="card hover:shadow-md transition-shadow"
            >
              {/* Image Placeholder */}
              <div className="h-32 bg-slate-100 rounded-lg mb-3 flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-slate-300" />
              </div>

              {/* Content */}
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-slate-900">{item.name}</h3>
                  {getAvailabilityIcon(item.availability)}
                </div>
                <p className="text-sm text-slate-500 line-clamp-2">{item.description}</p>
                
                <div className="flex items-center gap-2">
                  <span 
                    className="text-xs px-2 py-1 rounded-full text-white"
                    style={{ backgroundColor: getCategoryColor(item.categoryId) }}
                  >
                    {getCategoryName(item.categoryId)}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-lg font-bold text-emerald-600">${item.price.toFixed(2)}</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setEditingItem(item)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => deleteMenuItem(item.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500">No menu items found</p>
          </div>
        )}
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <MenuItemModal 
          categories={categories}
          onClose={() => setShowAddModal(false)}
          onSave={(item) => {
            addMenuItem(item);
            setShowAddModal(false);
          }}
        />
      )}

      {/* Edit Item Modal */}
      {editingItem && (
        <MenuItemModal 
          categories={categories}
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={(item) => {
            updateMenuItem(editingItem.id, item);
            setEditingItem(null);
          }}
        />
      )}

      {/* Add Category Modal */}
      {showAddCategory && (
        <CategoryModal 
          onClose={() => setShowAddCategory(false)}
          onSave={(category) => {
            addCategory(category);
            setShowAddCategory(false);
          }}
        />
      )}
    </MainLayout>
  );
}

function MenuItemModal({ 
  categories, 
  item, 
  onClose, 
  onSave 
}: { 
  categories: Category[];
  item?: MenuItem;
  onClose: () => void;
  onSave: (item: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
}) {
  const [formData, setFormData] = useState({
    name: item?.name || '',
    description: item?.description || '',
    price: item?.price || 0,
    categoryId: item?.categoryId || categories[0]?.id || '',
    availability: item?.availability || 'available',
    preparationTime: item?.preparationTime || 15,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      price: Number(formData.price),
      preparationTime: Number(formData.preparationTime),
      ingredients: item?.ingredients || [],
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{item ? 'Edit Item' : 'Add New Item'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="label">Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input"
            />
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Price ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="input"
              />
            </div>

            <div>
              <label className="label">Prep Time (min)</label>
              <input
                type="number"
                min="1"
                required
                value={formData.preparationTime}
                onChange={(e) => setFormData({ ...formData, preparationTime: Number(e.target.value) })}
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="label">Category</label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="input"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Availability</label>
            <select
              value={formData.availability}
              onChange={(e) => setFormData({ ...formData, availability: e.target.value as any })}
              className="input"
            >
              <option value="available">Available</option>
              <option value="limited">Limited</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary flex-1">
              {item ? 'Save Changes' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CategoryModal({ 
  onClose, 
  onSave 
}: { 
  onClose: () => void;
  onSave: (category: Omit<Category, 'id'>) => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    icon: 'utensils',
    color: '#10B981',
  });

  const colors = [
    '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', 
    '#EC4899', '#06B6D4', '#84CC16'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      sortOrder: 1,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Add New Category</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="label">Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input"
            />
          </div>

          <div>
            <label className="label">Color</label>
            <div className="flex gap-2 flex-wrap">
              {colors.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-8 h-8 rounded-full transition-transform ${
                    formData.color === color ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary flex-1">
              Add Category
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
