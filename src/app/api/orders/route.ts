import { NextRequest, NextResponse } from 'next/server';
import { query, transaction, generateId } from '@/lib/db';

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

    let queryText = `
      SELECT o.*, t.number as table_number, c.name as customer_name
      FROM orders o
      LEFT JOIN tables t ON o.table_id = t.id
      LEFT JOIN customers c ON o.customer_id = c.id
      WHERE 1=1
    `;
    const params: (string | number)[] = [];

    if (status) {
      queryText += ' AND o.status = $' + (params.length + 1);
      params.push(status);
    }

    if (tableId) {
      queryText += ' AND o.table_id = $' + (params.length + 1);
      params.push(tableId);
    }

    if (serverId) {
      queryText += ' AND o.server_id = $' + (params.length + 1);
      params.push(serverId);
    }

    if (startDate) {
      queryText += ' AND o.created_at >= $' + (params.length + 1);
      params.push(startDate);
    }

    if (endDate) {
      queryText += ' AND o.created_at <= $' + (params.length + 1);
      params.push(endDate);
    }

    if (activeOnly === 'true') {
      queryText += " AND o.status NOT IN ('paid', 'cancelled')";
    }

    queryText += ' ORDER BY o.created_at DESC';

    const result = await query(queryText, params);
    
    // Fetch order items for each order
    const ordersWithItems = await Promise.all(result.rows.map(async (order: any) => {
      const itemsResult = await query('SELECT * FROM order_items WHERE order_id = $1', [order.id]);
      return { ...order, items: itemsResult.rows };
    }));

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

    const result = await transaction(async (client) => {
      // Calculate totals
      const subtotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
      const taxRate = 0.08;
      const tax = subtotal * taxRate;
      const total = subtotal + tax;

      const orderId = generateId();
      const now = new Date().toISOString();

      // Create order
      await client.query(
        `INSERT INTO orders (id, table_id, customer_id, server_id, subtotal, tax, total, status, notes, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', $8, $9, $10)`,
        [orderId, tableId, customerId, serverId, subtotal, tax, total, notes, now, now]
      );

      // Create order items
      for (const item of items) {
        const itemId = generateId();
        await client.query(
          `INSERT INTO order_items (id, order_id, menu_item_id, quantity, price, notes, status, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7, $8)`,
          [itemId, orderId, item.menuItemId, item.quantity, item.price, item.notes || null, now, now]
        );
      }

      // Update table status
      await client.query(
        'UPDATE tables SET current_order_id = $1, status = $2 WHERE id = $3',
        [orderId, 'occupied', tableId]
      );

      return orderId;
    });

    const orderResult = await query('SELECT * FROM orders WHERE id = $1', [result]);
    const itemsResult = await query('SELECT * FROM order_items WHERE order_id = $1', [result]);

    return NextResponse.json({ ...orderResult.rows[0], items: itemsResult.rows }, { status: 201 });
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

    let queryText = 'UPDATE orders SET status = $1, updated_at = $2';
    const params: (string | number | null)[] = [status, now];

    if (discount !== undefined) {
      queryText = 'UPDATE orders SET discount = $1, ' + queryText.substring(queryText.indexOf('SET') + 4);
      params.unshift(discount);
    }

    if (tip !== undefined) {
      queryText = 'UPDATE orders SET tip = $1, ' + queryText.substring(queryText.indexOf('SET') + 4);
      params.unshift(tip);
    }

    if (paymentMethod) {
      queryText = 'UPDATE orders SET payment_method = $1, paid_at = $2, ' + queryText.substring(queryText.indexOf('SET') + 4);
      params.unshift(now, paymentMethod);
    }

    queryText += ' WHERE id = $' + (params.length + 1);
    params.push(id);

    await query(queryText, params);

    // If order is paid, update table status
    if (status === 'paid') {
      const orderResult = await query('SELECT * FROM orders WHERE id = $1', [id]);
      const order = orderResult.rows[0];
      if (order?.table_id) {
        await query('UPDATE tables SET current_order_id = NULL, status = $1 WHERE id = $2', ['cleaning', order.table_id]);
      }
    }

    const result = await query('SELECT * FROM orders WHERE id = $1', [id]);
    if (!result.rows[0]) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
