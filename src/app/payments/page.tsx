'use client';

import React, { useState } from 'react';
import { usePOS } from '@/context/POSContext';
import MainLayout from '@/components/layout/MainLayout';
import { 
  CreditCard, 
  Banknote, 
  Smartphone, 
  CheckCircle, 
  X,
  Divide,
  User,
  Receipt
} from 'lucide-react';
import { Order } from '@/types';
import { useRouter } from 'next/navigation';

export default function PaymentsPage() {
  const router = useRouter();
  const { orders, updateOrder, tables, updateTable, currentUser, addReceipt } = usePOS();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'digital'>('cash');
  const [cashGiven, setCashGiven] = useState('');
  const [tip, setTip] = useState(0);
  const [showTipModal, setShowTipModal] = useState(false);
  const [splitCount, setSplitCount] = useState(1);
  const [showSplitModal, setShowSplitModal] = useState(false);

  // Orders ready for payment (served or ready)
  const readyOrders = orders.filter(o => ['served', 'ready'].includes(o.status));

  const handlePayment = () => {
    if (!selectedOrder || !currentUser) return;

    const cashAmount = parseFloat(cashGiven) || 0;
    const finalTip = tip;
    const totalWithTip = selectedOrder.total + finalTip;
    const change = cashAmount - totalWithTip;

    if (paymentMethod !== 'cash' || change >= 0) {
      // Update order
      updateOrder(selectedOrder.id, {
        status: 'paid',
        paymentMethod,
        tip: finalTip,
        paidAt: new Date().toISOString(),
        total: totalWithTip
      });

      // Add receipt
      addReceipt({
        orderId: selectedOrder.id,
        items: selectedOrder.items,
        subtotal: selectedOrder.subtotal,
        tax: selectedOrder.tax,
        discount: selectedOrder.discount,
        total: totalWithTip,
        tip: finalTip,
        paymentMethod,
        customerId: selectedOrder.customerId,
      });

      // Update table to available
      updateTable(selectedOrder.tableId, { status: 'available', currentOrderId: undefined });

      // Reset
      setSelectedOrder(null);
      setCashGiven('');
      setTip(0);
      setPaymentMethod('cash');
      setSplitCount(1);
    }
  };

  const getChange = () => {
    if (!selectedOrder) return 0;
    const cashAmount = parseFloat(cashGiven) || 0;
    return cashAmount - (selectedOrder.total + tip);
  };

  const splitAmount = selectedOrder ? (selectedOrder.total + tip) / splitCount : 0;

  const getTableNumber = (tableId: string) => {
    const table = tables.find(t => t.id === tableId);
    return table?.number || tableId;
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Payment Processing</h1>
              <p className="text-slate-500">Process orders and collect payments</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Orders List */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Ready for Payment</h2>
            {readyOrders.length === 0 ? (
              <div className="card text-center py-8">
                <Receipt className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                <p className="text-slate-500">No orders ready for payment</p>
              </div>
            ) : (
              <div className="space-y-3">
                {readyOrders.map(order => (
                  <button
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className={`
                      w-full card text-left transition-all
                      ${selectedOrder?.id === order.id 
                        ? 'ring-2 ring-emerald-500 bg-emerald-50' 
                        : 'hover:bg-slate-50'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">Table {getTableNumber(order.tableId)}</span>
                      <span className="text-lg font-bold text-emerald-600">${order.total.toFixed(2)}</span>
                    </div>
                    <div className="text-sm text-slate-500">
                      {order.items.length} items • {order.items.reduce((sum, i) => sum + i.quantity, 0)} quantities
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Payment Form */}
          <div className="lg:col-span-2">
            {selectedOrder ? (
              <div className="card space-y-6">
                {/* Order Summary */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Order Summary</h2>
                    <span className="text-sm text-slate-500">Table {getTableNumber(selectedOrder.tableId)}</span>
                  </div>
                  
                  <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                    {selectedOrder.items.map(item => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-slate-600">
                          {item.quantity}x {item.menuItem.name}
                        </span>
                        <span className="text-slate-900">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="pt-2 mt-2 border-t border-slate-200">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Subtotal</span>
                        <span className="text-slate-900">${selectedOrder.subtotal.toFixed(2)}</span>
                      </div>
                      {selectedOrder.discount > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Discount</span>
                          <span>-${selectedOrder.discount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Tax</span>
                        <span className="text-slate-900">${selectedOrder.tax.toFixed(2)}</span>
                      </div>
                      {tip > 0 && (
                        <div className="flex justify-between text-sm text-emerald-600">
                          <span>Tip</span>
                          <span>+${tip.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-200">
                    <span className="text-xl font-bold text-slate-900">Total</span>
                    <span className="text-2xl font-bold text-emerald-600">
                      ${(selectedOrder.total + tip).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Tip */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setShowTipModal(true)}
                    className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                  >
                    {tip > 0 ? `Tip: $${tip.toFixed(2)}` : '+ Add Tip'}
                  </button>
                  {tip > 0 && (
                    <button
                      onClick={() => setTip(0)}
                      className="text-red-500 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {/* Split Bill */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setShowSplitModal(true)}
                    className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
                  >
                    <Divide size={18} />
                    <span>Split {splitCount > 1 ? `(${splitCount} ways)` : ''}</span>
                  </button>
                  {splitCount > 1 && (
                    <span className="text-lg font-medium text-slate-900">
                      ${splitAmount.toFixed(2)} each
                    </span>
                  )}
                </div>

                {/* Payment Method */}
                <div>
                  <label className="label">Payment Method</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setPaymentMethod('cash')}
                      className={`
                        p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-colors
                        ${paymentMethod === 'cash' 
                          ? 'border-emerald-500 bg-emerald-50' 
                          : 'border-slate-200 hover:border-slate-300'
                        }
                      `}
                    >
                      <Banknote className="w-6 h-6 text-slate-600" />
                      <span className="font-medium">Cash</span>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('card')}
                      className={`
                        p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-colors
                        ${paymentMethod === 'card' 
                          ? 'border-emerald-500 bg-emerald-50' 
                          : 'border-slate-200 hover:border-slate-300'
                        }
                      `}
                    >
                      <CreditCard className="w-6 h-6 text-slate-600" />
                      <span className="font-medium">Card</span>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('digital')}
                      className={`
                        p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-colors
                        ${paymentMethod === 'digital' 
                          ? 'border-emerald-500 bg-emerald-50' 
                          : 'border-slate-200 hover:border-slate-300'
                        }
                      `}
                    >
                      <Smartphone className="w-6 h-6 text-slate-600" />
                      <span className="font-medium">Digital</span>
                    </button>
                  </div>
                </div>

                {/* Cash Input */}
                {paymentMethod === 'cash' && (
                  <div>
                    <label className="label">Cash Received</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={cashGiven}
                      onChange={(e) => setCashGiven(e.target.value)}
                      className="input text-lg"
                      placeholder="0.00"
                    />
                    <div className="flex gap-2 mt-2">
                      {[10, 20, 50, 100].map(amount => (
                        <button
                          key={amount}
                          onClick={() => setCashGiven(amount.toString())}
                          className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 rounded text-sm font-medium"
                        >
                          ${amount}
                        </button>
                      ))}
                    </div>
                    {cashGiven && getChange() >= 0 && (
                      <div className="mt-4 p-4 bg-green-50 rounded-lg flex justify-between items-center">
                        <span className="text-green-700">Change Due</span>
                        <span className="text-2xl font-bold text-green-700">
                          ${getChange().toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Process Payment Button */}
                <button
                  onClick={handlePayment}
                  disabled={paymentMethod === 'cash' && getChange() < 0}
                  className="w-full btn btn-primary py-4 text-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <CheckCircle size={24} />
                  Process Payment
                </button>
              </div>
            ) : (
              <div className="card text-center py-12">
                <CreditCard className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <p className="text-slate-500 text-lg">Select an order to process payment</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tip Modal */}
      {showTipModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-sm">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Add Tip</h2>
              <button onClick={() => setShowTipModal(false)} className="p-1 hover:bg-slate-100 rounded">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-3">
              {[0, 5, 10, 15, 20].map(amount => (
                <button
                  key={amount}
                  onClick={() => {
                    setTip(amount);
                    setShowTipModal(false);
                  }}
                  className="w-full p-3 text-left rounded-lg border-2 border-slate-200 hover:border-emerald-500 transition-colors"
                >
                  {amount === 0 ? 'No Tip' : `$${amount.toFixed(2)}`}
                </button>
              ))}
              <div className="pt-2">
                <label className="label">Custom Amount</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={tip}
                  onChange={(e) => setTip(parseFloat(e.target.value) || 0)}
                  className="input"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Split Modal */}
      {showSplitModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-sm">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Split Bill</h2>
              <button onClick={() => setShowSplitModal(false)} className="p-1 hover:bg-slate-100 rounded">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4, 5, 6].map(count => (
                <button
                  key={count}
                  onClick={() => {
                    setSplitCount(count);
                    setShowSplitModal(false);
                  }}
                  className="w-full p-3 text-left rounded-lg border-2 border-slate-200 hover:border-emerald-500 transition-colors"
                >
                  {count === 1 ? 'No Split' : `Split ${count} ways`}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
