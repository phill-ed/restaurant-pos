import { Pool, PoolClient, QueryResult } from 'pg';

// Database connection configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/restaurant_pos',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Get a client from the pool
export async function getClient(): Promise<PoolClient> {
  return pool.connect();
}

// Query helper
export async function query(text: string, params?: any[]): Promise<QueryResult> {
  return pool.query(text, params);
}

// Transaction helper
export async function transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Initialize database tables
export async function initializeDatabase() {
  const client = await getClient();
  
  try {
    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('admin', 'waiter', 'kitchen', 'cashier')),
        pin TEXT NOT NULL,
        avatar TEXT,
        active INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Categories table
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        icon TEXT,
        color TEXT,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Menu items table
    await client.query(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        category_id TEXT,
        image TEXT,
        availability TEXT DEFAULT 'available' CHECK(availability IN ('available', 'unavailable', 'limited')),
        preparation_time INTEGER DEFAULT 0,
        ingredients TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
      )
    `);

    // Tables table
    await client.query(`
      CREATE TABLE IF NOT EXISTS tables (
        id TEXT PRIMARY KEY,
        number TEXT NOT NULL,
        capacity INTEGER NOT NULL,
        status TEXT DEFAULT 'available' CHECK(status IN ('available', 'occupied', 'reserved', 'cleaning')),
        current_order_id TEXT,
        position_x INTEGER DEFAULT 0,
        position_y INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Customers table
    await client.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE,
        phone TEXT,
        loyalty_points INTEGER DEFAULT 0,
        total_spent REAL DEFAULT 0,
        visit_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Orders table
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        table_id TEXT,
        customer_id TEXT,
        status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'preparing', 'ready', 'served', 'paid', 'cancelled')),
        subtotal REAL DEFAULT 0,
        tax REAL DEFAULT 0,
        discount REAL DEFAULT 0,
        total REAL DEFAULT 0,
        tip REAL DEFAULT 0,
        payment_method TEXT CHECK(payment_method IN ('cash', 'card', 'digital')),
        paid_at TIMESTAMP,
        server_id TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (table_id) REFERENCES tables(id) ON DELETE SET NULL,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
        FOREIGN KEY (server_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // Order items table
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id TEXT PRIMARY KEY,
        order_id TEXT NOT NULL,
        menu_item_id TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        notes TEXT,
        status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'preparing', 'ready', 'served')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE RESTRICT
      )
    `);

    // Inventory table
    await client.query(`
      CREATE TABLE IF NOT EXISTS inventory (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT,
        quantity REAL DEFAULT 0,
        unit TEXT,
        min_stock REAL DEFAULT 0,
        cost_per_unit REAL DEFAULT 0,
        supplier TEXT,
        last_restocked TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Receipts table
    await client.query(`
      CREATE TABLE IF NOT EXISTS receipts (
        id TEXT PRIMARY KEY,
        order_id TEXT NOT NULL,
        customer_id TEXT,
        items TEXT NOT NULL,
        subtotal REAL NOT NULL,
        tax REAL NOT NULL,
        discount REAL DEFAULT 0,
        total REAL NOT NULL,
        tip REAL DEFAULT 0,
        payment_method TEXT,
        printed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        emailed_at TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE RESTRICT,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
      )
    `);

    console.log('Database initialized successfully with PostgreSQL');
  } finally {
    client.release();
  }
}

