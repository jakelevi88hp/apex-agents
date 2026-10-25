import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { email, secret } = await request.json();

    // Security: require a secret key from env. No default: if it's unset, the endpoint is disabled.
    const ADMIN_UPGRADE_SECRET = process.env.ADMIN_UPGRADE_SECRET;
    if (!ADMIN_UPGRADE_SECRET) {
      return NextResponse.json({ error: 'Admin upgrade is disabled' }, { status: 403 });
    }

    if (typeof secret !== 'string' || secret !== ADMIN_UPGRADE_SECRET) {
      return NextResponse.json({ error: 'Invalid secret' }, { status: 403 });
    }

    // Update user to admin
    const result = await db.update(users)
      .set({
        role: 'admin',
        updatedAt: new Date(),
      })
      .where(eq(users.email, email))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `User ${email} upgraded to admin`,
      user: {
        id: result[0].id,
        email: result[0].email,
        name: result[0].name,
        role: result[0].role,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Admin upgrade error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

