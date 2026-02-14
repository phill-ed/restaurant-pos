import db, { generateId, initializeDatabase } from '@/lib/db';

export function seedDatabase() {
  // Check if already seeded
  const existingUsers = db.prepare('SELECT COUNT(*) as count FROM users').get() as any;
  if (existingUsers.count > 0) {
    console.log('Database already seeded, skipping...');
    return;
  }

  console.log('Seeding database...');

  const now = new Date().toISOString();

  // Seed Users
  const users = [
    { id: generateId(), name: 'Admin User', email: 'admin@restaurant.com', role: 'admin', pin: '1234', active: 1 },
    { id: generateId(), name: 'John Smith', email: 'john@restaurant.com', role: 'waiter', pin: '1111', active: 1 },
    { id: generateId(), name: 'Jane Doe', email: 'jane@restaurant.com', role: 'waiter', pin: '2222', active: 1 },
    { id: generateId(), name: 'Mike Kitchen', email: 'mike@restaurant.com', role: 'kitchen', pin: '3333', active: 1 },
    { id: generateId(), name: 'Sarah Cash', email: 'sarah@restaurant.com', role: 'cashier', pin: '4444', active: 1 },
  ];

  const insertUser = db.prepare(`
    INSERT INTO users (id, name, email, role, pin, active, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  users.forEach(user => {
    insertUser.run(user.id, user.name, user.email, user.role, user.pin, user.active, now, now);
  });

  // Seed Categories
  const categories = [
    { id: 'cat-1', name: 'Appetizers', icon: 'soup', color: '#F59E0B', sort_order: 1 },
    { id: 'cat-2', name: 'Main Courses', icon: 'utensils', color: '#10B981', sort_order: 2 },
    { id: 'cat-3', name: 'Drinks', icon: 'coffee', color: '#3B82F6', sort_order: 3 },
    { id: 'cat-4', name: 'Desserts', icon: 'cake', color: '#EC4899', sort_order: 4 },
    { id: 'cat-5', name: 'Sides', icon: 'carrot', color: '#8B5CF6', sort_order: 5 },
  ];

  const insertCategory = db.prepare(`
    INSERT INTO categories (id, name, icon, color, sort_order, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  categories.forEach(cat => {
    insertCategory.run(cat.id, cat.name, cat.icon, cat.color, cat.sort_order, now, now);
  });

  // Seed Menu Items (20+ items)
  const menuItems = [
    // Appetizers
    { id: 'item-1', name: 'Bruschetta', description: 'Toasted bread with tomatoes, garlic, and basil', price: 8.99, category_id: 'cat-1', availability: 'available', preparation_time: 10 },
    { id: 'item-2', name: 'Garlic Bread', description: 'Crispy bread with garlic butter', price: 5.99, category_id: 'cat-1', availability: 'available', preparation_time: 8 },
    { id: 'item-3', name: 'Caesar Salad', description: 'Fresh romaine with caesar dressing', price: 10.99, category_id: 'cat-1', availability: 'available', preparation_time: 12 },
    { id: 'item-4', name: 'Soup of the Day', description: 'Ask your server for today\'s selection', price: 6.99, category_id: 'cat-1', availability: 'available', preparation_time: 5 },
    { id: 'item-5', name: ' Calamari', description: 'Crispy fried squid with marinara', price: 12.99, category_id: 'cat-1', availability: 'available', preparation_time: 15 },
    
    // Main Courses
    { id: 'item-6', name: 'Grilled Salmon', description: 'Atlantic salmon with seasonal vegetables', price: 24.99, category_id: 'cat-2', availability: 'available', preparation_time: 20 },
    { id: 'item-7', name: 'Ribeye Steak', description: '12oz ribeye with mashed potatoes', price: 32.99, category_id: 'cat-2', availability: 'available', preparation_time: 25 },
    { id: 'item-8', name: 'Chicken Parmesan', description: 'Breaded chicken with marinara and mozzarella', price: 18.99, category_id: 'cat-2', availability: 'available', preparation_time: 18 },
    { id: 'item-9', name: 'Pasta Carbonara', description: 'Spaghetti with cream sauce and bacon', price: 16.99, category_id: 'cat-2', availability: 'available', preparation_time: 15 },
    { id: 'item-10', name: 'Vegetable Stir Fry', description: 'Fresh seasonal vegetables in soy glaze', price: 14.99, category_id: 'cat-2', availability: 'available', preparation_time: 15 },
    { id: 'item-11', name: 'Fish & Chips', description: 'Beer-battered cod with fries', price: 17.99, category_id: 'cat-2', availability: 'available', preparation_time: 18 },
    { id: 'item-12', name: 'Lamb Chops', description: 'New Zealand lamb with rosemary sauce', price: 28.99, category_id: 'cat-2', availability: 'available', preparation_time: 22 },
    { id: 'item-13', name: 'Shrimp Scampi', description: 'Garlic butter shrimp over linguine', price: 22.99, category_id: 'cat-2', availability: 'available', preparation_time: 18 },
    
    // Drinks
    { id: 'item-14', name: 'Fresh Lemonade', description: 'House-made with fresh lemons', price: 4.99, category_id: 'cat-3', availability: 'available', preparation_time: 3 },
    { id: 'item-15', name: 'Iced Coffee', description: 'Cold brew with milk', price: 5.99, category_id: 'cat-3', availability: 'available', preparation_time: 3 },
    { id: 'item-16', name: 'Soft Drinks', description: 'Coke, Sprite, or Fanta', price: 3.49, category_id: 'cat-3', availability: 'available', preparation_time: 1 },
    { id: 'item-17', name: 'Sparkling Water', description: 'San Pellegrino 500ml', price: 4.49, category_id: 'cat-3', availability: 'available', preparation_time: 1 },
    { id: 'item-18', name: 'House Wine', description: 'Red or White, by the glass', price: 8.99, category_id: 'cat-3', availability: 'available', preparation_time: 2 },
    { id: 'item-19', name: 'Craft Beer', description: 'Local IPA on tap', price: 7.99, category_id: 'cat-3', availability: 'available', preparation_time: 1 },
    
    // Desserts
    { id: 'item-20', name: 'Tiramisu', description: 'Classic Italian coffee dessert', price: 9.99, category_id: 'cat-4', availability: 'available', preparation_time: 5 },
    { id: 'item-21', name: 'Chocolate Lava Cake', description: 'Warm cake with molten chocolate center', price: 11.99, category_id: 'cat-4', availability: 'available', preparation_time: 12 },
    { id: 'item-22', name: 'Cheesecake', description: 'New York style with berry compote', price: 8.99, category_id: 'cat-4', availability: 'available', preparation_time: 5 },
    { id: 'item-23', name: 'Ice Cream Sundae', description: 'Three scoops with toppings', price: 7.99, category_id: 'cat-4', availability: 'available', preparation_time: 5 },
    
    // Sides
    { id: 'item-24', name: 'French Fries', description: 'Crispy golden fries', price: 4.99, category_id: 'cat-5', availability: 'available', preparation_time: 8 },
    { id: 'item-25', name: 'Mashed Potatoes', description: 'Creamy mashed potatoes', price: 4.99, category_id: 'cat-5', availability: 'available', preparation_time: 5 },
    { id: 'item-26', name: 'Steamed Vegetables', description: 'Seasonal vegetables', price: 5.99, category_id: 'cat-5', availability: 'available', preparation_time: 10 },
    { id: 'item-27', name: 'Onion Rings', description: 'Beer-battered onion rings', price: 6.99, category_id: 'cat-5', availability: 'available', preparation_time: 10 },
    { id: 'item-28', name: 'Garlic Mashed Potatoes', description: 'Creamy with roasted garlic', price: 5.99, category_id: 'cat-5', availability: 'available', preparation_time: 6 },
  ];

  const insertMenuItem = db.prepare(`
    INSERT INTO menu_items (id, name, description, price, category_id, availability, preparation_time, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  menuItems.forEach(item => {
    insertMenuItem.run(item.id, item.name, item.description, item.price, item.category_id, item.availability, item.preparation_time, now, now);
  });

  // Seed Tables (10 tables)
  const tables = [
    { id: 'table-1', number: '1', capacity: 2, status: 'available', position_x: 0, position_y: 0 },
    { id: 'table-2', number: '2', capacity: 2, status: 'available', position_x: 1, position_y: 0 },
    { id: 'table-3', number: '3', capacity: 4, status: 'occupied', position_x: 2, position_y: 0 },
    { id: 'table-4', number: '4', capacity: 4, status: 'available', position_x: 3, position_y: 0 },
    { id: 'table-5', number: '5', capacity: 4, status: 'reserved', position_x: 0, position_y: 1 },
    { id: 'table-6', number: '6', capacity: 6, status: 'available', position_x: 1, position_y: 1 },
    { id: 'table-7', number: '7', capacity: 6, status: 'available', position_x: 2, position_y: 1 },
    { id: 'table-8', number: '8', capacity: 8, status: 'available', position_x: 3, position_y: 1 },
    { id: 'table-9', number: '9', capacity: 2, status: 'available', position_x: 0, position_y: 2 },
    { id: 'table-10', number: '10', capacity: 4, status: 'cleaning', position_x: 1, position_y: 2 },
  ];

  const insertTable = db.prepare(`
    INSERT INTO tables (id, number, capacity, status, current_order_id, position_x, position_y, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  tables.forEach(table => {
    insertTable.run(table.id, table.number, table.capacity, table.status, null, table.position_x, table.position_y, now, now);
  });

  // Seed Customers (5 customers)
  const customers = [
    { name: 'John Regular', email: 'john@email.com', phone: '555-0101', loyalty_points: 150, total_spent: 450.00, visit_count: 12 },
    { name: 'Mary Visitor', email: 'mary@email.com', phone: '555-0102', loyalty_points: 25, total_spent: 75.00, visit_count: 3 },
    { name: 'Tom VIP', email: 'tom@email.com', phone: '555-0103', loyalty_points: 500, total_spent: 1500.00, visit_count: 35 },
    { name: 'Sarah Guest', email: 'sarah@email.com', phone: '555-0104', loyalty_points: 75, total_spent: 225.00, visit_count: 8 },
    { name: 'Mike Diner', email: 'mike@email.com', phone: '555-0105', loyalty_points: 10, total_spent: 30.00, visit_count: 2 },
  ];

  const insertCustomer = db.prepare(`
    INSERT INTO customers (id, name, email, phone, loyalty_points, total_spent, visit_count, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  customers.forEach(customer => {
    const id = generateId();
    insertCustomer.run(id, customer.name, customer.email, customer.phone, customer.loyalty_points, customer.total_spent, customer.visit_count, now, now);
  });

  // Seed Inventory
  const inventory = [
    { name: 'Salmon Fillet', category: 'Meat', quantity: 15, unit: 'pieces', min_stock: 10, cost_per_unit: 12.00 },
    { name: 'Ribeye Steak', category: 'Meat', quantity: 20, unit: 'pieces', min_stock: 8, cost_per_unit: 18.00 },
    { name: 'Chicken Breast', category: 'Meat', quantity: 30, unit: 'pieces', min_stock: 15, cost_per_unit: 5.00 },
    { name: 'Lamb Chops', category: 'Meat', quantity: 12, unit: 'pieces', min_stock: 6, cost_per_unit: 15.00 },
    { name: 'Shrimp', category: 'Seafood', quantity: 10, unit: 'kg', min_stock: 5, cost_per_unit: 22.00 },
    { name: 'Romaine Lettuce', category: 'Vegetables', quantity: 12, unit: 'heads', min_stock: 8, cost_per_unit: 2.50 },
    { name: 'Tomatoes', category: 'Vegetables', quantity: 25, unit: 'pieces', min_stock: 10, cost_per_unit: 1.50 },
    { name: 'Potatoes', category: 'Vegetables', quantity: 50, unit: 'kg', min_stock: 20, cost_per_unit: 1.00 },
    { name: 'Pasta', category: 'Dry Goods', quantity: 20, unit: 'kg', min_stock: 5, cost_per_unit: 3.00 },
    { name: 'House Red Wine', category: 'Beverages', quantity: 24, unit: 'bottles', min_stock: 12, cost_per_unit: 8.00 },
    { name: 'House White Wine', category: 'Beverages', quantity: 18, unit: 'bottles', min_stock: 12, cost_per_unit: 8.00 },
    { name: 'Craft Beer', category: 'Beverages', quantity: 48, unit: 'bottles', min_stock: 24, cost_per_unit: 3.00 },
    { name: 'Soft Drinks', category: 'Beverages', quantity: 48, unit: 'cans', min_stock: 24, cost_per_unit: 1.00 },
    { name: 'Ice Cream', category: 'Dessert', quantity: 10, unit: 'liters', min_stock: 5, cost_per_unit: 6.00 },
    { name: 'Cheesecake', category: 'Dessert', quantity: 8, unit: 'pieces', min_stock: 4, cost_per_unit: 4.00 },
  ];

  const insertInventory = db.prepare(`
    INSERT INTO inventory (id, name, category, quantity, unit, min_stock, cost_per_unit, last_restocked, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  inventory.forEach(item => {
    const id = generateId();
    insertInventory.run(id, item.name, item.category, item.quantity, item.unit, item.min_stock, item.cost_per_unit, now, now, now);
  });

  console.log('Database seeded successfully!');
}

// Run if executed directly
if (require.main === module) {
  initializeDatabase();
  seedDatabase();
}
