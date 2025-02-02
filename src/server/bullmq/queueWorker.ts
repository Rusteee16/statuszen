import { eq } from 'drizzle-orm';

import { worker, addComponentToQueue, componentQueue } from './componentQueue';
import { broadcastStatusUpdate } from '../websocket'; // Adjust path as needed
import { db } from '../db';
import { components, publicComponents } from '../db/schema';

const MAX_RETRIES = 3;

// Listen for completed jobs to update database and broadcast
worker.on('completed', async (job, result) => {
  if (!result || !result.status) return;

  const { id, status } = result;

  // 1. Update database
  await db
    .update(components)
    .set({ status })
    .where(eq(components.id, id));

  console.log(`Updated DB status for component ${id}: ${status}`);

  // 2. Broadcast to connected clients
  broadcastStatusUpdate(id, status);
  console.log(`Broadcasted status for component ${id}: ${status}`);
});

// Listen for failed jobs for retries
worker.on('failed', async (job, err) => {
  if (!job) return;
  const { id, url } = job.data;
  const retryCount = job.attemptsMade || 0;

  console.error(`Ping failed for component ${id}. Error: ${
    err instanceof Error ? err.message : 'Unknown error'
  }`);

  if (retryCount < MAX_RETRIES) {
    console.log(`Retrying (${retryCount + 1}/${MAX_RETRIES}) for component ${id}`);
    await addComponentToQueue({ id, url });
  } else {
    console.log(`Max retries reached for component ${id}. Marking as MAJOR_OUTAGE.`);

    // Update DB
    await db
      .update(components)
      .set({ status: 'MAJOR_OUTAGE' })
      .where(eq(components.id, id));

    // Broadcast final outage status
    broadcastStatusUpdate(id, 'MAJOR_OUTAGE');
  }
});

// On startup, optionally initialize the queue
(async () => {
  const jobCounts = await componentQueue.getJobCounts();
  // If there are no waiting/active jobs, push all public components into the queue
  if (jobCounts.waiting === 0 && jobCounts.active === 0) {
    console.log('Initializing BullMQ Queue with publicComponents...');

    const publicComponentList = await db.select().from(publicComponents);

    for (const publicComp of publicComponentList) {
      const [componentRecord] = await db
        .select()
        .from(components)
        .where(eq(components.id, publicComp.componentId));

      if (!componentRecord) continue;

      if (componentRecord.url) {
        await addComponentToQueue({ id: componentRecord.id, url: componentRecord.url });
        console.log(`Added component ${componentRecord.id} to the queue.`);
      } else {
        console.error(
          `Component ${componentRecord.id} has a null URL and was not added to the queue.`
        );
      }
    }
  }
})();
