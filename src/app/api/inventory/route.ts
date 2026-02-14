import { NextRequest, NextResponse } from 'next/server';
import db, { generateId } from '@/lib/db';

// GET all inventory items
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const lowStock = searchParams.get('lowStock');

    let query = 'SELECT * FROM inventory WHERE 1=1';
    const params: (string | number)[] = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    if (lowStock === 'true') {
      query += ' AND quantity <= min_stock';
    }

    query += ' ORDER BY name ASC';

    const inventory = db.prepare(query).all(...params);
    return NextResponse.json(inventory);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}

// POST new inventory item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, category, quantity, unit, minStock, costPerUnit, supplier } = body;

    const id = generateId();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO inventory (id, name, category, quantity, unit, min_stock, cost_per_unit, supplier, last_restocked, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, name, category || null, quantity || 0, unit || 'units', minStock || 0, costPerUnit || 0, supplier || null, now, now, now);

    const item = db.prepare('SELECT * FROM inventory WHERE id = ?').get(id);
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Error creating inventory item:', error);
    return NextResponse.json({ error: 'Failed to create inventory item' }, { status: 500 });
  }
}

// PUT update inventory item
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, category, quantity, unit, minStock, costPerUnit, supplier } = body;
    const now = new Date().toISOString();

    db.prepare(`
      UPDATE inventory 
      SET name = ?, category = ?, quantity = ?, unit = ?, min_stock = ?, cost_per_unit = ?, supplier = ?, updated_at = ?
      WHERE id = ?
    `).run(name, category || null, quantity, unit || 'units', minStock || 0, costPerUnit || 0, supplier || null, now, id);

    const item = db.prepare('SELECT * FROM inventory WHERE id = ?').get(id);
    if (!item) {
      return NextResponse.json({ error: 'Inventory item not found' }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error('Error updating inventory item:', error);
    return NextResponse.json({ error: 'Failed to update inventory item' }, { status: 500 });
  }
}

// DELETE inventory item
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Inventory ID required' }, { status: 400 });
    }

    db.prepare('DELETE FROM inventory WHERE id = ?').run(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    return NextResponse.json({ error: 'Failed to delete inventory item' }, { status: 500 });
  }
}
