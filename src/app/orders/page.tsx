'use client';

import React, { useState, useEffect } from 'react';
import { usePOS } from '@/context/POSContext';
import MainLayout from '@/components/layout/MainLayout';
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  X, 
  Send, 
  Percent,
  User,
  ShoppingCart
} from 'lucide-react';
import { MenuItem, Table } from '@/types';
import { useRouter } from 'next/navigation';

export default function OrdersPage() {
  const router = useRouter();
  const { 
    categories, 
    menuItems, 
    tables, 
    cart, 
    cartTableId, 
    setCartTableId,
    addToCart, 
    removeFromCart, 
    updateCartItemQuantity, 
    clearCart,
    cartSubtotal,
    cartTax,
    cartTotal,
    addOrder,
    updateTable,
    currentUser,
    customers
  } = usePOS();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);
  const [showDiscount, setShowDiscount] = useState(false);
  const [showSelectTable, setShowSelectTable] = useState(false);
  const [showSelectCustomer, setShowSelectCustomer] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [orderNotes, setOrderNotes] = useState('');

  // Initialize from cart table if exists
  useEffect(() => {
    if (cartTableId && !selectedTableId) {
      setSelectedTableId(cartTableId);
    }
  }, [cartTableId]);

  const filteredItems = menuItems.filter(item => {
    if (item.availability === 'unavailable') return false;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || item.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const availableTables = tables.filter(t => t.status === 'available' || t.id === selectedTableId);

  const selectedTable = tables.find(t => t.id === selectedTableId);
  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  const handleAddToCart = (menuItem: MenuItem) => {
    addToCart(menuItem);
    if (!selectedTableId && !cartTableId) {
      setShowSelectTable(true);
    } else if (selectedTableId) {
      setCartTableId(selectedTableId);
    }
  };

  const handleQuantityChange = (menuItemId: string, delta: number) => {
    const cartItem = cart.find(item => item.menuItem.id === menuItemId);
    if (cartItem) {
      updateCartItemQuantity(menuItemId, cartItem.quantity + delta);
    }
  };

  const finalSubtotal = cartSubtotal - discount;
  const finalTax = finalSubtotal * 0.08;
  const finalTotal = finalSubtotal + finalTax;

  const handleSendToKitchen = () => {
    if (!selectedTableId || cart.length === 0 || !currentUser) return;

    const orderItems = cart.map(item => ({
      id: `oi-${Date.now()}-${item.menuItem.id}`,
      menuItemId: item.menuItem.id,
      menuItem: item.menuItem,
      quantity: item.quantity,
      price: item.menuItem.price,
      notes: item.notes,
      status: 'pending' as const,
    }));

    addOrder({
      tableId: selectedTableId,
      table: tables.find(t => t.id === selectedTableId),
      items: orderItems,
      status: 'pending',
      subtotal: finalSubtotal,
      tax: finalTax,
      discount: discount,
      total: finalTotal,
      tip: 0,
      serverId: currentUser.id,
      server: currentUser,
      customerId: selectedCustomerId || undefined,
      customer: selectedCustomer,
    });

    // Update table status
    updateTable(selectedTableId, { status: 'occupied' });

    // Clear cart
    clearCart();
    setSelectedTableId(null);
    setSelectedCustomerId(null);
    setDiscount(0);
    setOrderNotes('');
    
    router.push('/kitchen');
  };

  return (
    <MainLayout>
      <div className="h-[calc(100vh-6rem)] flex gap-4">
        {/* Menu Section */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Table Selection */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSelectTable(true)}
                className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <ShoppingCart size={18} />
                <span className="font-medium">
                  {selectedTable ? `Table ${selectedTable.number}` : 'Select Table'}
                </span>
              </button>
              
              {selectedCustomer && (
                <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded text-sm text-blue-700">
                  <User size={14} />
                  {selectedCustomer.name}
                </div>
              )}
              
              <button
                onClick={() => setShowSelectCustomer(true)}
                className="ml-auto text-sm text-emerald-600 hover:text-emerald-700"
              >
                {selectedCustomer ? 'Change Customer' : '+ Add Customer'}
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>

          {/* Categories */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                !selectedCategory 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              All
            </button>
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                  selectedCategory === category.id 
                    ? 'text-white' 
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
                style={selectedCategory === category.id ? { backgroundColor: category.color } : {}}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Menu Items Grid */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredItems.map(item => {
                const cartItem = cart.find(ci => ci.menuItem.id === item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => handleAddToCart(item)}
                    className={`
                      p-3 bg-white rounded-xl border transition-all hover:shadow-md
                      ${cartItem ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-slate-200'}
                    `}
                  >
                    <div className="text-left">
                      <h3 className="font-medium text-slate-900 truncate">{item.name}</h3>
                      <p className="text-sm text-slate-500 truncate">{item.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-bold text-emerald-600">${item.price.toFixed(2)}</span>
                        {cartItem && (
                          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                            {cartItem.quantity} in cart
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Cart Section */}
        <div className="w-96 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
          {/* Cart Header */}
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold">Current Order</h2>
            {selectedTable && (
              <p className="text-sm text-slate-500">Table {selectedTable.number}</p>
            )}
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {cart.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <ShoppingCart className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                <p>No items in order</p>
                <p className="text-sm">Click items to add them</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map(item => (
                  <div key={item.menuItem.id} className="flex gap-3 p-2 bg-slate-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-slate-900 truncate">{item.menuItem.name}</h4>
                      <p className="text-sm text-slate-500">${item.menuItem.price.toFixed(2)} each</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleQuantityChange(item.menuItem.id, -1)}
                        className="p-1 hover:bg-slate-200 rounded"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.menuItem.id, 1)}
                        className="p-1 hover:bg-slate-200 rounded"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.menuItem.id)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Discount */}
          {cart.length > 0 && (
            <div className="px-4 py-2 border-t border-slate-200">
              <button
                onClick={() => setShowDiscount(true)}
                className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
              >
                <Percent size={16} />
                {discount > 0 ? `Discount: $${discount.toFixed(2)}` : 'Add Discount'}
              </button>
            </div>
          )}

          {/* Totals */}
          <div className="p-4 border-t border-slate-200 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Subtotal</span>
              <span className="text-slate-900">${cartSubtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Tax (8%)</span>
              <span className="text-slate-900">${finalTax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-slate-200">
              <span>Total</span>
              <span className="text-emerald-600">${finalTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Send to Kitchen */}
          <div className="p-4 border-t border-slate-200">
            <button
              onClick={handleSendToKitchen}
              disabled={cart.length === 0 || !selectedTableId}
              className="w-full btn btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={20} />
              Send to Kitchen
            </button>
            {cart.length > 0 && !selectedTableId && (
              <p className="text-center text-sm text-red-500 mt-2">Please select a table first</p>
            )}
          </div>
        </div>
      </div>

      {/* Select Table Modal */}
      {showSelectTable && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Select Table</h2>
              <button onClick={() => setShowSelectTable(false)} className="p-1 hover:bg-slate-100 rounded">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 grid grid-cols-3 gap-3">
              {availableTables.map(table => (
                <button
                  key={table.id}
                  onClick={() => {
                    setSelectedTableId(table.id);
                    setCartTableId(table.id);
                    setShowSelectTable(false);
                  }}
                  className={`
                    p-3 rounded-lg border-2 transition-colors
                    ${selectedTableId === table.id 
                      ? 'border-emerald-500 bg-emerald-50' 
                      : 'border-slate-200 hover:border-slate-300'
                    }
                  `}
                >
                  <div className="font-medium">Table {table.number}</div>
                  <div className="text-sm text-slate-500">{table.capacity} seats</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Select Customer Modal */}
      {showSelectCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Select Customer</h2>
              <button onClick={() => setShowSelectCustomer(false)} className="p-1 hover:bg-slate-100 rounded">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto">
              <button
                onClick={() => {
                  setSelectedCustomerId(null);
                  setShowSelectCustomer(false);
                }}
                className="w-full p-3 text-left rounded-lg border-2 border-slate-200 hover:border-slate-300 mb-2"
              >
                <p className="font-medium">Walk-in Customer</p>
                <p className="text-sm text-slate-500">No loyalty account</p>
              </button>
              {customers.map(customer => (
                <button
                  key={customer.id}
                  onClick={() => {
                    setSelectedCustomerId(customer.id);
                    setShowSelectCustomer(false);
                  }}
                  className={`
                    w-full p-3 text-left rounded-lg border-2 mb-2 transition-colors
                    ${selectedCustomerId === customer.id 
                      ? 'border-emerald-500 bg-emerald-50' 
                      : 'border-slate-200 hover:border-slate-300'
                    }
                  `}
                >
                  <p className="font-medium">{customer.name}</p>
                  <p className="text-sm text-slate-500">{customer.email} • {customer.loyaltyPoints} points</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Discount Modal */}
      {showDiscount && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-sm">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Apply Discount</h2>
              <button onClick={() => setShowDiscount(false)} className="p-1 hover:bg-slate-100 rounded">
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {[0, 5, 10, 15, 20].map(amount => (
                  <button
                    key={amount}
                    onClick={() => {
                      setDiscount(amount);
                      setShowDiscount(false);
                    }}
                    className="w-full p-3 text-left rounded-lg border-2 border-slate-200 hover:border-emerald-500 transition-colors"
                  >
                    {amount === 0 ? 'No Discount' : `$${amount.toFixed(2)} off`}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowDiscount(false)}
                className="w-full btn btn-secondary mt-4"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
