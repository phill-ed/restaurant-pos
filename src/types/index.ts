// Types for Restaurant POS Application

export type UserRole = 'admin' | 'waiter' | 'kitchen' | 'cashier';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  pin: string;
  avatar?: string;
  active: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  sortOrder: number;
}

export type MenuItemAvailability = 'available' | 'unavailable' | 'limited';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  image?: string;
  availability: MenuItemAvailability;
  preparationTime: number; // in minutes
  ingredients: Ingredient[];
  createdAt: string;
  updatedAt: string;
}

export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  minStock: number;
}

export interface TableStatus = 'available' | 'occupied' | 'reserved' | 'cleaning';

export interface Table {
  id: string;
  number: string;
  capacity: number;
  status: TableStatus;
  currentOrderId?: string;
  position: { x: number; y: number };
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  menuItem: MenuItem;
  quantity: number;
  price: number;
  notes?: string;
  status: 'pending' | 'preparing' | 'ready' | 'served';
}

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'served' | 'paid' | 'cancelled';

export interface Order {
  id: string;
  tableId: string;
  table?: Table;
  items: OrderItem[];
  status: OrderStatus;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  tip: number;
  paymentMethod?: 'cash' | 'card' | 'digital';
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
  serverId: string;
  server?: User;
  customerId?: string;
  customer?: Customer;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  loyaltyPoints: number;
  totalSpent: number;
  visitCount: number;
  createdAt: string;
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  method: 'cash' | 'card' | 'digital';
  tip: number;
  change: number;
  cashGiven?: number;
  processedAt: string;
  staffId: string;
}

export interface Receipt {
  id: string;
  orderId: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  tip: number;
  paymentMethod: string;
  printedAt: string;
  customerId?: string;
}

export interface DailyReport {
  date: string;
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  topSellingItems: { itemId: string; name: string; quantity: number; revenue: number }[];
  paymentsByMethod: { method: string; amount: number }[];
  hoursData: { hour: number; sales: number; orders: number }[];
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minStock: number;
  costPerUnit: number;
  lastRestocked: string;
  supplier?: string;
}

export interface Shift {
  id: string;
  userId: string;
  user?: User;
  startTime: string;
  endTime?: string;
  breakMinutes: number;
  tips: number;
  sales: number;
  ordersServed: number;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
}
