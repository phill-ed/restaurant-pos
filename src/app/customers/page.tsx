'use client';

import React, { useState } from 'react';
import { usePOS } from '@/context/POSContext';
import MainLayout from '@/components/layout/MainLayout';
import { 
  UserCircle, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Star,
  Mail,
  Phone,
  History,
  Award
} from 'lucide-react';
import { Customer } from '@/types';

export default function CustomersPage() {
  const { customers, addCustomer, updateCustomer } = usePOS();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const filteredCustomers = customers.filter(customer => {
    return customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
           customer.phone.includes(searchQuery);
  });

  const getLoyaltyTier = (points: number) => {
    if (points >= 1000) return { tier: 'Platinum', color: 'bg-purple-100 text-purple-700' };
    if (points >= 500) return { tier: 'Gold', color: 'bg-yellow-100 text-yellow-700' };
    if (points >= 100) return { tier: 'Silver', color: 'bg-gray-100 text-gray-700' };
    return { tier: 'Bronze', color: 'bg-orange-100 text-orange-700' };
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-100 rounded-lg">
              <UserCircle className="w-6 h-6 text-pink-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Customer Management</h1>
              <p className="text-slate-500">Manage loyalty program and customer data</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            Add Customer
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-500">Total Customers</p>
              <UserCircle className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{customers.length}</p>
          </div>
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-500">Total Visits</p>
              <History className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {customers.reduce((sum, c) => sum + c.visitCount, 0)}
            </p>
          </div>
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-500">Total Revenue</p>
              <Star className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold text-emerald-600">
              ${customers.reduce((sum, c) => sum + c.totalSpent, 0).toFixed(2)}
            </p>
          </div>
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-500">Loyalty Points</p>
              <Award className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-purple-600">
              {customers.reduce((sum, c) => sum + c.loyaltyPoints, 0)}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10"
          />
        </div>

        {/* Customer List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map(customer => {
            const { tier, color } = getLoyaltyTier(customer.loyaltyPoints);
            return (
              <div 
                key={customer.id} 
                className="card hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedCustomer(customer)}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center text-white font-bold text-lg">
                    {customer.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900 truncate">{customer.name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
                        {tier}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-slate-500">
                      <div className="flex items-center gap-1">
                        <Mail size={12} />
                        <span className="truncate">{customer.email}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone size={12} />
                        <span>{customer.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-lg font-bold text-emerald-600">{customer.loyaltyPoints}</p>
                    <p className="text-xs text-slate-500">Points</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-slate-900">{customer.visitCount}</p>
                    <p className="text-xs text-slate-500">Visits</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-slate-900">${customer.totalSpent.toFixed(0)}</p>
                    <p className="text-xs text-slate-500">Spent</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredCustomers.length === 0 && (
          <div className="card text-center py-12">
            <UserCircle className="w-12 h-12 mx-auto mb-2 text-slate-300" />
            <p className="text-slate-500">No customers found</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingCustomer) && (
        <CustomerModal
          customer={editingCustomer}
          onClose={() => {
            setShowAddModal(false);
            setEditingCustomer(null);
          }}
          onSave={(data) => {
            if (editingCustomer) {
              updateCustomer(editingCustomer.id, data);
            } else {
              addCustomer(data);
            }
            setShowAddModal(false);
            setEditingCustomer(null);
          }}
        />
      )}

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <CustomerDetailModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          onEdit={() => {
            setEditingCustomer(selectedCustomer);
            setSelectedCustomer(null);
          }}
        />
      )}
    </MainLayout>
  );
}

function CustomerModal({ 
  customer, 
  onClose, 
  onSave 
}: { 
  customer?: Customer;
  onClose: () => void;
  onSave: (customer: Omit<Customer, 'id' | 'loyaltyPoints' | 'totalSpent' | 'visitCount' | 'createdAt'>) => void;
}) {
  const [formData, setFormData] = useState({
    name: customer?.name || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{customer ? 'Edit Customer' : 'Add New Customer'}</h2>
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
            <label className="label">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input"
            />
          </div>

          <div>
            <label className="label">Phone</label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="input"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary flex-1">
              {customer ? 'Save Changes' : 'Add Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CustomerDetailModal({ 
  customer, 
  onClose, 
  onEdit 
}: { 
  customer: Customer;
  onClose: () => void;
  onEdit: () => void;
}) {
  const { tier, color } = getLoyaltyTier(customer.loyaltyPoints);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Customer Details</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4">
          <div className="text-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-3">
              {customer.name.charAt(0)}
            </div>
            <h3 className="text-xl font-bold text-slate-900">{customer.name}</h3>
            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium mt-2 ${color}`}>
              {tier} Member
            </span>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <Mail size={18} className="text-slate-400" />
              <span className="text-slate-600">{customer.email}</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <Phone size={18} className="text-slate-400" />
              <span className="text-slate-600">{customer.phone}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="text-center p-3 bg-emerald-50 rounded-lg">
              <p className="text-xl font-bold text-emerald-600">{customer.loyaltyPoints}</p>
              <p className="text-xs text-slate-500">Points</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-xl font-bold text-blue-600">{customer.visitCount}</p>
              <p className="text-xs text-slate-500">Visits</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-xl font-bold text-purple-600">${customer.totalSpent.toFixed(0)}</p>
              <p className="text-xs text-slate-500">Total Spent</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={onEdit} className="flex-1 btn btn-secondary flex items-center justify-center gap-2">
              <Edit2 size={18} />
              Edit
            </button>
            <button onClick={onClose} className="flex-1 btn btn-primary">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
