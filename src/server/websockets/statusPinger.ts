import WebSocket, { WebSocketServer } from 'ws';
import { componentStatusQueue } from '../bullmq/queue';
import { QueueEvents } from 'bullmq';

const pingerServer = new WebSocketServer({ port: 8080 });

pingerServer.on('connection', (ws: WebSocket) => {
  console.log('Client connected to status pinger');

  ws.on('message', async (message) => {
    const { url } = JSON.parse(message.toString());

    const job = await componentStatusQueue.add('ping', { url });
    const queueEvents = new QueueEvents('ping');
    const result = await job.waitUntilFinished(queueEvents);

    ws.send(JSON.stringify({ message: `Pinging ${url}`, status: result.status }));
  });
});