import http from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';

// Create an HTTP server
const server = http.createServer();

// Create a new Socket.IO server, attach it to the HTTP server
export const io = new SocketIOServer(server, {
  cors: {
    origin: '*', // Adjust to your actual front-end domain in production
    methods: ['GET', 'POST'],
  },
});

// Start the server on port 8080 (or your preferred port)
server.listen(8080, () => {
  console.log('Socket.IO server running on port 8080');
});

// Listen for new connections
io.on('connection', (socket: Socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('open', () => {
    console.log('WebSocket connected successfully.');
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

/**
 * Broadcast a status update to all connected clients.
 * 
 * @param componentId A string representing the component/service ID
 * @param status A string representing the new status
 */
export function broadcastStatusUpdate(componentId: string, status: string) {
  io.emit('statusUpdate', { componentId, status });
}
