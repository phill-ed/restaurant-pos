'use client';

import React, { useState } from 'react';
import { usePOS } from '@/context/POSContext';
import MainLayout from '@/components/layout/MainLayout';
import { 
  Package, 
  Plus, 
  Search, 
  Edit2, 
  Trash2,
  X,
  AlertTriangle,
  TrendingDown,
  TrendingUp
} from 'lucide-react';
import { InventoryItem } from '@/types';

export default function InventoryPage() {
  const { inventory, addInventoryItem, updateInventoryItem, deleteInventoryItem } = usePOS();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: 0,
    unit: 'units',
    minStock: 0,
    costPerUnit: 0,
    supplier: ''
  });

  const categories = [...new Set(inventory.map(item => item.category))].filter(Boolean);

  const getFilteredItems = () => {
    return inventory.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  };

  const filteredItems = getFilteredItems();
  
  const lowStockItems = inventory.filter(item => item.quantity <= item.minStock);
  const totalValue = inventory.reduce((sum, item) => sum + (item.quantity * item.costPerUnit), 0);
  const totalItems = inventory.reduce((sum, item) => sum + item.quantity, 0);

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      quantity: 0,
      unit: 'units',
      minStock: 0,
      costPerUnit: 0,
      supplier: ''
    });
  };

  const handleAdd = () => {
    addInventoryItem({
      name: formData.name,
      category: formData.category,
      quantity: formData.quantity,
      unit: formData.unit,
      minStock: formData.minStock,
      costPerUnit: formData.costPerUnit,
      lastRestocked: new Date().toISOString().split('T')[0],
      supplier: formData.supplier
    });
    resetForm();
    setShowAddModal(false);
  };

  const handleEdit = () => {
    if (editingItem) {
      updateInventoryItem(editingItem.id, {
        name: formData.name,
        category: formData.category,
        quantity: formData.quantity,
        unit: formData.unit,
        minStock: formData.minStock,
        costPerUnit: formData.costPerUnit,
        supplier: formData.supplier
      });
      setEditingItem(null);
      resetForm();
    }
  };

  const openEditModal = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      minStock: item.minStock,
      costPerUnit: item.costPerUnit,
      supplier: item.supplier || ''
    });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Package className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Inventory</h1>
              <p className="text-slate-500">Manage stock levels and suppliers</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            Add Item
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="card">
            <p className="text-sm text-slate-500">Total Items</p>
            <p className="text-2xl font-bold text-slate-900">{inventory.length}</p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-500">Total Value</p>
            <p className="text-2xl font-bold text-emerald-600">${totalValue.toFixed(2)}</p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-500">Low Stock</p>
            <p className="text-2xl font-bold text-amber-600">{lowStockItems.length}</p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-500">Out of Stock</p>
            <p className="text-2xl font-bold text-red-600">
              {inventory.filter(i => i.quantity === 0).length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search inventory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="input w-auto"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Low Stock Alert */}
        {lowStockItems.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h3 className="font-semibold text-amber-800">Low Stock Alert</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {lowStockItems.slice(0, 5).map(item => (
                <span 
                  key={item.id}
                  className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm"
                >
                  {item.name} ({item.quantity} {item.unit})
                </span>
              ))}
              {lowStockItems.length > 5 && (
                <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm">
                  +{lowStockItems.length - 5} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Inventory Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Item</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Category</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Quantity</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Min Stock</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Cost/Unit</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Value</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">Status</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredItems.map(item => {
                  const isLow = item.quantity <= item.minStock;
                  const isOut = item.quantity === 0;
                  
                  return (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-slate-900">{item.name}</p>
                          {item.supplier && (
                            <p className="text-xs text-slate-500">{item.supplier}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{item.category}</td>
                      <td className="px-4 py-3">
                        <span className={`
                          font-medium
                          ${isOut ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-slate-900'}
                        `}>
                          {item.quantity} {item.unit}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{item.minStock} {item.unit}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">${item.costPerUnit.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        ${(item.quantity * item.costPerUnit).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        {isOut ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                            <AlertTriangle size={12} />
                            Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs">
                            <TrendingDown size={12} />
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                            <TrendingUp size={12} />
                            In Stock
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-1.5 hover:bg-slate-100 rounded"
                          >
                            <Edit2 size={16} className="text-slate-600" />
                          </button>
                          <button
                            onClick={() => deleteInventoryItem(item.id)}
                            className="p-1.5 hover:bg-red-50 rounded"
                          >
                            <Trash2 size={16} className="text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 mx-auto mb-2 text-slate-300" />
              <p className="text-slate-500">No inventory items found</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingItem) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {editingItem ? 'Edit Item' : 'Add New Item'}
              </h2>
              <button 
                onClick={() => {
                  setShowAddModal(false);
                  setEditingItem(null);
                  resetForm();
                }} 
                className="p-1 hover:bg-slate-100 rounded"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  placeholder="Item name"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input"
                    placeholder="e.g., Meat, Vegetables"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Unit</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="input"
                  >
                    <option value="units">Units</option>
                    <option value="kg">Kilograms</option>
                    <option value="pieces">Pieces</option>
                    <option value="liters">Liters</option>
                    <option value="bottles">Bottles</option>
                    <option value="cans">Cans</option>
                    <option value="boxes">Boxes</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                    className="input"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Min Stock</label>
                  <input
                    type="number"
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: parseFloat(e.target.value) || 0 })}
                    className="input"
                    min="0"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cost Per Unit ($)</label>
                  <input
                    type="number"
                    value={formData.costPerUnit}
                    onChange={(e) => setFormData({ ...formData, costPerUnit: parseFloat(e.target.value) || 0 })}
                    className="input"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Supplier</label>
                  <input
                    type="text"
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    className="input"
                    placeholder="Supplier name"
                  />
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-200 flex gap-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingItem(null);
                  resetForm();
                }}
                className="flex-1 btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={editingItem ? handleEdit : handleAdd}
                disabled={!formData.name}
                className="flex-1 btn btn-primary"
              >
                {editingItem ? 'Save Changes' : 'Add Item'}
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
