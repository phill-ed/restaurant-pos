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
  Mail,
  X
} from 'lucide-react';
import { Receipt, Order } from '@/types';

export default function ReceiptsPage() {
  const { receipts, orders, tables, customers } = usePOS();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('today');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

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

  const getCustomerEmail = (receipt: Receipt) => {
    if (receipt.customerId) {
      const customer = customers.find(c => c.id === receipt.customerId);
      return customer?.email || null;
    }
    const order = orders.find(o => o.id === receipt.orderId);
    if (order?.customerId) {
      const customer = customers.find(c => c.id === order.customerId);
      return customer?.email || null;
    }
    return null;
  };

  const handlePrint = (receipt: Receipt) => {
    const order = orders.find(o => o.id === receipt.orderId);
    const table = order ? tables.find(t => t.id === order.tableId) : null;
    
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - ${receipt.orderId}</title>
        <style>
          @page {
            size: 80mm auto;
            margin: 0;
          }
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.4;
            width: 80mm;
            padding: 10px;
            color: #000;
          }
          .receipt {
            width: 100%;
          }
          .header {
            text-align: center;
            border-bottom: 1px dashed #000;
            padding-bottom: 10px;
            margin-bottom: 10px;
          }
          .header h1 {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .header p {
            font-size: 10px;
            color: #666;
          }
          .info {
            margin-bottom: 10px;
            font-size: 11px;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
          }
          .items {
            border-top: 1px dashed #000;
            border-bottom: 1px dashed #000;
            padding: 10px 0;
            margin-bottom: 10px;
          }
          .item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
          }
          .item:last-child {
            margin-bottom: 0;
          }
          .item-qty {
            font-weight: bold;
            min-width: 35px;
          }
          .item-name {
            flex: 1;
            padding: 0 10px;
          }
          .item-price {
            text-align: right;
            min-width: 50px;
          }
          .totals {
            margin-bottom: 10px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 3px;
          }
          .total-row.final {
            border-top: 1px solid #000;
            padding-top: 5px;
            margin-top: 5px;
            font-weight: bold;
            font-size: 14px;
          }
          .footer {
            text-align: center;
            font-size: 10px;
            color: #666;
            border-top: 1px dashed #000;
            padding-top: 10px;
          }
          .payment-info {
            font-size: 11px;
            margin-bottom: 10px;
          }
          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <h1>🍽️ RESTAURANT POS</h1>
            <p>123 Main Street</p>
            <p>New York, NY 10001</p>
            <p>Tel: (555) 123-4567</p>
          </div>
          
          <div class="info">
            <div class="info-row">
              <span>Date:</span>
              <span>${new Date(receipt.printedAt).toLocaleDateString()}</span>
            </div>
            <div class="info-row">
              <span>Time:</span>
              <span>${new Date(receipt.printedAt).toLocaleTimeString()}</span>
            </div>
            <div class="info-row">
              <span>Table:</span>
              <span>${table?.number || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span>Receipt #:</span>
              <span>${receipt.id.slice(-8).toUpperCase()}</span>
            </div>
          </div>
          
          <div class="items">
            ${receipt.items.map(item => `
              <div class="item">
                <span class="item-qty">${item.quantity}x</span>
                <span class="item-name">${item.menuItem.name}</span>
                <span class="item-price">$${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            `).join('')}
          </div>
          
          <div class="totals">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>$${receipt.subtotal.toFixed(2)}</span>
            </div>
            ${receipt.discount > 0 ? `
              <div class="total-row" style="color: green;">
                <span>Discount:</span>
                <span>-$${receipt.discount.toFixed(2)}</span>
              </div>
            ` : ''}
            <div class="total-row">
              <span>Tax:</span>
              <span>$${receipt.tax.toFixed(2)}</span>
            </div>
            ${receipt.tip > 0 ? `
              <div class="total-row" style="color: green;">
                <span>Tip:</span>
                <span>+$${receipt.tip.toFixed(2)}</span>
              </div>
            ` : ''}
            <div class="total-row final">
              <span>TOTAL:</span>
              <span>$${receipt.total.toFixed(2)}</span>
            </div>
          </div>
          
          <div class="payment-info">
            <div class="info-row">
              <span>Payment Method:</span>
              <span>${receipt.paymentMethod ? receipt.paymentMethod.charAt(0).toUpperCase() + receipt.paymentMethod.slice(1) : 'N/A'}</span>
            </div>
          </div>
          
          <div class="footer">
            <p>Thank you for dining with us!</p>
            <p>We appreciate your business.</p>
            <p style="margin-top: 5px;">Please visit again soon.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  };

  const handleEmailReceipt = async (receipt: Receipt) => {
    const email = getCustomerEmail(receipt);
    if (!email) {
      alert('No email address found for this customer');
      return;
    }

    // Simulate sending email
    setShowEmailModal(true);
    setEmailSent(false);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setEmailSent(true);
    
    // Close modal after showing success
    setTimeout(() => {
      setShowEmailModal(false);
      setEmailSent(false);
    }, 2000);
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
            filteredReceipts.map(receipt => {
              const order = orders.find(o => o.id === receipt.orderId);
              const table = order ? tables.find(t => t.id === order.tableId) : null;
              const customerEmail = getCustomerEmail(receipt);
              
              return (
                <div key={receipt.id} className="card flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-slate-100 rounded-lg">
                      <FileText className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Table {table?.number || 'N/A'}</p>
                      <p className="text-sm text-slate-500">
                        {new Date(receipt.printedAt).toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-400">
                        Order: {receipt.orderId.slice(-8)} | {receipt.items.length} items
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-bold text-emerald-600">${receipt.total.toFixed(2)}</span>
                    <button
                      onClick={() => setSelectedReceipt(receipt)}
                      className="p-2 hover:bg-slate-100 rounded-lg"
                      title="View Details"
                    >
                      <Eye size={18} className="text-slate-600" />
                    </button>
                    <button
                      onClick={() => handlePrint(receipt)}
                      className="p-2 hover:bg-slate-100 rounded-lg"
                      title="Print Receipt"
                    >
                      <Printer size={18} className="text-slate-600" />
                    </button>
                    {customerEmail && (
                      <button
                        onClick={() => handleEmailReceipt(receipt)}
                        className="p-2 hover:bg-slate-100 rounded-lg"
                        title="Email Receipt"
                      >
                        <Mail size={18} className="text-slate-600" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Receipt Detail Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-lg font-semibold">Receipt Details</h2>
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
                    <span>Receipt #:</span>
                    <span>{selectedReceipt.id.slice(-8).toUpperCase()}</span>
                  </div>
                </div>
                
                <div className="my-4 border-t border-b border-slate-200 py-4">
                  {selectedReceipt.items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm mb-2">
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
                  <p>Payment: {selectedReceipt.paymentMethod || 'N/A'}</p>
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
                {getCustomerEmail(selectedReceipt) && (
                  <button
                    onClick={() => handleEmailReceipt(selectedReceipt)}
                    className="flex-1 btn btn-secondary flex items-center justify-center gap-2"
                  >
                    <Mail size={18} />
                    Email
                  </button>
                )}
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

      {/* Email Sent Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 text-center">
            {emailSent ? (
              <>
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                  <Printer className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Email Sent!</h3>
                <p className="text-slate-500">Receipt has been sent to the customer's email.</p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 mx-auto mb-4 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                <h3 className="text-lg font-semibold mb-2">Sending...</h3>
                <p className="text-slate-500">Please wait while we send the receipt.</p>
              </>
            )}
          </div>
        </div>
      )}
    </MainLayout>
  );
}
