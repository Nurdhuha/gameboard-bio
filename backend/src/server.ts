import http from 'http';
import dotenv from 'dotenv';
import { Server as SocketIOServer } from 'socket.io';
import { createApp } from './app';
import { registerGameSocketHandlers } from './sockets/gameSocketHandler';
import { testDatabaseConnection } from './config/database';

dotenv.config();

const PORT = Number(process.env.PORT) || 5000;
const app = createApp();
const httpServer = http.createServer(app);

// Inisialisasi WebSocket Socket.io Server
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH'],
  },
});

// Daftarkan seluruh event listener WebSocket permainan
registerGameSocketHandlers(io);

// Jalankan HTTP & WebSocket Server
httpServer.listen(PORT, async () => {
  console.log('====================================================');
  console.log(`🌿 ECOPLAY BACKEND SERVER AKTIF`);
  console.log(`🚀 Port Server      : http://localhost:${PORT}`);
  console.log(`📡 WebSocket Ready  : ws://localhost:${PORT}`);
  console.log(`🩺 Health Check     : http://localhost:${PORT}/api/health`);
  console.log('====================================================');

  // Uji koneksi ke database
  await testDatabaseConnection();
});
