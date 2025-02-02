import { z } from "zod";
import { eq } from "drizzle-orm";
import { organizations } from "~/server/db/schema";
import { NextResponse } from "next/server";
import { db } from "~/server/db";

const organizationSchema = z.object({
  name: z.string()
});

export async function POST(req: Request) {
  try {
    const input = organizationSchema.parse(await req.json());
    const result = await db.insert(organizations).values(input).returning();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  try {
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const result = await db.select().from(organizations).where(eq(organizations.id, id));
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}