// Seed data function
export async function seedDatabase() {
  const client = await getClient();
  
  try {
    // Check if data already exists
    const result = await client.query('SELECT COUNT(*) FROM users');
    if (parseInt(result.rows[0].count) > 0) {
      console.log('Database already seeded');
      return;
    }

    // Seed users
    const users = [
      { id: generateId(), name: 'Admin User', email: 'admin@restaurant.com', role: 'admin', pin: '1234' },
      { id: generateId(), name: 'John Waiter', email: 'john@restaurant.com', role: 'waiter', pin: '1111' },
      { id: generateId(), name: 'Jane Kitchen', email: 'jane@restaurant.com', role: 'kitchen', pin: '2222' },
      { id: generateId(), name: 'Bob Cashier', email: 'bob@restaurant.com', role: 'cashier', pin: '3333' },
    ];
    
    for (const user of users) {
      await client.query(`
        INSERT INTO users (id, name, email, role, pin)
        VALUES ($1, $2, $3, $4, $5)
      `, [user.id, user.name, user.email, user.role, user.pin]);
    }

    // Seed categories
    const categories = [
      { id: generateId(), name: 'Appetizers', color: '#10B981', icon: '🥗' },
      { id: generateId(), name: 'Main Courses', color: '#3B82F6', icon: '🍽️' },
      { id: generateId(), name: 'Pasta', color: '#F59E0B', icon: '🍝' },
      { id: generateId(), name: 'Seafood', color: '#06B6D4', icon: '🦐' },
      { id: generateId(), name: 'Desserts', color: '#EC4899', icon: '🍰' },
      { id: generateId(), name: 'Beverages', color: '#8B5CF6', icon: '🥤' },
    ];
    
    for (const cat of categories) {
      await client.query(`
        INSERT INTO categories (id, name, color, icon)
        VALUES ($1, $2, $3, $4)
      `, [cat.id, cat.name, cat.color, cat.icon]);
    }

    // Seed menu items
    const menuItems = [
      { name: 'Caesar Salad', description: 'Fresh romaine lettuce with caesar dressing', price: 12.99, categoryId: categories[0].id, prepTime: 10 },
      { name: 'Bruschetta', description: 'Grilled bread with tomatoes and basil', price: 9.99, categoryId: categories[0].id, prepTime: 8 },
      { name: 'Soup of the Day', description: 'Ask your server for today\'s selection', price: 7.99, categoryId: categories[0].id, prepTime: 5 },
      { name: 'Grilled Salmon', description: 'Atlantic salmon with lemon butter sauce', price: 28.99, categoryId: categories[3].id, prepTime: 20 },
      { name: 'Shrimp Scampi', description: 'Garlic butter shrimp over linguine', price: 26.99, categoryId: categories[3].id, prepTime: 18 },
      { name: 'Spaghetti Carbonara', description: 'Classic Italian with pancetta and egg', price: 18.99, categoryId: categories[2].id, prepTime: 15 },
      { name: 'Fettuccine Alfredo', description: 'Creamy parmesan sauce', price: 16.99, categoryId: categories[2].id, prepTime: 15 },
      { name: 'Ribeye Steak', description: '12oz USDA Prime with herbs', price: 42.99, categoryId: categories[1].id, prepTime: 25 },
      { name: 'Chicken Parmesan', description: 'Breaded chicken with marinara and mozzarella', price: 22.99, categoryId: categories[1].id, prepTime: 20 },
      { name: 'Margherita Pizza', description: 'Fresh mozzarella, tomatoes, basil', price: 18.99, categoryId: categories[1].id, prepTime: 15 },
      { name: 'Tiramisu', description: 'Classic Italian coffee dessert', price: 9.99, categoryId: categories[4].id, prepTime: 5 },
      { name: 'Chocolate Lava Cake', description: 'Warm chocolate cake with molten center', price: 11.99, categoryId: categories[4].id, prepTime: 12 },
      { name: 'Espresso', description: 'Double shot Italian espresso', price: 3.99, categoryId: categories[5].id, prepTime: 3 },
      { name: 'Fresh Lemonade', description: 'House-made with fresh lemons', price: 4.99, categoryId: categories[5].id, prepTime: 2 },
      { name: 'Red Wine (Glass)', description: 'Chianti Classico', price: 12.99, categoryId: categories[5].id, prepTime: 1 },
    ];
    
    for (const item of menuItems) {
      await client.query(`
        INSERT INTO menu_items (id, name, description, price, category_id, preparation_time)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [generateId(), item.name, item.description, item.price, item.categoryId, item.prepTime]);
    }

    // Seed tables
    for (let i = 1; i <= 12; i++) {
      const capacity = i <= 4 ? 2 : i <= 8 ? 4 : 6;
      await client.query(`
        INSERT INTO tables (id, number, capacity, status, position_x, position_y)
        VALUES ($1, $2, $3, 'available', $4, $5)
      `, [generateId(), i.toString(), capacity, (i % 4) * 150, Math.floor(i / 4) * 120]);
    }

    // Seed customers
    const customers = [
      { name: 'Alice Smith', email: 'alice@email.com', phone: '555-0101' },
      { name: 'Bob Johnson', email: 'bob@email.com', phone: '555-0102' },
      { name: 'Carol Williams', email: 'carol@email.com', phone: '555-0103' },
      { name: 'David Brown', email: 'david@email.com', phone: '555-0104' },
      { name: 'Eva Martinez', email: 'eva@email.com', phone: '555-0105' },
    ];
    
    for (const customer of customers) {
      await client.query(`
        INSERT INTO customers (id, name, email, phone, loyalty_points, visit_count)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [generateId(), customer.name, customer.email, customer.phone, Math.floor(Math.random() * 500), Math.floor(Math.random() * 20)]);
    }

    console.log('Database seeded successfully');
  } finally {
    client.release();
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await pool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await pool.end();
  process.exit(0);
});

export default { query, transaction, getClient, generateId, initializeDatabase, seedDatabase, pool };
