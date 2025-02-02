// src/server/websockets/statusBroadcaster.ts
import WebSocket, { WebSocketServer } from 'ws';
import { eq } from 'drizzle-orm';
import { worker, addComponentToQueue } from './bullmq/componentQueue';
import { db } from './db';
import { components } from './db/schema';

// Create WebSocket Server
const wss = new WebSocketServer({ port: 8080 });

// Store connected clients
let clients: WebSocket[] = [];

wss.on('connection', (ws: WebSocket) => {
  console.log('Client connected');
  clients.push(ws);

  ws.on('close', () => {
    clients = clients.filter(client => client !== ws);
    console.log('Client disconnected');
  });
});

// Broadcast function
export const broadcastStatusUpdate = (componentId: string, status: string) => {
  const message = JSON.stringify({ componentId, status });
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};

// Retry logic for failed pings
const MAX_RETRIES = 3;

// Hook into BullMQ worker to broadcast status updates and update the database
worker.on('completed', async (job, result) => {
  if (result && result.status) {
    const { id, status } = result;

    // Update the status in the database
    await db.update(components)
      .set({ status })
      .where(eq(components.id, id));

    console.log(`Updated DB status for component ${id}: ${status}`);

    // Broadcast the status update to all connected clients
    broadcastStatusUpdate(id, status);
    console.log(`Broadcasted status for component ${id}: ${status}`);
  }
});

worker.on('failed', async (job, err) => {
    if (!job) return;
    const { id, url } = job.data;
    const retryCount = job.attemptsMade || 0;
  
    console.error(`Ping failed for component ${id}. Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
  
    if (retryCount < MAX_RETRIES) {
      console.log(`Retrying (${retryCount + 1}/${MAX_RETRIES}) for component ${id}`);
      await addComponentToQueue({ id, url });
    } else {
      console.log(`Max retries reached for component ${id}. Marking as MAJOR_OUTAGE.`);
  
      // Update the status to MAJOR_OUTAGE in the database
      await db.update(components)
        .set({ status: 'MAJOR_OUTAGE' })
        .where(eq(components.id, id));
  
      // Broadcast the status update to all connected clients
      broadcastStatusUpdate(id, 'MAJOR_OUTAGE');
    }
  });
