// src/app/api/components/route.ts

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { addComponentToQueue, componentQueue } from '~/server/bullmq/componentQueue';
import { db } from '~/server/db';
import { components } from '~/server/db/schema';

const componentSchema = z.object({
  groupId: z.string().uuid(),
  orgId: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  url: z.string().url(),
  status: z.enum(["OPERATIONAL", "PERFORMANCE_ISSUES", "PARTIAL_OUTAGE", "MAJOR_OUTAGE", "UNKNOWN"])
});

export async function POST(req: Request) {
  try {
    const input = componentSchema.parse(await req.json());
    const newComponent = await db.insert(components).values(input).returning();

    if (newComponent[0]) {
      await addComponentToQueue({ id: newComponent[0].id, url: input.url });
    }

    return NextResponse.json(newComponent);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const groupId = searchParams.get('groupId');
  const orgId = searchParams.get('orgId');

  try {
    if (groupId) {
      const data = await db.select().from(components).where(eq(components.groupId, groupId));
      return NextResponse.json(data);
    } 
    
    if (orgId) {
      const data = await db.select().from(components).where(eq(components.orgId, orgId));
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: 'groupId or orgId must be provided' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { componentId, status } = await req.json();
    const statusSchema = z.enum(["OPERATIONAL", "PERFORMANCE_ISSUES", "PARTIAL_OUTAGE", "MAJOR_OUTAGE", "UNKNOWN"]);
    statusSchema.parse(status);

    const updatedComponent = await db.update(components)
      .set({ status })
      .where(eq(components.id, componentId));

    return NextResponse.json(updatedComponent);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { componentId } = await req.json();

    const jobs = await componentQueue.getJobs(['waiting', 'active', 'delayed']);
    const jobToRemove = jobs.find(job => job.data.id === componentId);

    if (jobToRemove) {
      await jobToRemove.remove();
      console.log(`Removed component ${componentId} from the queue.`);
    }

    const deletedComponent = await db.delete(components)
      .where(eq(components.id, componentId));

    return NextResponse.json(deletedComponent);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
