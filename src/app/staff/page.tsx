'use client';

import React, { useState } from 'react';
import { usePOS } from '@/context/POSContext';
import MainLayout from '@/components/layout/MainLayout';
import { 
  Users, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Shield,
  UserCheck,
  UserX,
  Clock
} from 'lucide-react';
import { User, UserRole } from '@/types';

export default function StaffPage() {
  const { users, addCategory } = usePOS();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  // Note: We don't have full CRUD for users in context, just showing the list
  // This is a simplified version

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-700';
      case 'waiter': return 'bg-blue-100 text-blue-700';
      case 'kitchen': return 'bg-orange-100 text-orange-700';
      case 'cashier': return 'bg-green-100 text-green-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin': return <Shield size={16} />;
      case 'waiter': return <UserCheck size={16} />;
      case 'kitchen': return <Clock size={16} />;
      case 'cashier': return <Users size={16} />;
      default: return <Users size={16} />;
    }
  };

  const stats = {
    total: users.length,
    active: users.filter(u => u.active).length,
    admin: users.filter(u => u.role === 'admin').length,
    staff: users.filter(u => u.role !== 'admin').length,
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
              <p className="text-slate-500">Manage team members and roles</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-500">Total Staff</p>
              <Users className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
          </div>
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-500">Active</p>
              <UserCheck className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
          </div>
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-500">Admins</p>
              <Shield className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-purple-600">{stats.admin}</p>
          </div>
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-500">Team Members</p>
              <Users className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-blue-600">{stats.staff}</p>
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
                {role === 'all' ? 'All' : role.charAt(0).toUpperCase() + role.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Staff List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map(user => (
            <div key={user.id} className="card">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-lg">
                  {user.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-slate-900 truncate">{user.name}</h3>
                    {user.active ? (
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    ) : (
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 truncate">{user.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {getRoleIcon(user.role)}
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-sm">
                <div className="text-slate-500">
                  PIN: <span className="font-mono text-slate-700">{user.pin}</span>
                </div>
                <div className="flex gap-2">
                  <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded">
                    <Edit2 size={16} />
                  </button>
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
      </div>
    </MainLayout>
  );
}
