import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { publicComponents } from "~/server/db/schema";

export async function GET() {
  try {
    const result = await db.select().from(publicComponents);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
