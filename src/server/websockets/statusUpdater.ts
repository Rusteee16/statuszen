import WebSocket, { WebSocketServer } from 'ws';

const updaterServer = new WebSocketServer({ port: 8081 });

let clients: WebSocket[] = [];

updaterServer.on('connection', (ws: WebSocket) => {
  console.log('Client connected to status updater');
  clients.push(ws);

  ws.on('close', () => {
    clients = clients.filter(client => client !== ws);
  });
});

export const broadcastStatusUpdate = (componentId: string, status: string) => {
  const update = JSON.stringify({ componentId, status });
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(update);
    }
  });
};