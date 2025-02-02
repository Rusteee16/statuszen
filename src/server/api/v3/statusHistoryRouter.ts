import { z } from "zod";
import { eq } from "drizzle-orm";
import { statusHistory } from "~/server/db/schema";
import { NextResponse } from "next/server";
import { db } from "~/server/db";

const statusHistorySchema = z.object({
  componentId: z.string().uuid(),
  status: z.string(),
  notes: z.string().optional()
});

export async function POST(req: Request) {
  try {
    const input = statusHistorySchema.parse(await req.json());
    const result = await db.insert(statusHistory).values(input).returning();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const componentId = searchParams.get('componentId');

  try {
    if (!componentId) {
      return NextResponse.json({ error: 'componentId is required' }, { status: 400 });
    }

    const result = await db.select().from(statusHistory).where(eq(statusHistory.componentId, componentId));
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
