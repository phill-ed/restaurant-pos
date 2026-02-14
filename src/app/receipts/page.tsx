'use client';

import React, { useState } from 'react';
import { usePOS } from '@/context/POSContext';
import MainLayout from '@/components/layout/MainLayout';
import { 
  FileText, 
  Search, 
  Download, 
  Printer, 
  Eye,
  Calendar,
  X
} from 'lucide-react';
import { Receipt, Order } from '@/types';

export default function ReceiptsPage() {
  const { receipts, orders, tables } = usePOS();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('today');

  const getFilteredReceipts = () => {
    const now = new Date();
    return receipts.filter(receipt => {
      const receiptDate = new Date(receipt.printedAt);
      
      // Search filter
      if (searchQuery) {
        const order = orders.find(o => o.id === receipt.orderId);
        const table = order ? tables.find(t => t.id === order.tableId) : null;
        const searchMatch = 
          receipt.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (table && table.number.includes(searchQuery));
        if (!searchMatch) return false;
      }

      // Date filter
      if (dateFilter === 'today') {
        return receiptDate.toDateString() === now.toDateString();
      } else if (dateFilter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return receiptDate >= weekAgo;
      } else if (dateFilter === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return receiptDate >= monthAgo;
      }
      return true;
    });
  };

  const filteredReceipts = getFilteredReceipts();
  const totalRevenue = filteredReceipts.reduce((sum, r) => sum + r.total, 0);

  const getTableNumber = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      const table = tables.find(t => t.id === order.tableId);
      return table?.number || order.tableId;
    }
    return 'N/A';
  };

  const handlePrint = (receipt: Receipt) => {
    window.print();
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Receipts</h1>
              <p className="text-slate-500">View and print receipt history</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card">
            <p className="text-sm text-slate-500">Total Receipts</p>
            <p className="text-2xl font-bold text-slate-900">{filteredReceipts.length}</p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-500">Total Revenue</p>
            <p className="text-2xl font-bold text-emerald-600">${totalRevenue.toFixed(2)}</p>
          </div>
          <div className="card">
            <p className="text-sm text-slate-500">Average Order</p>
            <p className="text-2xl font-bold text-slate-900">
              ${filteredReceipts.length > 0 ? (totalRevenue / filteredReceipts.length).toFixed(2) : '0.00'}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search by order ID or table..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'today', 'week', 'month'] as const).map(filter => (
              <button
                key={filter}
                onClick={() => setDateFilter(filter)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  dateFilter === filter 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Receipts List */}
        <div className="space-y-3">
          {filteredReceipts.length === 0 ? (
            <div className="card text-center py-12">
              <FileText className="w-12 h-12 mx-auto mb-2 text-slate-300" />
              <p className="text-slate-500">No receipts found</p>
            </div>
          ) : (
            filteredReceipts.map(receipt => (
              <div key={receipt.id} className="card flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <FileText className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Table {getTableNumber(receipt.orderId)}</p>
                    <p className="text-sm text-slate-500">
                      {new Date(receipt.printedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-lg font-bold text-emerald-600">${receipt.total.toFixed(2)}</span>
                  <button
                    onClick={() => setSelectedReceipt(receipt)}
                    className="p-2 hover:bg-slate-100 rounded-lg"
                  >
                    <Eye size={18} className="text-slate-600" />
                  </button>
                  <button
                    onClick={() => handlePrint(receipt)}
                    className="p-2 hover:bg-slate-100 rounded-lg"
                  >
                    <Printer size={18} className="text-slate-600" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Receipt Detail Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Receipt</h2>
              <button onClick={() => setSelectedReceipt(null)} className="p-1 hover:bg-slate-100 rounded">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4">
              {/* Receipt Content */}
              <div className="bg-white border border-slate-200 rounded-lg p-4 mb-4">
                <div className="text-center mb-4 pb-4 border-b border-slate-200">
                  <h3 className="font-bold text-lg">Restaurant POS</h3>
                  <p className="text-sm text-slate-500">123 Main Street</p>
                  <p className="text-sm text-slate-500">New York, NY 10001</p>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span>{new Date(selectedReceipt.printedAt).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Table:</span>
                    <span>{getTableNumber(selectedReceipt.orderId)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Order ID:</span>
                    <span>{selectedReceipt.orderId.slice(0, 8)}</span>
                  </div>
                </div>
                
                <div className="my-4 border-t border-b border-slate-200 py-4">
                  {selectedReceipt.items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm mb-1">
                      <span>{item.quantity}x {item.menuItem.name}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${selectedReceipt.subtotal.toFixed(2)}</span>
                  </div>
                  {selectedReceipt.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span>-${selectedReceipt.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>${selectedReceipt.tax.toFixed(2)}</span>
                  </div>
                  {selectedReceipt.tip > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Tip:</span>
                      <span>+${selectedReceipt.tip.toFixed(2)}</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between font-bold">
                  <span>Total:</span>
                  <span className="text-lg">${selectedReceipt.total.toFixed(2)}</span>
                </div>
                
                <div className="mt-4 pt-4 border-t border-slate-200 text-center text-sm text-slate-500">
                  <p>Payment Method: {selectedReceipt.paymentMethod}</p>
                  <p className="mt-2">Thank you for dining with us!</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handlePrint(selectedReceipt)}
                  className="flex-1 btn btn-secondary flex items-center justify-center gap-2"
                >
                  <Printer size={18} />
                  Print
                </button>
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="flex-1 btn btn-primary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
