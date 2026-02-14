'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePOS } from '@/context/POSContext';
import MainLayout from '@/components/layout/MainLayout';
import { 
  Clock, 
  CheckCircle, 
  ChefHat, 
  AlertCircle,
  Filter,
  RefreshCw,
  Printer,
  X
} from 'lucide-react';
import { Order, OrderItem } from '@/types';

type StatusFilter = 'all' | 'pending' | 'preparing' | 'ready';

export default function KitchenPage() {
  const { activeOrders, updateOrder, updateOrderItemStatus, tables } = usePOS();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [printOrder, setPrintOrder] = useState<Order | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getTimeSince = (dateString: string) => {
    const date = new Date(dateString);
    const diffMs = currentTime.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ${diffMins % 60}m ago`;
  };

  const getUrgencyColor = (dateString: string) => {
    const date = new Date(dateString);
    const diffMs = currentTime.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins > 20) return 'border-red-500 bg-red-50';
    if (diffMins > 10) return 'border-amber-500 bg-amber-50';
    return 'border-emerald-500 bg-white';
  };

  const filteredOrders = activeOrders.filter(order => {
    if (statusFilter === 'all') return true;
    return order.status === statusFilter;
  });

  const pendingCount = activeOrders.filter(o => o.status === 'pending').length;
  const preparingCount = activeOrders.filter(o => o.status === 'preparing').length;
  const readyCount = activeOrders.filter(o => o.status === 'ready').length;

  const handleItemStatusChange = (orderId: string, itemId: string, status: OrderItem['status']) => {
    updateOrderItemStatus(orderId, itemId, status);
    
    // Check if all items are ready
    const order = activeOrders.find(o => o.id === orderId);
    if (order) {
      const allItemsReady = order.items.every(item => 
        item.id === itemId ? status === 'ready' : item.status === 'ready'
      );
      if (allItemsReady) {
        updateOrder(orderId, { status: 'ready' });
      }
    }
  };

  const handleCompleteOrder = (orderId: string) => {
    updateOrder(orderId, { status: 'served' });
  };

  const getTableNumber = (tableId: string) => {
    const table = tables.find(t => t.id === tableId);
    return table?.number || tableId;
  };

  const handlePrintTicket = (order: Order) => {
    setPrintOrder(order);
    setShowPrintModal(true);
  };

  const handlePrint = () => {
    if (printRef.current) {
      const printContent = printRef.current.innerHTML;
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Kitchen Ticket - ${printOrder?.table ? `Table ${getTableNumber(printOrder.tableId)}` : printOrder?.id}</title>
            <style>
              @page {
                size: 58mm auto;
                margin: 0;
              }
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              body {
                font-family: 'Courier New', monospace;
                font-size: 10px;
                line-height: 1.3;
                width: 58mm;
                padding: 5px;
                color: #000;
              }
              .ticket {
                width: 100%;
              }
              .header {
                text-align: center;
                border-bottom: 1px dashed #000;
                padding-bottom: 5px;
                margin-bottom: 8px;
              }
              .header h1 {
                font-size: 14px;
                font-weight: bold;
                margin-bottom: 2px;
              }
              .header p {
                font-size: 9px;
                color: #666;
              }
              .info {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
                font-size: 10px;
              }
              .info strong {
                font-weight: bold;
              }
              .items {
                border-top: 1px dashed #000;
                border-bottom: 1px dashed #000;
                padding: 5px 0;
                margin-bottom: 8px;
              }
              .item {
                display: flex;
                justify-content: space-between;
                margin-bottom: 3px;
              }
              .item:last-child {
                margin-bottom: 0;
              }
              .item-qty {
                font-weight: bold;
                min-width: 30px;
              }
              .item-name {
                flex: 1;
                padding-left: 5px;
              }
              .item-note {
                font-size: 8px;
                color: #666;
                font-style: italic;
              }
              .notes {
                margin-bottom: 8px;
                font-size: 9px;
              }
              .notes strong {
                display: block;
                margin-bottom: 2px;
              }
              .footer {
                text-align: center;
                font-size: 8px;
                color: #666;
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
            ${printContent}
          </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      }
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <ChefHat className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Kitchen Display</h1>
              <p className="text-slate-500">Real-time order queue</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Clock size={16} />
              <span>{currentTime.toLocaleTimeString()}</span>
            </div>
            
            <button
              onClick={() => window.location.reload()}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw size={18} className="text-slate-600" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button
            onClick={() => setStatusFilter('all')}
            className={`card text-center ${statusFilter === 'all' ? 'ring-2 ring-emerald-500' : ''}`}
          >
            <p className="text-2xl font-bold text-slate-900">{activeOrders.length}</p>
            <p className="text-sm text-slate-500">Active Orders</p>
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`card text-center ${statusFilter === 'pending' ? 'ring-2 ring-amber-500' : ''}`}
          >
            <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
            <p className="text-sm text-slate-500">Pending</p>
          </button>
          <button
            onClick={() => setStatusFilter('preparing')}
            className={`card text-center ${statusFilter === 'preparing' ? 'ring-2 ring-blue-500' : ''}`}
          >
            <p className="text-2xl font-bold text-blue-600">{preparingCount}</p>
            <p className="text-sm text-slate-500">Preparing</p>
          </button>
          <button
            onClick={() => setStatusFilter('ready')}
            className={`card text-center ${statusFilter === 'ready' ? 'ring-2 ring-green-500' : ''}`}
          >
            <p className="text-2xl font-bold text-green-600">{readyCount}</p>
            <p className="text-sm text-slate-500">Ready</p>
          </button>
        </div>

        {/* Orders Grid */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <ChefHat className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <p className="text-slate-500 text-lg">No orders in queue</p>
            <p className="text-sm text-slate-400">New orders will appear here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredOrders.map(order => (
              <div
                key={order.id}
                className={`
                  bg-white rounded-xl border-l-4 shadow-sm overflow-hidden
                  ${getUrgencyColor(order.createdAt)}
                `}
              >
                {/* Order Header */}
                <div className="p-3 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg">Table {getTableNumber(order.tableId)}</h3>
                    <p className="text-xs text-slate-500">{getTimeSince(order.createdAt)}</p>
                  </div>
                  <span className={`
                    px-2 py-1 rounded text-xs font-medium
                    ${order.status === 'pending' ? 'bg-amber-100 text-amber-700' : ''}
                    ${order.status === 'preparing' ? 'bg-blue-100 text-blue-700' : ''}
                    ${order.status === 'ready' ? 'bg-green-100 text-green-700' : ''}
                  `}>
                    {order.status.toUpperCase()}
                  </span>
                </div>

                {/* Order Items */}
                <div className="p-3 space-y-2">
                  {order.items.map(item => (
                    <div 
                      key={item.id}
                      className={`
                        flex items-center justify-between p-2 rounded-lg
                        ${item.status === 'ready' ? 'bg-green-50' : ''}
                        ${item.status === 'preparing' ? 'bg-blue-50' : ''}
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg w-6">{item.quantity}x</span>
                        <span className="font-medium">{item.menuItem.name}</span>
                      </div>
                      <button
                        onClick={() => {
                          const nextStatus = item.status === 'pending' ? 'preparing' : 'ready';
                          handleItemStatusChange(order.id, item.id, nextStatus);
                        }}
                        disabled={item.status === 'ready'}
                        className={`
                          p-1.5 rounded transition-colors
                          ${item.status === 'ready' 
                            ? 'bg-green-100 text-green-600 cursor-default' 
                            : 'bg-slate-100 hover:bg-slate-200'
                          }
                        `}
                      >
                        <CheckCircle size={18} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Order Actions */}
                <div className="p-3 border-t border-slate-200 flex gap-2">
                  <button
                    onClick={() => handlePrintTicket(order)}
                    className="flex-1 btn btn-secondary flex items-center justify-center gap-2 text-sm"
                  >
                    <Printer size={16} />
                    Print
                  </button>
                  {order.status === 'ready' && (
                    <button
                      onClick={() => handleCompleteOrder(order.id)}
                      className="flex-1 btn btn-primary"
                    >
                      Served
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Print Modal */}
      {showPrintModal && printOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-sm">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Kitchen Ticket</h2>
              <button 
                onClick={() => setShowPrintModal(false)} 
                className="p-1 hover:bg-slate-100 rounded"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4">
              {/* Preview */}
              <div 
                ref={printRef}
                className="ticket bg-white border border-slate-300 rounded-lg p-4 mb-4"
                style={{ width: '280px', margin: '0 auto', fontFamily: 'Courier New, monospace' }}
              >
                <div className="header">
                  <h1>🍽️ RESTAURANT POS</h1>
                  <p>123 Main Street</p>
                </div>
                
                <div className="info">
                  <div>
                    <strong>Ticket:</strong> {printOrder.id.slice(-6)}
                  </div>
                  <div>
                    <strong>Table:</strong> {getTableNumber(printOrder.tableId)}
                  </div>
                </div>
                
                <div className="info">
                  <div>
                    <strong>Time:</strong> {new Date(printOrder.createdAt).toLocaleTimeString()}
                  </div>
                  <div>
                    <strong>Date:</strong> {new Date(printOrder.createdAt).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="items">
                  {printOrder.items.map(item => (
                    <div key={item.id} className="item">
                      <span className="item-qty">{item.quantity}x</span>
                      <span className="item-name">{item.menuItem.name}</span>
                    </div>
                  ))}
                </div>
                
                <div className="footer">
                  <p>KITCHEN ORDER</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handlePrint}
                  className="flex-1 btn btn-primary flex items-center justify-center gap-2"
                >
                  <Printer size={18} />
                  Print Ticket
                </button>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="flex-1 btn btn-secondary"
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
