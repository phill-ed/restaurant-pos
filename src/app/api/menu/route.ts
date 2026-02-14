import { NextRequest, NextResponse } from 'next/server';
import db, { generateId } from '@/lib/db';

// GET all menu items
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const categoryId = searchParams.get('categoryId');
    const availability = searchParams.get('availability');

    let query = 'SELECT * FROM menu_items WHERE 1=1';
    const params: string[] = [];

    if (categoryId) {
      query += ' AND category_id = ?';
      params.push(categoryId);
    }

    if (availability) {
      query += ' AND availability = ?';
      params.push(availability);
    }

    query += ' ORDER BY name ASC';

    const menuItems = db.prepare(query).all(...params);
    return NextResponse.json(menuItems);
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return NextResponse.json({ error: 'Failed to fetch menu items' }, { status: 500 });
  }
}

// POST new menu item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, price, categoryId, image, availability, preparationTime, ingredients } = body;

    const id = generateId();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO menu_items (id, name, description, price, category_id, image, availability, preparation_time, ingredients, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, name, description, price, categoryId, image, availability || 'available', preparationTime || 0, JSON.stringify(ingredients || []), now, now);

    const menuItem = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(id);
    return NextResponse.json(menuItem, { status: 201 });
  } catch (error) {
    console.error('Error creating menu item:', error);
    return NextResponse.json({ error: 'Failed to create menu item' }, { status: 500 });
  }
}
