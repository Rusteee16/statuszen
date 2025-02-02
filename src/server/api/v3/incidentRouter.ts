import { z } from "zod";
import { eq, and, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { incidents, components } from "~/server/db/schema";

const incidentSchema = z.object({
  componentId: z.string().uuid(),
  title: z.string(),
  description: z.string().optional(),
  status: z.string()
});

export async function POST(req: Request) {
  try {
    const input = incidentSchema.parse(await req.json());
    const result = await db.insert(incidents).values(input);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const componentId = searchParams.get('componentId');
  const orgId = searchParams.get('orgId');

  try {
    if (componentId) {
      const result = await db.select().from(incidents).where(eq(incidents.componentId, componentId));
      return NextResponse.json(result);
    }

    if (orgId) {
      const componentsInOrg = await db.select({ id: components.id })
        .from(components)
        .where(eq(components.orgId, orgId));

      const componentIds = componentsInOrg.map(c => c.id);

      const result = await db.select().from(incidents).where(inArray(incidents.componentId, componentIds));
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'componentId or orgId must be provided' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
