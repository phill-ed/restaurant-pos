'use client';

import React, { useState } from 'react';
import { usePOS } from '@/context/POSContext';
import MainLayout from '@/components/layout/MainLayout';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Download,
  DollarSign,
  ShoppingCart,
  Users,
  UtensilsCrossed
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

type ReportPeriod = 'daily' | 'weekly' | 'monthly';

const CHART_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function ReportsPage() {
  const { orders, menuItems, customers, tables } = usePOS();
  const [period, setPeriod] = useState<ReportPeriod>('weekly');

  const getDateRange = () => {
    const now = new Date();
    const start = new Date();
    
    if (period === 'daily') {
      start.setDate(now.getDate() - 1);
    } else if (period === 'weekly') {
      start.setDate(now.getDate() - 7);
    } else {
      start.setDate(now.getDate() - 30);
    }
    
    return { start, end: now };
  };

  const filteredOrders = () => {
    const { start, end } = getDateRange();
    return orders.filter(o => {
      const orderDate = new Date(o.createdAt);
      return orderDate >= start && orderDate <= end && o.status === 'paid';
    });
  };

  const periodOrders = filteredOrders();
  
  // Calculate metrics
  const totalRevenue = periodOrders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = periodOrders.length;
  const avgOrderValue = totalOrders > 0 ? totalOrders > 0 ? totalRevenue / totalOrders : 0 : 0;
  const totalTax = periodOrders.reduce((sum, o) => sum + o.tax, 0);
  const totalTips = periodOrders.reduce((sum, o) => sum + o.tip, 0);

  // Daily/weekly sales data
  const salesData = () => {
    const data: Record<string, { sales: number; orders: number }> = {};
    
    periodOrders.forEach(order => {
      const date = new Date(order.createdAt);
      let key: string;
      
      if (period === 'daily') {
        key = date.toLocaleTimeString('en-US', { hour: '2-digit' });
      } else if (period === 'weekly') {
        key = date.toLocaleDateString('en-US', { weekday: 'short' });
      } else {
        key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
      
      if (!data[key]) {
        data[key] = { sales: 0, orders: 0 };
      }
      data[key].sales += order.total;
      data[key].orders += 1;
    });
    
    return Object.entries(data).map(([name, value]) => ({
      name,
      sales: Math.round(value.sales * 100) / 100,
      orders: value.orders
    })).sort((a, b) => {
      if (period === 'daily') return 0;
      if (period === 'weekly') {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return days.indexOf(a.name) - days.indexOf(b.name);
      }
      return 0;
    });
  };

  // Top selling items
  const topSellingItems = () => {
    const itemSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
    
    periodOrders.forEach(order => {
      order.items.forEach(item => {
        if (!itemSales[item.menuItem.name]) {
          itemSales[item.menuItem.name] = { name: item.menuItem.name, quantity: 0, revenue: 0 };
        }
        itemSales[item.menuItem.name].quantity += item.quantity;
        itemSales[item.menuItem.name].revenue += item.price * item.quantity;
      });
    });
    
    return Object.values(itemSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  };

  // Payment method breakdown
  const paymentMethodData = () => {
    const methods: Record<string, number> = {};
    
    periodOrders.forEach(order => {
      const method = order.paymentMethod || 'unknown';
      methods[method] = (methods[method] || 0) + order.total;
    });
    
    return Object.entries(methods).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: Math.round(value * 100) / 100
    }));
  };

  // Hourly distribution
  const hourlyData = () => {
    const hours: Record<number, number> = {};
    
    for (let i = 0; i < 24; i++) {
      hours[i] = 0;
    }
    
    periodOrders.forEach(order => {
      const hour = new Date(order.createdAt).getHours();
      hours[hour] = (hours[hour] || 0) + order.total;
    });
    
    return Object.entries(hours).map(([hour, sales]) => ({
      hour: `${hour}:00`,
      sales: Math.round(sales * 100) / 100
    }));
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Sales Reports</h1>
              <p className="text-slate-500">Analyze your restaurant performance</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            {(['daily', 'weekly', 'monthly'] as const).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  period === p 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900">${totalRevenue.toFixed(2)}</p>
            <p className="text-sm text-slate-500">Total Revenue</p>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
              </div>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{totalOrders}</p>
            <p className="text-sm text-slate-500">Total Orders</p>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">${avgOrderValue.toFixed(2)}</p>
            <p className="text-sm text-slate-500">Avg. Order Value</p>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900">${totalTips.toFixed(2)}</p>
            <p className="text-sm text-slate-500">Total Tips</p>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Over Time */}
          <div className="card">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Sales Overview</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={12} />
                  <YAxis stroke="#64748B" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Sales']}
                  />
                  <Bar dataKey="sales" fill="#10B981" radius={[4, 4, 0, 0]} name="Sales" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="card">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Payment Methods</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentMethodData()}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {paymentMethodData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Selling Items */}
          <div className="card">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Top Selling Items</h2>
            <div className="space-y-4">
              {topSellingItems().map((item, index) => (
                <div key={item.name} className="flex items-center gap-4">
                  <span className="w-6 h-6 flex items-center justify-center bg-slate-100 rounded-full text-sm font-medium text-slate-600">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium text-slate-900">{item.name}</span>
                      <span className="text-slate-600">${item.revenue.toFixed(2)}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${(item.revenue / topSellingItems()[0]?.revenue) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              {topSellingItems().length === 0 && (
                <p className="text-slate-500 text-center py-4">No data available</p>
              )}
            </div>
          </div>

          {/* Hourly Distribution */}
          <div className="card">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Hourly Sales Distribution</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hourlyData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="hour" stroke="#64748B" fontSize={10} interval={2} />
                  <YAxis stroke="#64748B" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Sales']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Orders by Day */}
        <div className="card">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Orders per Day</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="orders" fill="#8B5CF6" radius={[4, 4, 0, 0]} name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
