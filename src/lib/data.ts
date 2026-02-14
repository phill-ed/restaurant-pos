import { v4 as uuidv4 } from 'uuid';
import { 
  User, 
  Category, 
  MenuItem, 
  Table, 
  Customer, 
  InventoryItem,
  Order,
  OrderItem
} from '@/types';

export const generateId = (): string => uuidv4();

export const defaultCategories: Category[] = [
  { id: 'cat-1', name: 'Appetizers', icon: 'soup', color: '#F59E0B', sortOrder: 1 },
  { id: 'cat-2', name: 'Main Courses', icon: 'utensils', color: '#10B981', sortOrder: 2 },
  { id: 'cat-3', name: 'Drinks', icon: 'coffee', color: '#3B82F6', sortOrder: 3 },
  { id: 'cat-4', name: 'Desserts', icon: 'cake', color: '#EC4899', sortOrder: 4 },
  { id: 'cat-5', name: 'Sides', icon: 'carrot', color: '#8B5CF6', sortOrder: 5 },
];

export const defaultMenuItems: MenuItem[] = [
  // Appetizers
  { id: 'item-1', name: 'Bruschetta', description: 'Toasted bread with tomatoes, garlic, and basil', price: 8.99, categoryId: 'cat-1', availability: 'available', preparationTime: 10, ingredients: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'item-2', name: 'Garlic Bread', description: 'Crispy bread with garlic butter', price: 5.99, categoryId: 'cat-1', availability: 'available', preparationTime: 8, ingredients: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'item-3', name: 'Caesar Salad', description: 'Fresh romaine with caesar dressing', price: 10.99, categoryId: 'cat-1', availability: 'available', preparationTime: 12, ingredients: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'item-4', name: 'Soup of the Day', description: 'Ask your server for today\'s selection', price: 6.99, categoryId: 'cat-1', availability: 'available', preparationTime: 5, ingredients: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  
  // Main Courses
  { id: 'item-5', name: 'Grilled Salmon', description: 'Atlantic salmon with seasonal vegetables', price: 24.99, categoryId: 'cat-2', availability: 'available', preparationTime: 20, ingredients: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'item-6', name: 'Ribeye Steak', description: '12oz ribeye with mashed potatoes', price: 32.99, categoryId: 'cat-2', availability: 'available', preparationTime: 25, ingredients: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'item-7', name: 'Chicken Parmesan', description: 'Breaded chicken with marinara and mozzarella', price: 18.99, categoryId: 'cat-2', availability: 'available', preparationTime: 18, ingredients: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'item-8', name: 'Pasta Carbonara', description: 'Spaghetti with cream sauce and bacon', price: 16.99, categoryId: 'cat-2', availability: 'available', preparationTime: 15, ingredients: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'item-9', name: 'Vegetable Stir Fry', description: 'Fresh seasonal vegetables in soy glaze', price: 14.99, categoryId: 'cat-2', availability: 'available', preparationTime: 15, ingredients: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'item-10', name: 'Fish & Chips', description: 'Beer-battered cod with fries', price: 17.99, categoryId: 'cat-2', availability: 'available', preparationTime: 18, ingredients: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  
  // Drinks
  { id: 'item-11', name: 'Fresh Lemonade', description: 'House-made with fresh lemons', price: 4.99, categoryId: 'cat-3', availability: 'available', preparationTime: 3, ingredients: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'item-12', name: 'Iced Coffee', description: 'Cold brew with milk', price: 5.99, categoryId: 'cat-3', availability: 'available', preparationTime: 3, ingredients: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'item-13', name: 'Soft Drinks', description: 'Coke, Sprite, or Fanta', price: 3.49, categoryId: 'cat-3', availability: 'available', preparationTime: 1, ingredients: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'item-14', name: 'Sparkling Water', description: 'San Pellegrino 500ml', price: 4.49, categoryId: 'cat-3', availability: 'available', preparationTime: 1, ingredients: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'item-15', name: 'House Wine', description: 'Red or White, by the glass', price: 8.99, categoryId: 'cat-3', availability: 'available', preparationTime: 2, ingredients: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  
  // Desserts
  { id: 'item-16', name: 'Tiramisu', description: 'Classic Italian coffee dessert', price: 9.99, categoryId: 'cat-4', availability: 'available', preparationTime: 5, ingredients: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'item-17', name: 'Chocolate Lava Cake', description: 'Warm cake with molten chocolate center', price: 11.99, categoryId: 'cat-4', availability: 'available', preparationTime: 12, ingredients: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'item-18', name: 'Cheesecake', description: 'New York style with berry compote', price: 8.99, categoryId: 'cat-4', availability: 'available', preparationTime: 5, ingredients: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'item-19', name: 'Ice Cream Sundae', description: 'Three scoops with toppings', price: 7.99, categoryId: 'cat-4', availability: 'available', preparationTime: 5, ingredients: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  
  // Sides
  { id: 'item-20', name: 'French Fries', description: 'Crispy golden fries', price: 4.99, categoryId: 'cat-5', availability: 'available', preparationTime: 8, ingredients: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'item-21', name: 'Mashed Potatoes', description: 'Creamy mashed potatoes', price: 4.99, categoryId: 'cat-5', availability: 'available', preparationTime: 5, ingredients: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'item-22', name: 'Steamed Vegetables', description: 'Seasonal vegetables', price: 5.99, categoryId: 'cat-5', availability: 'available', preparationTime: 10, ingredients: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'item-23', name: 'Onion Rings', description: 'Beer-battered onion rings', price: 6.99, categoryId: 'cat-5', availability: 'available', preparationTime: 10, ingredients: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

export const defaultTables: Table[] = [
  { id: 'table-1', number: '1', capacity: 2, status: 'available', position: { x: 0, y: 0 } },
  { id: 'table-2', number: '2', capacity: 2, status: 'available', position: { x: 1, y: 0 } },
  { id: 'table-3', number: '3', capacity: 4, status: 'occupied', currentOrderId: 'order-1', position: { x: 2, y: 0 } },
  { id: 'table-4', number: '4', capacity: 4, status: 'available', position: { x: 3, y: 0 } },
  { id: 'table-5', number: '5', capacity: 4, status: 'reserved', position: { x: 0, y: 1 } },
  { id: 'table-6', number: '6', capacity: 6, status: 'available', position: { x: 1, y: 1 } },
  { id: 'table-7', number: '7', capacity: 6, status: 'available', position: { x: 2, y: 1 } },
  { id: 'table-8', number: '8', capacity: 8, status: 'available', position: { x: 3, y: 1 } },
  { id: 'table-9', number: '9', capacity: 2, status: 'available', position: { x: 0, y: 2 } },
  { id: 'table-10', number: '10', capacity: 4, status: 'cleaning', position: { x: 1, y: 2 } },
  { id: 'table-11', number: '11', capacity: 4, status: 'available', position: { x: 2, y: 2 } },
  { id: 'table-12', number: '12', capacity: 10, status: 'available', position: { x: 3, y: 2 } },
];

export const defaultUsers: User[] = [
  { id: 'user-1', name: 'Admin User', email: 'admin@restaurant.com', role: 'admin', pin: '1234', active: true, createdAt: new Date().toISOString() },
  { id: 'user-2', name: 'John Smith', email: 'john@restaurant.com', role: 'waiter', pin: '1111', active: true, createdAt: new Date().toISOString() },
  { id: 'user-3', name: 'Jane Doe', email: 'jane@restaurant.com', role: 'waiter', pin: '2222', active: true, createdAt: new Date().toISOString() },
  { id: 'user-4', name: 'Mike Kitchen', email: 'mike@restaurant.com', role: 'kitchen', pin: '3333', active: true, createdAt: new Date().toISOString() },
  { id: 'user-5', name: 'Sarah Cash', email: 'sarah@restaurant.com', role: 'cashier', pin: '4444', active: true, createdAt: new Date().toISOString() },
];

export const defaultCustomers: Customer[] = [
  { id: 'cust-1', name: 'John Regular', email: 'john@email.com', phone: '555-0101', loyaltyPoints: 150, totalSpent: 450.00, visitCount: 12, createdAt: new Date().toISOString() },
  { id: 'cust-2', name: 'Mary Visitor', email: 'mary@email.com', phone: '555-0102', loyaltyPoints: 25, totalSpent: 75.00, visitCount: 3, createdAt: new Date().toISOString() },
  { id: 'cust-3', name: 'Tom VIP', email: 'tom@email.com', phone: '555-0103', loyaltyPoints: 500, totalSpent: 1500.00, visitCount: 35, createdAt: new Date().toISOString() },
];

export const defaultInventory: InventoryItem[] = [
  { id: 'inv-1', name: 'Salmon Fillet', category: 'Meat', quantity: 15, unit: 'pieces', minStock: 10, costPerUnit: 12.00, lastRestocked: '2024-01-10' },
  { id: 'inv-2', name: 'Ribeye Steak', category: 'Meat', quantity: 20, unit: 'pieces', minStock: 8, costPerUnit: 18.00, lastRestocked: '2024-01-09' },
  { id: 'inv-3', name: 'Chicken Breast', category: 'Meat', quantity: 30, unit: 'pieces', minStock: 15, costPerUnit: 5.00, lastRestocked: '2024-01-11' },
  { id: 'inv-4', name: 'Romaine Lettuce', category: 'Vegetables', quantity: 12, unit: 'heads', minStock: 8, costPerUnit: 2.50, lastRestocked: '2024-01-11' },
  { id: 'inv-5', name: 'Tomatoes', category: 'Vegetables', quantity: 25, unit: 'pieces', minStock: 10, costPerUnit: 1.50, lastRestocked: '2024-01-11' },
  { id: 'inv-6', name: 'Pasta', category: 'Dry Goods', quantity: 20, unit: 'kg', minStock: 5, costPerUnit: 3.00, lastRestocked: '2024-01-05' },
  { id: 'inv-7', name: 'House Red Wine', category: 'Beverages', quantity: 24, unit: 'bottles', minStock: 12, costPerUnit: 8.00, lastRestocked: '2024-01-08' },
  { id: 'inv-8', name: 'House White Wine', category: 'Beverages', quantity: 18, unit: 'bottles', minStock: 12, costPerUnit: 8.00, lastRestocked: '2024-01-08' },
  { id: 'inv-9', name: 'Soft Drinks', category: 'Beverages', quantity: 48, unit: 'cans', minStock: 24, costPerUnit: 1.00, lastRestocked: '2024-01-10' },
  { id: 'inv-10', name: 'Ice Cream', category: 'Dessert', quantity: 10, unit: 'liters', minStock: 5, costPerUnit: 6.00, lastRestocked: '2024-01-07' },
];

// Sample orders for demo
export const createSampleOrders = (): Order[] => {
  const menuItems = defaultMenuItems;
  const tables = defaultTables;
  
  const order1Items: OrderItem[] = [
    { id: 'oi-1', menuItemId: 'item-1', menuItem: menuItems[0], quantity: 2, price: 8.99, status: 'served' },
    { id: 'oi-2', menuItemId: 'item-5', menuItem: menuItems[4], quantity: 1, price: 24.99, status: 'preparing' },
    { id: 'oi-3', menuItemId: 'item-11', menuItem: menuItems[10], quantity: 2, price: 4.99, status: 'served' },
  ];
  
  const order1: Order = {
    id: 'order-1',
    tableId: 'table-3',
    table: tables[2],
    items: order1Items,
    status: 'preparing',
    subtotal: 52.95,
    tax: 4.24,
    discount: 0,
    total: 57.19,
    tip: 0,
    createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
    updatedAt: new Date().toISOString(),
    serverId: 'user-2',
  };
  
  return [order1];
};

export const TAX_RATE = 0.08;
