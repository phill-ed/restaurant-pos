import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'restaurant.db');
let db: Database.Database;

// Ensure data directory exists
import fs from 'fs';
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

try {
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
} catch (error) {
  console.error('Failed to connect to database:', error);
  throw error;
}

// Initialize database tables
export function initializeDatabase() {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'waiter', 'kitchen', 'cashier')),
      pin TEXT NOT NULL,
      avatar TEXT,
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Categories table
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT,
      color TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Menu items table
  db.exec(`
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
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    )
  `);

  // Tables table
  db.exec(`
    CREATE TABLE IF NOT EXISTS tables (
      id TEXT PRIMARY KEY,
      number TEXT NOT NULL,
      capacity INTEGER NOT NULL,
      status TEXT DEFAULT 'available' CHECK(status IN ('available', 'occupied', 'reserved', 'cleaning')),
      current_order_id TEXT,
      position_x INTEGER DEFAULT 0,
      position_y INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Customers table
  db.exec(`
    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE,
      phone TEXT,
      loyalty_points INTEGER DEFAULT 0,
      total_spent REAL DEFAULT 0,
      visit_count INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Orders table
  db.exec(`
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
      paid_at TEXT,
      server_id TEXT,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (table_id) REFERENCES tables(id),
      FOREIGN KEY (customer_id) REFERENCES customers(id),
      FOREIGN KEY (server_id) REFERENCES users(id)
    )
  `);

  // Order items table
  db.exec(`
    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      menu_item_id TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      notes TEXT,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'preparing', 'ready', 'served')),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
    )
  `);

  // Inventory table
  db.exec(`
    CREATE TABLE IF NOT EXISTS inventory (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT,
      quantity REAL DEFAULT 0,
      unit TEXT,
      min_stock REAL DEFAULT 0,
      cost_per_unit REAL DEFAULT 0,
      supplier TEXT,
      last_restocked TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Receipts table
  db.exec(`
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
      printed_at TEXT DEFAULT CURRENT_TIMESTAMP,
      emailed_at TEXT,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    )
  `);

  console.log('Database initialized successfully');
}

// Helper functions for CRUD operations
export function getDb(): Database.Database {
  return db;
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export default db;
