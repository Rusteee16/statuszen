import { NextRequest, NextResponse } from 'next/server';
import { db } from '~/server/db';
import { users } from '~/server/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Fetch the user's organization ID
    const user = await db.select({ orgId: users.orgId }).from(users).where(eq(users.id, userId)).limit(1);

    if (!user.length) {
      return NextResponse.json({ error: 'User not found or does not belong to an organization' }, { status: 404 });
    }

    return NextResponse.json({ orgId: user[0]?.orgId });
  } catch (error) {
    console.error('Error fetching user organization:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
