// src/app/api/groups/route.ts

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '~/server/db';
import { groups } from '~/server/db/schema';

const groupSchema = z.object({
  orgId: z.string().uuid(),
  name: z.string(),
  description: z.string().optional()
});

export async function POST(req: Request) {
  try {
    const input = groupSchema.parse(await req.json());
    const result = await db.insert(groups).values(input).returning();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orgId = searchParams.get('orgId');

  try {
    if (!orgId) {
      return NextResponse.json({ error: 'orgId is required' }, { status: 400 });
    }

    const result = await db.select().from(groups).where(eq(groups.orgId, orgId));
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { groupId } = await req.json();
    const groupIdSchema = z.string().uuid();
    groupIdSchema.parse(groupId);

    const result = await db.delete(groups).where(eq(groups.id, groupId)).returning();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
