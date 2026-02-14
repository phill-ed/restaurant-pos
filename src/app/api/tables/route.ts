import { NextRequest, NextResponse } from 'next/server';
import db, { generateId } from '@/lib/db';

// GET all tables
export async function GET(request: NextRequest) {
  try {
    const tables = db.prepare('SELECT * FROM tables ORDER BY CAST(number AS INTEGER)').all();
    return NextResponse.json(tables);
  } catch (error) {
    console.error('Error fetching tables:', error);
    return NextResponse.json({ error: 'Failed to fetch tables' }, { status: 500 });
  }
}

// POST new table
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { number, capacity, positionX, positionY } = body;

    const id = generateId();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO tables (id, number, capacity, status, position_x, position_y, created_at, updated_at)
      VALUES (?, ?, ?, 'available', ?, ?, ?, ?)
    `).run(id, number, capacity, positionX || 0, positionY || 0, now, now);

    const table = db.prepare('SELECT * FROM tables WHERE id = ?').get(id);
    return NextResponse.json(table, { status: 201 });
  } catch (error) {
    console.error('Error creating table:', error);
    return NextResponse.json({ error: 'Failed to create table' }, { status: 500 });
  }
}

// PUT update table
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, number, capacity, status, currentOrderId, positionX, positionY } = body;
    const now = new Date().toISOString();

    db.prepare(`
      UPDATE tables 
      SET number = ?, capacity = ?, status = ?, current_order_id = ?, position_x = ?, position_y = ?, updated_at = ?
      WHERE id = ?
    `).run(number, capacity, status, currentOrderId || null, positionX || 0, positionY || 0, now, id);

    const table = db.prepare('SELECT * FROM tables WHERE id = ?').get(id);
    if (!table) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    }

    return NextResponse.json(table);
  } catch (error) {
    console.error('Error updating table:', error);
    return NextResponse.json({ error: 'Failed to update table' }, { status: 500 });
  }
}

// DELETE table
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Table ID required' }, { status: 400 });
    }

    db.prepare('DELETE FROM tables WHERE id = ?').run(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting table:', error);
    return NextResponse.json({ error: 'Failed to delete table' }, { status: 500 });
  }
}
