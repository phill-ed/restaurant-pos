'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User, 
  Category, 
  MenuItem, 
  Table, 
  Order, 
  Customer, 
  InventoryItem,
  OrderItem,
  CartItem,
  Receipt
} from '@/types';
import { 
  defaultCategories, 
  defaultMenuItems, 
  defaultTables, 
  defaultUsers, 
  defaultCustomers,
  defaultInventory,
  createSampleOrders,
  generateId,
  TAX_RATE
} from '@/lib/data';

interface POSContextType {
  // Users
  users: User[];
  currentUser: User | null;
  login: (pin: string) => boolean;
  logout: () => void;
  
  // Categories
  categories: Category[];
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  
  // Menu Items
  menuItems: MenuItem[];
  addMenuItem: (item: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateMenuItem: (id: string, item: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;
  
  // Tables
  tables: Table[];
  updateTable: (id: string, table: Partial<Table>) => void;
  
  // Orders
  orders: Order[];
  activeOrders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => Order;
  updateOrder: (id: string, order: Partial<Order>) => void;
  updateOrderItemStatus: (orderId: string, itemId: string, status: OrderItem['status']) => void;
  
  // Cart
  cart: CartItem[];
  cartTableId: string | null;
  setCartTableId: (id: string | null) => void;
  addToCart: (menuItem: MenuItem, quantity?: number, notes?: string) => void;
  removeFromCart: (menuItemId: string) => void;
  updateCartItemQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  cartSubtotal: number;
  cartTax: number;
  cartTotal: number;
  
  // Customers
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'loyaltyPoints' | 'totalSpent' | 'visitCount' | 'createdAt'>) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  
  // Inventory
  inventory: InventoryItem[];
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => void;
  updateInventoryItem: (id: string, item: Partial<InventoryItem>) => void;
  deleteInventoryItem: (id: string) => void;
  
  // Receipts
  receipts: Receipt[];
  addReceipt: (receipt: Omit<Receipt, 'id' | 'printedAt'>) => void;
  
  // Dashboard Stats
  todaySales: number;
  todayOrders: number;
  todayAverage: number;
  popularItems: { name: string; quantity: number }[];
}

const POSContext = createContext<POSContextType | undefined>(undefined);

const STORAGE_KEY = 'restaurant-pos-data';

interface StoredData {
  users: User[];
  categories: Category[];
  menuItems: MenuItem[];
  tables: Table[];
  orders: Order[];
  customers: Customer[];
  inventory: InventoryItem[];
  receipts: Receipt[];
}

export function POSProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(defaultUsers);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(defaultMenuItems);
  const [tables, setTables] = useState<Table[]>(defaultTables);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>(defaultCustomers);
  const [inventory, setInventory] = useState<InventoryItem[]>(defaultInventory);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartTableId, setCartTableId] = useState<string | null>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data: StoredData = JSON.parse(stored);
        if (data.users) setUsers(data.users);
        if (data.categories) setCategories(data.categories);
        if (data.menuItems) setMenuItems(data.menuItems);
        if (data.tables) setTables(data.tables);
        if (data.orders) setOrders(data.orders);
        if (data.customers) setCustomers(data.customers);
        if (data.inventory) setInventory(data.inventory);
        if (data.receipts) setReceipts(data.receipts);
      } catch (e) {
        console.error('Failed to load stored data:', e);
      }
    } else {
      // Initialize with sample orders
      setOrders(createSampleOrders());
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    const data: StoredData = {
      users,
      categories,
      menuItems,
      tables,
      orders,
      customers,
      inventory,
      receipts
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [users, categories, menuItems, tables, orders, customers, inventory, receipts]);

  // User authentication
  const login = (pin: string): boolean => {
    const user = users.find(u => u.pin === pin && u.active);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    clearCart();
  };

  // Categories
  const addCategory = (category: Omit<Category, 'id'>) => {
    setCategories(prev => [...prev, { ...category, id: generateId() }]);
  };

  const updateCategory = (id: string, category: Partial<Category>) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...category } : c));
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  // Menu Items
  const addMenuItem = (item: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    setMenuItems(prev => [...prev, { ...item, id: generateId(), createdAt: now, updatedAt: now }]);
  };

  const updateMenuItem = (id: string, item: Partial<MenuItem>) => {
    setMenuItems(prev => prev.map(m => 
      m.id === id ? { ...m, ...item, updatedAt: new Date().toISOString() } : m
    ));
  };

  const deleteMenuItem = (id: string) => {
    setMenuItems(prev => prev.filter(m => m.id !== id));
  };

  // Tables
  const updateTable = (id: string, table: Partial<Table>) => {
    setTables(prev => prev.map(t => t.id === id ? { ...t, ...table } : t));
  };

  // Orders
  const activeOrders = orders.filter(o => !['paid', 'cancelled'].includes(o.status));

  const addOrder = (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Order => {
    const now = new Date().toISOString();
    const newOrder: Order = {
      ...order,
      id: generateId(),
      createdAt: now,
      updatedAt: now
    };
    setOrders(prev => [...prev, newOrder]);
    return newOrder;
  };

  const updateOrder = (id: string, order: Partial<Order>) => {
    setOrders(prev => prev.map(o => 
      o.id === id ? { ...o, ...order, updatedAt: new Date().toISOString() } : o
    ));
  };

  const updateOrderItemStatus = (orderId: string, itemId: string, status: OrderItem['status']) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          items: o.items.map(item => 
            item.id === itemId ? { ...item, status } : item
          ),
          updatedAt: new Date().toISOString()
        };
      }
      return o;
    }));
  };

  // Cart
  const addToCart = (menuItem: MenuItem, quantity = 1, notes?: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.menuItem.id === menuItem.id);
      if (existing) {
        return prev.map(item => 
          item.menuItem.id === menuItem.id 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { menuItem, quantity, notes }];
    });
  };

  const removeFromCart = (menuItemId: string) => {
    setCart(prev => prev.filter(item => item.menuItem.id !== menuItemId));
  };

  const updateCartItemQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(menuItemId);
      return;
    }
    setCart(prev => prev.map(item => 
      item.menuItem.id === menuItemId ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => {
    setCart([]);
    setCartTableId(null);
  };

  const cartSubtotal = cart.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);
  const cartTax = cartSubtotal * TAX_RATE;
  const cartTotal = cartSubtotal + cartTax;

  // Customers
  const addCustomer = (customer: Omit<Customer, 'id' | 'loyaltyPoints' | 'totalSpent' | 'visitCount' | 'createdAt'>) => {
    setCustomers(prev => [...prev, {
      ...customer,
      id: generateId(),
      loyaltyPoints: 0,
      totalSpent: 0,
      visitCount: 0,
      createdAt: new Date().toISOString()
    }]);
  };

  const updateCustomer = (id: string, customer: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...customer } : c));
  };

  // Inventory
  const addInventoryItem = (item: Omit<InventoryItem, 'id'>) => {
    setInventory(prev => [...prev, { ...item, id: generateId() }]);
  };

  const updateInventoryItem = (id: string, item: Partial<InventoryItem>) => {
    setInventory(prev => prev.map(i => i.id === id ? { ...i, ...item } : i));
  };

  const deleteInventoryItem = (id: string) => {
    setInventory(prev => prev.filter(i => i.id !== id));
  };

  // Receipts
  const addReceipt = (receipt: Omit<Receipt, 'id' | 'printedAt'>) => {
    setReceipts(prev => [...prev, {
      ...receipt,
      id: generateId(),
      printedAt: new Date().toISOString()
    }]);
  };

  // Dashboard Stats
  const today = new Date().toDateString();
  const todayOrdersList = orders.filter(o => new Date(o.createdAt).toDateString() === today);
  const todaySales = todayOrdersList.reduce((sum, o) => sum + o.total, 0);
  const todayOrders = todayOrdersList.length;
  const todayAverage = todayOrders > 0 ? todaySales / todayOrders : 0;

  const itemSales: Record<string, number> = {};
  todayOrdersList.forEach(order => {
    order.items.forEach(item => {
      if (!itemSales[item.menuItem.name]) {
        itemSales[item.menuItem.name] = 0;
      }
      itemSales[item.menuItem.name] += item.quantity;
    });
  });

  const popularItems = Object.entries(itemSales)
    .map(([name, quantity]) => ({ name, quantity }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  const value: POSContextType = {
    users,
    currentUser,
    login,
    logout,
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    menuItems,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    tables,
    updateTable,
    orders,
    activeOrders,
    addOrder,
    updateOrder,
    updateOrderItemStatus,
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
    customers,
    addCustomer,
    updateCustomer,
    inventory,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    receipts,
    addReceipt,
    todaySales,
    todayOrders,
    todayAverage,
    popularItems
  };

  return (
    <POSContext.Provider value={value}>
      {children}
    </POSContext.Provider>
  );
}

export function usePOS() {
  const context = useContext(POSContext);
  if (context === undefined) {
    throw new Error('usePOS must be used within a POSProvider');
  }
  return context;
}
