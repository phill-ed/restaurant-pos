import { NextRequest, NextResponse } from 'next/server';
import db, { generateId } from '@/lib/db';

// GET all staff members
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const role = searchParams.get('role');
    const activeOnly = searchParams.get('activeOnly');

    let query = 'SELECT * FROM users WHERE 1=1';
    const params: (string)[] = [];

    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }

    if (activeOnly === 'true') {
      query += ' AND active = 1';
    }

    query += ' ORDER BY name ASC';

    const users = db.prepare(query).all(...params);
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching staff:', error);
    return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 });
  }
}

// POST new staff member
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, role, pin, avatar } = body;

    const id = generateId();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO users (id, name, email, role, pin, avatar, active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)
    `).run(id, name, email, role, pin, avatar || null, now, now);

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    return NextResponse.json(user, { status: 201 });
  } catch (error: any) {
    if (error.message?.includes('UNIQUE constraint failed')) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }
    console.error('Error creating staff member:', error);
    return NextResponse.json({ error: 'Failed to create staff member' }, { status: 500 });
  }
}

// PUT update staff member
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, email, role, pin, avatar, active } = body;
    const now = new Date().toISOString();

    db.prepare(`
      UPDATE users 
      SET name = ?, email = ?, role = ?, pin = ?, avatar = ?, active = ?, updated_at = ?
      WHERE id = ?
    `).run(name, email, role, pin, avatar || null, active ? 1 : 0, now, id);

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!user) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating staff member:', error);
    return NextResponse.json({ error: 'Failed to update staff member' }, { status: 500 });
  }
}

// DELETE staff member
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Staff ID required' }, { status: 400 });
    }

    db.prepare('DELETE FROM users WHERE id = ?').run(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting staff member:', error);
    return NextResponse.json({ error: 'Failed to delete staff member' }, { status: 500 });
  }
}
