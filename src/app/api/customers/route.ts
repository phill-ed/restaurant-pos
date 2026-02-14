import { NextRequest, NextResponse } from 'next/server';
import db, { generateId } from '@/lib/db';

// GET all customers
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'name';

    let query = 'SELECT * FROM customers WHERE 1=1';
    const params: string[] = [];

    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (sortBy === 'spent') {
      query += ' ORDER BY total_spent DESC';
    } else if (sortBy === 'visits') {
      query += ' ORDER BY visit_count DESC';
    } else if (sortBy === 'points') {
      query += ' ORDER BY loyalty_points DESC';
    } else {
      query += ' ORDER BY name ASC';
    }

    const customers = db.prepare(query).all(...params);
    return NextResponse.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}

// POST new customer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone } = body;

    const id = generateId();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO customers (id, name, email, phone, loyalty_points, total_spent, visit_count, created_at, updated_at)
      VALUES (?, ?, ?, ?, 0, 0, 0, ?, ?)
    `).run(id, name, email || null, phone || null, now, now);

    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
    return NextResponse.json(customer, { status: 201 });
  } catch (error: any) {
    if (error.message?.includes('UNIQUE constraint failed')) {
      return NextResponse.json({ error: 'Customer with this email already exists' }, { status: 400 });
    }
    console.error('Error creating customer:', error);
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
  }
}

// PUT update customer
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, email, phone, loyaltyPoints } = body;
    const now = new Date().toISOString();

    db.prepare(`
      UPDATE customers 
      SET name = ?, email = ?, phone = ?, loyalty_points = ?, updated_at = ?
      WHERE id = ?
    `).run(name, email || null, phone || null, loyaltyPoints, now, id);

    const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json(customer);
  } catch (error) {
    console.error('Error updating customer:', error);
    return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 });
  }
}

// DELETE customer
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Customer ID required' }, { status: 400 });
    }

    db.prepare('DELETE FROM customers WHERE id = ?').run(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 });
  }
}
