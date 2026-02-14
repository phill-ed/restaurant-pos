'use client';

import React, { useState } from 'react';
import { usePOS } from '@/context/POSContext';
import MainLayout from '@/components/layout/MainLayout';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Plus, 
  Minus,
  ShoppingCart,
  DollarSign
} from 'lucide-react';
import { Table, TableStatus } from '@/types';

export default function TablesPage() {
  const { tables, updateTable, activeOrders, addOrder, cart, cartTableId, setCartTableId, cartSubtotal, cartTax, cartTotal, addToCart, updateCartItemQuantity, removeFromCart, clearCart, currentUser } = usePOS();
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);

  const getStatusColor = (status: TableStatus) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 border-green-300 text-green-800';
      case 'occupied':
        return 'bg-amber-100 border-amber-300 text-amber-800';
      case 'reserved':
        return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'cleaning':
        return 'bg-gray-100 border-gray-300 text-gray-800';
      default:
        return 'bg-slate-100 border-slate-300 text-slate-800';
    }
  };

  const getStatusIcon = (status: TableStatus) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'occupied':
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'reserved':
        return <Users className="w-4 h-4 text-blue-600" />;
      case 'cleaning':
        return <XCircle className="w-4 h-4 text-gray-600" />;
      default:
        return null;
    }
  };

  const getTableOrder = (tableId: string) => {
    return activeOrders.find(o => o.tableId === tableId);
  };

  const handleTableClick = (table: Table) => {
    setSelectedTable(table);
  };

  const handleStatusChange = (status: TableStatus) => {
    if (selectedTable) {
      updateTable(selectedTable.id, { 
        status, 
        currentOrderId: status === 'available' ? undefined : selectedTable.currentOrderId 
      });
    }
  };

  const handleStartNewOrder = () => {
    if (selectedTable && currentUser) {
      const order = addOrder({
        tableId: selectedTable.id,
        table: selectedTable,
        items: [],
        status: 'pending',
        subtotal: 0,
        tax: 0,
        discount: 0,
        total: 0,
        tip: 0,
        serverId: currentUser.id,
      });
      updateTable(selectedTable.id, { status: 'occupied', currentOrderId: order.id });
      setSelectedTable({ ...selectedTable, status: 'occupied', currentOrderId: order.id });
      setShowNewOrderModal(false);
    }
  };

  const handleQuickOrder = () => {
    if (selectedTable) {
      setCartTableId(selectedTable.id);
      setShowNewOrderModal(false);
    }
  };

  const stats = {
    available: tables.filter(t => t.status === 'available').length,
    occupied: tables.filter(t => t.status === 'occupied').length,
    reserved: tables.filter(t => t.status === 'reserved').length,
    cleaning: tables.filter(t => t.status === 'cleaning').length,
    total: tables.length,
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Table Management</h1>
            <p className="text-slate-500">Manage table availability and orders</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="card flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">{stats.available}</p>
              <p className="text-sm text-slate-500">Available</p>
            </div>
          </div>
          <div className="card flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">{stats.occupied}</p>
              <p className="text-sm text-slate-500">Occupied</p>
            </div>
          </div>
          <div className="card flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">{stats.reserved}</p>
              <p className="text-sm text-slate-500">Reserved</p>
            </div>
          </div>
          <div className="card flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <XCircle className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">{stats.cleaning}</p>
              <p className="text-sm text-slate-500">Cleaning</p>
            </div>
          </div>
        </div>

        {/* Table Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {tables.map(table => {
            const order = getTableOrder(table.id);
            return (
              <button
                key={table.id}
                onClick={() => handleTableClick(table)}
                className={`
                  relative p-4 rounded-xl border-2 transition-all hover:shadow-lg
                  ${getStatusColor(table.status)}
                  ${selectedTable?.id === table.id ? 'ring-2 ring-emerald-500 ring-offset-2' : ''}
                `}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="text-2xl font-bold">#{table.number}</div>
                  <div className="flex items-center gap-1 text-sm">
                    <Users size={14} />
                    <span>{table.capacity}</span>
                  </div>
                  {getStatusIcon(table.status)}
                </div>
                
                {order && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs">
                    $
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Table Details Modal */}
        {selectedTable && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-md">
              <div className="p-4 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Table {selectedTable.number}</h2>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedTable.status).split(' ').slice(0, 2).join(' ')}`}>
                    {selectedTable.status.charAt(0).toUpperCase() + selectedTable.status.slice(1)}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-1">Capacity: {selectedTable.capacity} guests</p>
              </div>
              
              <div className="p-4 space-y-4">
                {/* Current Order */}
                {getTableOrder(selectedTable.id) && (
                  <div className="bg-slate-50 rounded-lg p-3">
                    <h3 className="font-medium text-slate-900 mb-2">Current Order</h3>
                    <div className="space-y-1">
                      {getTableOrder(selectedTable.id)?.items.map(item => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-slate-600">{item.quantity}x {item.menuItem.name}</span>
                          <span className="text-slate-900">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-200 flex justify-between font-medium">
                      <span>Total</span>
                      <span className="text-emerald-600">${getTableOrder(selectedTable.id)?.total.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                {/* Status Actions */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-700">Change Status:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleStatusChange('available')}
                      className={`p-2 rounded-lg border-2 transition-colors ${
                        selectedTable.status === 'available' 
                          ? 'border-green-500 bg-green-50 text-green-700' 
                          : 'border-slate-200 hover:border-green-300'
                      }`}
                    >
                      <CheckCircle className="w-5 h-5 mx-auto mb-1" />
                      <span className="text-sm">Available</span>
                    </button>
                    <button
                      onClick={() => handleStatusChange('occupied')}
                      className={`p-2 rounded-lg border-2 transition-colors ${
                        selectedTable.status === 'occupied' 
                          ? 'border-amber-500 bg-amber-50 text-amber-700' 
                          : 'border-slate-200 hover:border-amber-300'
                      }`}
                    >
                      <Clock className="w-5 h-5 mx-auto mb-1" />
                      <span className="text-sm">Occupied</span>
                    </button>
                    <button
                      onClick={() => handleStatusChange('reserved')}
                      className={`p-2 rounded-lg border-2 transition-colors ${
                        selectedTable.status === 'reserved' 
                          ? 'border-blue-500 bg-blue-50 text-blue-700' 
                          : 'border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      <Users className="w-5 h-5 mx-auto mb-1" />
                      <span className="text-sm">Reserved</span>
                    </button>
                    <button
                      onClick={() => handleStatusChange('cleaning')}
                      className={`p-2 rounded-lg border-2 transition-colors ${
                        selectedTable.status === 'cleaning' 
                          ? 'border-gray-500 bg-gray-50 text-gray-700' 
                          : 'border-slate-200 hover:border-gray-300'
                      }`}
                    >
                      <XCircle className="w-5 h-5 mx-auto mb-1" />
                      <span className="text-sm">Cleaning</span>
                    </button>
                  </div>
                </div>

                {/* Quick Actions */}
                {selectedTable.status === 'available' && (
                  <button
                    onClick={() => setShowNewOrderModal(true)}
                    className="w-full btn btn-primary flex items-center justify-center gap-2"
                  >
                    <ShoppingCart size={20} />
                    Start New Order
                  </button>
                )}
              </div>
              
              <div className="p-4 border-t border-slate-200">
                <button
                  onClick={() => setSelectedTable(null)}
                  className="w-full btn btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* New Order Modal */}
        {showNewOrderModal && selectedTable && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-xl w-full max-w-sm">
              <div className="p-4 border-b border-slate-200">
                <h2 className="text-lg font-semibold">Start Order for Table {selectedTable.number}</h2>
              </div>
              
              <div className="p-4 space-y-3">
                <button
                  onClick={handleStartNewOrder}
                  className="w-full p-3 bg-emerald-50 hover:bg-emerald-100 rounded-lg flex items-center gap-3 transition-colors"
                >
                  <div className="p-2 bg-emerald-600 rounded-lg">
                    <ShoppingCart className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-slate-900">Create Empty Order</p>
                    <p className="text-sm text-slate-500">Start adding items later</p>
                  </div>
                </button>

                <button
                  onClick={handleQuickOrder}
                  className="w-full p-3 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center gap-3 transition-colors"
                >
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-slate-900">Quick Order</p>
                    <p className="text-sm text-slate-500">Go to order screen now</p>
                  </div>
                </button>
              </div>
              
              <div className="p-4 border-t border-slate-200">
                <button
                  onClick={() => setShowNewOrderModal(false)}
                  className="w-full btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
