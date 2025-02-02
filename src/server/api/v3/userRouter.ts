// src/app/api/users/route.ts

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '~/server/db';
import { users } from '~/server/db/schema';

const userSchema = z.object({
  orgId: z.string().uuid(),
  fname: z.string().min(1, "First name is required"),
  lname: z.string().min(1, "Last name is required"),
  email: z.string().email("A valid email is required"),
  clerkId: z.string().min(1, "Clerk id is required"),
  role: z.string().min(1, "Role is required")
});

export async function POST(req: Request) {
  try {
    const input = userSchema.parse(await req.json());
    const newUser = await db.insert(users).values(input).returning();
    return NextResponse.json(newUser);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orgId = searchParams.get('orgId');
  const userId = searchParams.get('userId');

  try {
    if (orgId) {
      const usersList = await db.select().from(users).where(eq(users.orgId, orgId));
      return NextResponse.json(usersList);
    }

    if (userId) {
      const userRecord = await db.select().from(users).where(eq(users.id, userId));
      return NextResponse.json(userRecord);
    }

    return NextResponse.json({ error: 'orgId or userId must be provided' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { userId, role, fname, lname, email, clerkId } = await req.json();

    if (role) {
      const roleSchema = z.string().min(1, "Role is required");
      roleSchema.parse(role);

      const updatedUser = await db.update(users).set({ role }).where(eq(users.id, userId)).returning();
      return NextResponse.json(updatedUser);
    }

    const updateSchema = z.object({
      userId: z.string().uuid(),
      fname: z.string().optional(),
      lname: z.string().optional(),
      email: z.string().email("Must be a valid email").optional(),
      clerkId: z.string().optional()
    });

    updateSchema.parse({ userId, fname, lname, email, clerkId });

    const updateData = { fname, lname, email, clerkId };

    const updatedUser = await db.update(users).set(updateData).where(eq(users.id, userId)).returning();
    return NextResponse.json(updatedUser);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { userId } = await req.json();
    const userIdSchema = z.string().uuid();
    userIdSchema.parse(userId);

    const deletedUser = await db.delete(users).where(eq(users.id, userId)).returning();
    return NextResponse.json(deletedUser);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
