'use client';

import React from 'react';
import { usePOS } from '@/context/POSContext';
import MainLayout from '@/components/layout/MainLayout';
import Link from 'next/link';
import { 
  DollarSign, 
  ShoppingCart, 
  TrendingUp, 
  Users, 
  UtensilsCrossed, 
  Grid3X3,
  ChefHat,
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const CHART_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function DashboardPage() {
  const { 
    currentUser, 
    todaySales, 
    todayOrders, 
    todayAverage, 
    popularItems,
    activeOrders,
    tables,
    customers
  } = usePOS();

  const availableTables = tables.filter(t => t.status === 'available').length;
  const occupiedTables = tables.filter(t => t.status === 'occupied').length;
  const totalTables = tables.length;

  // Mock data for charts (in real app, this would come from historical data)
  const weeklyData = [
    { day: 'Mon', sales: 1250, orders: 45 },
    { day: 'Tue', sales: 1480, orders: 52 },
    { day: 'Wed', sales: 1320, orders: 48 },
    { day: 'Thu', sales: 1650, orders: 58 },
    { day: 'Fri', sales: 2100, orders: 72 },
    { day: 'Sat', sales: 2450, orders: 85 },
    { day: 'Sun', sales: 1890, orders: 65 },
  ];

  const tableStatusData = [
    { name: 'Available', value: availableTables, color: '#10B981' },
    { name: 'Occupied', value: occupiedTables, color: '#F59E0B' },
    { name: 'Other', value: totalTables - availableTables - occupiedTables, color: '#6B7280' },
  ];

  const totalRevenue = weeklyData.reduce((sum, d) => sum + d.sales, 0);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-500">Welcome back, {currentUser?.name}!</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Clock size={16} />
            <span>{new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Today's Sales */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="flex items-center text-green-600 text-sm font-medium">
                <ArrowUpRight size={16} className="mr-1" />
                12%
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900">${todaySales.toFixed(2)}</p>
            <p className="text-sm text-slate-500">Today's Sales</p>
          </div>

          {/* Today's Orders */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
              </div>
              <span className="flex items-center text-green-600 text-sm font-medium">
                <ArrowUpRight size={16} className="mr-1" />
                8%
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{todayOrders}</p>
            <p className="text-sm text-slate-500">Today's Orders</p>
          </div>

          {/* Average Order */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <span className="flex items-center text-red-600 text-sm font-medium">
                <ArrowDownRight size={16} className="mr-1" />
                3%
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900">${todayAverage.toFixed(2)}</p>
            <p className="text-sm text-slate-500">Avg. Order Value</p>
          </div>

          {/* Active Customers */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="w-5 h-5 text-orange-600" />
              </div>
              <span className="flex items-center text-green-600 text-sm font-medium">
                <ArrowUpRight size={16} className="mr-1" />
                5%
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{customers.length}</p>
            <p className="text-sm text-slate-500">Total Customers</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weekly Sales Chart */}
          <div className="lg:col-span-2 card">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Weekly Sales</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="day" stroke="#64748B" fontSize={12} />
                  <YAxis stroke="#64748B" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="sales" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Table Status */}
          <div className="card">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Table Status</h2>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tableStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {tableStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-2">
              {tableStatusData.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-slate-600">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Popular Items */}
          <div className="card">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Popular Items Today</h2>
            {popularItems.length > 0 ? (
              <div className="space-y-3">
                {popularItems.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 flex items-center justify-center bg-slate-100 rounded-full text-xs font-medium text-slate-600">
                        {index + 1}
                      </span>
                      <span className="font-medium text-slate-700">{item.name}</span>
                    </div>
                    <span className="text-sm text-slate-500">{item.quantity} sold</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-center py-4">No orders yet today</p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/orders" className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors">
                <div className="p-2 bg-emerald-600 rounded-lg">
                  <UtensilsCrossed className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">New Order</p>
                  <p className="text-xs text-slate-500">{activeOrders.length} active</p>
                </div>
              </Link>

              <Link href="/tables" className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Grid3X3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Tables</p>
                  <p className="text-xs text-slate-500">{availableTables} available</p>
                </div>
              </Link>

              <Link href="/kitchen" className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                <div className="p-2 bg-orange-600 rounded-lg">
                  <ChefHat className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Kitchen</p>
                  <p className="text-xs text-slate-500">View orders</p>
                </div>
              </Link>

              <Link href="/reports" className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                <div className="p-2 bg-purple-600 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Reports</p>
                  <p className="text-xs text-slate-500">View analytics</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
