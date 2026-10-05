import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/authRoutes';
import sessionRoutes from './routes/sessionRoutes';
import { errorHandler } from './middlewares/errorHandler';

export function createApp(): Application {
  const app = express();

  const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
  ];

  app.use(
    cors({
      origin: (origin, callback) => {
        // Izinkan request tanpa origin (seperti mobile apps, curl, postman) atau domain yang cocok
        if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
          callback(null, true);
        } else {
          callback(null, true); // Toleran untuk mode dev
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    })
  );

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Sajikan berkas statis foto observasi yang diunggah
  const uploadDir = path.resolve(__dirname, '../uploads');
  app.use('/uploads', express.static(uploadDir));

  // Endpoint Cek Kesehatan (Healthcheck - untuk Render Always-Awake & Uptime Robot)
  app.get('/api/health', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'ok',
      service: 'Ecoplay Backend API',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  // Daftarkan Rute REST API
  app.use('/api/auth', authRoutes);
  app.use('/api/sessions', sessionRoutes);

  // Penanganan Error Terpusat
  app.use(errorHandler);

  return app;
}
