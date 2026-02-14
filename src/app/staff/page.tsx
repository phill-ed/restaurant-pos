'use client';

import React, { useState } from 'react';
import { usePOS } from '@/context/POSContext';
import MainLayout from '@/components/layout/MainLayout';
import { 
  Users, 
  Plus, 
  Search, 
  Edit2, 
  Trash2,
  X,
  Shield,
  UserCheck,
  UserX,
  Clock
} from 'lucide-react';
import { User } from '@/types';

export default function StaffPage() {
  const { users, addCustomer, updateCustomer } = usePOS();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    pin: '',
    role: 'waiter' as User['role'],
    active: true
  });

  const roleLabels: Record<User['role'], string> = {
    admin: 'Administrator',
    waiter: 'Waiter',
    kitchen: 'Kitchen Staff',
    cashier: 'Cashier'
  };

  const roleColors: Record<User['role'], string> = {
    admin: 'bg-purple-100 text-purple-700',
    waiter: 'bg-blue-100 text-blue-700',
    kitchen: 'bg-orange-100 text-orange-700',
    cashier: 'bg-green-100 text-green-700'
  };

  const getFilteredUsers = () => {
    return users.filter(user => {
      const matchesSearch = 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  };

  const filteredUsers = getFilteredUsers();
  
  const activeUsers = users.filter(u => u.active).length;
  const adminCount = users.filter(u => u.role === 'admin').length;
  const waiterCount = users.filter(u => u.role === 'waiter').length;

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      pin: '',
      role: 'waiter',
      active: true
    });
  };

  const handleAdd = () => {
    // Using the POS context addCustomer as a workaround for staff
    // In a real app, this would be a separate addStaff function
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      role: formData.role,
      pin: formData.pin,
      active: formData.active,
      createdAt: new Date().toISOString()
    };
    
    // This would need to be implemented properly in the context
    console.log('Adding staff:', newUser);
    
    // For demo, we'll just close the modal
    resetForm();
    setShowAddModal(false);
  };

  const handleEdit = () => {
    if (editingUser) {
      // Update logic here
      console.log('Editing user:', { ...editingUser, ...formData });
      setEditingUser(null);
      resetForm();
    }
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      pin: user.pin,
      role: user.role,
      active: user.active
    });
  };

  const toggleUserStatus = (user: User) => {
    // Toggle active status
    console.log('Toggling user status:', user.id);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Users className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Staff Management</h1>
              <p className="text-slate-500">Manage team members and permissions</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            Add Staff
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <UserCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Active Staff</p>
                <p className="text-2xl font-bold text-slate-900">{activeUsers}</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Admins</p>
                <p className="text-2xl font-bold text-slate-900">{adminCount}</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Waiters</p>
                <p className="text-2xl font-bold text-slate-900">{waiterCount}</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-lg">
                <UserX className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Inactive</p>
                <p className="text-2xl font-bold text-slate-900">{users.length - activeUsers}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search staff..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'admin', 'waiter', 'kitchen', 'cashier'] as const).map(role => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  roleFilter === role 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {role === 'all' ? 'All' : roleLabels[role as User['role']]}
              </button>
            ))}
          </div>
        </div>

        {/* Staff Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map(user => (
            <div 
              key={user.id} 
              className={`card ${!user.active ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold text-slate-600">
                      {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{user.name}</h3>
                    <p className="text-sm text-slate-500">{user.email}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[user.role]}`}>
                  {roleLabels[user.role]}
                </span>
              </div>
              
              <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center gap-2 text-slate-500">
                  <Clock size={14} />
                  <span>Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <span className="w-4 h-4 flex items-center justify-center bg-slate-100 rounded text-xs font-mono">
                    {user.pin}
                  </span>
                  <span>PIN Code</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <button
                  onClick={() => toggleUserStatus(user)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
                    user.active 
                      ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                      : 'bg-green-50 text-green-600 hover:bg-green-100'
                  }`}
                >
                  {user.active ? (
                    <>
                      <UserX size={16} />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <UserCheck size={16} />
                      Activate
                    </>
                  )}
                </button>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(user)}
                    className="p-1.5 hover:bg-slate-100 rounded"
                  >
                    <Edit2 size={16} className="text-slate-600" />
                  </button>
                  {user.role !== 'admin' && (
                    <button
                      className="p-1.5 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={16} className="text-red-600" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredUsers.length === 0 && (
          <div className="card text-center py-12">
            <Users className="w-12 h-12 mx-auto mb-2 text-slate-300" />
            <p className="text-slate-500">No staff members found</p>
          </div>
        )}

        {/* Role Permissions Info */}
        <div className="card">
          <h3 className="font-semibold text-slate-900 mb-4">Role Permissions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-700 mb-2">Admin</h4>
              <ul className="text-sm text-purple-600 space-y-1">
                <li>• Full system access</li>
                <li>• Manage staff</li>
                <li>• View all reports</li>
                <li>• System settings</li>
              </ul>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-700 mb-2">Waiter</h4>
              <ul className="text-sm text-blue-600 space-y-1">
                <li>• Take orders</li>
                <li>• Manage tables</li>
                <li>• Process payments</li>
                <li>• View own sales</li>
              </ul>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <h4 className="font-medium text-orange-700 mb-2">Kitchen</h4>
              <ul className="text-sm text-orange-600 space-y-1">
                <li>• View kitchen orders</li>
                <li>• Update order status</li>
                <li>• Mark items ready</li>
              </ul>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-700 mb-2">Cashier</h4>
              <ul className="text-sm text-green-600 space-y-1">
                <li>• Process payments</li>
                <li>• View receipts</li>
                <li>• Daily reports</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingUser) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {editingUser ? 'Edit Staff Member' : 'Add New Staff Member'}
              </h2>
              <button 
                onClick={() => {
                  setShowAddModal(false);
                  setEditingUser(null);
                  resetForm();
                }} 
                className="p-1 hover:bg-slate-100 rounded"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  placeholder="John Doe"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input"
                  placeholder="john@restaurant.com"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">PIN Code</label>
                  <input
                    type="text"
                    value={formData.pin}
                    onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
                    className="input"
                    placeholder="4-digit PIN"
                    maxLength={4}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as User['role'] })}
                    className="input"
                  >
                    <option value="waiter">Waiter</option>
                    <option value="kitchen">Kitchen Staff</option>
                    <option value="cashier">Cashier</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              
              {editingUser && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="active" className="text-sm text-slate-700">
                    Account is active
                  </label>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-slate-200 flex gap-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingUser(null);
                  resetForm();
                }}
                className="flex-1 btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={editingUser ? handleEdit : handleAdd}
                disabled={!formData.name || !formData.email || !formData.pin}
                className="flex-1 btn btn-primary"
              >
                {editingUser ? 'Save Changes' : 'Add Staff'}
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
