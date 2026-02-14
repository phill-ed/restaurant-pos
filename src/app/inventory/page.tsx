'use client';

import React, { useState } from 'react';
import { usePOS } from '@/context/POSContext';
import MainLayout from '@/components/layout/MainLayout';
import { 
  Package, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Filter
} from 'lucide-react';
import { InventoryItem } from '@/types';

export default function InventoryPage() {
  const { inventory, addInventoryItem, updateInventoryItem, deleteInventoryItem } = usePOS();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [showLowStock, setShowLowStock] = useState(false);

  const categories = [...new Set(inventory.map(i => i.category))];

  const filteredItems = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !categoryFilter || item.category === categoryFilter;
    const matchesLowStock = !showLowStock || item.quantity <= item.minStock;
    return matchesSearch && matchesCategory && matchesLowStock;
  });

  const lowStockItems = inventory.filter(i => i.quantity <= i.minStock);
  const totalValue = inventory.reduce((sum, i) => sum + (i.quantity * i.costPerUnit), 0);

  const getStockStatus = (item: InventoryItem) => {
    if (item.quantity <= item.minStock * 0.5) return { color: 'text-red-600', bg: 'bg-red-50', label: 'Critical' };
    if (item.quantity <= item.minStock) return { color: 'text-amber-600', bg: 'bg-amber-50', label: 'Low' };
    return { color: 'text-green-600', bg: 'bg-green-50', label: 'Good' };
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
              <h1 className="text-2xl font-bold text-slate-900">Inventory Management</h1>
              <p className="text-slate-500">Track stock levels and supplies</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            Add Item
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-500">Total Items</p>
              <Package className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{inventory.length}</p>
          </div>
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-500">Low Stock Alerts</p>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-amber-600">{lowStockItems.length}</p>
          </div>
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-500">Total Value</p>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold text-emerald-600">${totalValue.toFixed(2)}</p>
          </div>
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-500">Categories</p>
              <Filter className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{categories.length}</p>
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
          <div className="flex gap-2">
            <button
              onClick={() => setCategoryFilter(null)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                !categoryFilter 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  categoryFilter === cat 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowLowStock(!showLowStock)}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              showLowStock 
                ? 'bg-amber-600 text-white' 
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <AlertTriangle size={18} />
            Low Stock
          </button>
        </div>

        {/* Inventory Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Item</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Category</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Quantity</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Unit</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Min Stock</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Cost</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Status</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredItems.map(item => {
                  const status = getStockStatus(item);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">{item.name}</div>
                        {item.supplier && (
                          <div className="text-xs text-slate-500">{item.supplier}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{item.category}</td>
                      <td className="px-4 py-3">
                        <span className={`font-medium ${status.color}`}>{item.quantity}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{item.unit}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{item.minStock}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">${item.costPerUnit.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditingItem(item)}
                            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => deleteInventoryItem(item.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 size={16} />
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
              <p className="text-slate-500">No items found</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingItem) && (
        <InventoryModal
          item={editingItem}
          onClose={() => {
            setShowAddModal(false);
            setEditingItem(null);
          }}
          onSave={(data) => {
            if (editingItem) {
              updateInventoryItem(editingItem.id, data);
            } else {
              addInventoryItem(data);
            }
            setShowAddModal(false);
            setEditingItem(null);
          }}
        />
      )}
    </MainLayout>
  );
}

function InventoryModal({ 
  item, 
  onClose, 
  onSave 
}: { 
  item?: InventoryItem;
  onClose: () => void;
  onSave: (item: Omit<InventoryItem, 'id'>) => void;
}) {
  const [formData, setFormData] = useState({
    name: item?.name || '',
    category: item?.category || '',
    quantity: item?.quantity || 0,
    unit: item?.unit || 'pieces',
    minStock: item?.minStock || 5,
    costPerUnit: item?.costPerUnit || 0,
    lastRestocked: item?.lastRestocked || new Date().toISOString().split('T')[0],
    supplier: item?.supplier || '',
  });

  const categories = ['Meat', 'Vegetables', 'Dry Goods', 'Beverages', 'Dessert', 'Dairy', 'Other'];
  const units = ['pieces', 'kg', 'liters', 'boxes', 'bottles', 'cans', 'bags'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      quantity: Number(formData.quantity),
      minStock: Number(formData.minStock),
      costPerUnit: Number(formData.costPerUnit),
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
            <label className="label">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="input"
              required
            >
              <option value="">Select category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Quantity</label>
              <input
                type="number"
                min="0"
                required
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                className="input"
              />
            </div>
            <div>
              <label className="label">Unit</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="input"
              >
                {units.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Min Stock</label>
              <input
                type="number"
                min="0"
                required
                value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })}
                className="input"
              />
            </div>
            <div>
              <label className="label">Cost per Unit ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.costPerUnit}
                onChange={(e) => setFormData({ ...formData, costPerUnit: Number(e.target.value) })}
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="label">Supplier (optional)</label>
            <input
              type="text"
              value={formData.supplier}
              onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              className="input"
            />
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
