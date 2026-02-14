import { NextRequest, NextResponse } from 'next/server';
import { query, generateId } from '@/lib/db';

// GET all menu items
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const categoryId = searchParams.get('categoryId');
    const availability = searchParams.get('availability');

    let queryText = 'SELECT * FROM menu_items WHERE 1=1';
    const params: (string | number)[] = [];

    if (categoryId) {
      queryText += ' AND category_id = $' + (params.length + 1);
      params.push(categoryId);
    }

    if (availability) {
      queryText += ' AND availability = $' + (params.length + 1);
      params.push(availability);
    }

    queryText += ' ORDER BY name ASC';

    const result = await query(queryText, params);
    return NextResponse.json(result.rows);
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

    await query(
      `INSERT INTO menu_items (id, name, description, price, category_id, image, availability, preparation_time, ingredients, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [id, name, description, price, categoryId, image, availability || 'available', preparationTime || 0, JSON.stringify(ingredients || []), now, now]
    );

    const result = await query('SELECT * FROM menu_items WHERE id = $1', [id]);
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating menu item:', error);
    return NextResponse.json({ error: 'Failed to create menu item' }, { status: 500 });
  }
}
