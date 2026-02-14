import { NextRequest, NextResponse } from 'next/server';
import db, { generateId } from '@/lib/db';

// GET all orders
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const tableId = searchParams.get('tableId');
    const serverId = searchParams.get('serverId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const activeOnly = searchParams.get('activeOnly');

    let query = `
      SELECT o.*, t.number as table_number, c.name as customer_name
      FROM orders o
      LEFT JOIN tables t ON o.table_id = t.id
      LEFT JOIN customers c ON o.customer_id = c.id
      WHERE 1=1
    `;
    const params: (string | number)[] = [];

    if (status) {
      query += ' AND o.status = ?';
      params.push(status);
    }

    if (tableId) {
      query += ' AND o.table_id = ?';
      params.push(tableId);
    }

    if (serverId) {
      query += ' AND o.server_id = ?';
      params.push(serverId);
    }

    if (startDate) {
      query += ' AND o.created_at >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND o.created_at <= ?';
      params.push(endDate);
    }

    if (activeOnly === 'true') {
      query += " AND o.status NOT IN ('paid', 'cancelled')";
    }

    query += ' ORDER BY o.created_at DESC';

    const orders = db.prepare(query).all(...params);

    // Fetch order items for each order
    const ordersWithItems = orders.map((order: any) => {
      const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
      return { ...order, items };
    });

    return NextResponse.json(ordersWithItems);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

// POST new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tableId, customerId, serverId, items, notes } = body;

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
    const taxRate = 0.08;
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    const orderId = generateId();
    const now = new Date().toISOString();

    // Create order
    db.prepare(`
      INSERT INTO orders (id, table_id, customer_id, server_id, subtotal, tax, total, status, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)
    `).run(orderId, tableId, customerId, serverId, subtotal, tax, total, notes, now, now);

    // Create order items
    const insertItem = db.prepare(`
      INSERT INTO order_items (id, order_id, menu_item_id, quantity, price, notes, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?)
    `);

    for (const item of items) {
      const itemId = generateId();
      insertItem.run(itemId, orderId, item.menuItemId, item.quantity, item.price, item.notes || null, now, now);
    }

    // Update table status
    db.prepare('UPDATE tables SET current_order_id = ?, status = ? WHERE id = ?')
      .run(orderId, 'occupied', tableId);

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    const orderItems = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);

    return NextResponse.json({ ...order, items: orderItems }, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

// PUT update order
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, discount, tip, paymentMethod } = body;
    const now = new Date().toISOString();

    let query = 'UPDATE orders SET status = ?, updated_at = ?';
    const params: (string | number | null)[] = [status, now];

    if (discount !== undefined) {
      query += ', discount = ?';
      params.unshift(discount);
    }

    if (tip !== undefined) {
      query += ', tip = ?';
      params.unshift(tip);
    }

    if (paymentMethod) {
      query += ', payment_method = ?, paid_at = ?';
      params.unshift(now, paymentMethod);
    }

    query += ' WHERE id = ?';
    params.push(id);

    db.prepare(query).run(...params);

    // If order is paid, update table status
    if (status === 'paid') {
      const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as any;
      if (order?.table_id) {
        db.prepare('UPDATE tables SET current_order_id = NULL, status = ? WHERE id = ?')
          .run('cleaning', order.table_id);
      }
    }

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
