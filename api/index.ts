import 'pg';
import { Request, Response } from 'express';
import { createApp } from '../backend/src/app';

let cachedApp: any = null;
let initError: any = null;

function getApp() {
  if (!cachedApp && !initError) {
    try {
      cachedApp = createApp();
    } catch (err: any) {
      initError = err;
      console.error('Failed to initialize Express app in Vercel:', err);
    }
  }
  return { app: cachedApp, error: initError };
}

export default function handler(req: Request, res: Response) {
  const { app, error } = getApp();

  if (error) {
    return res.status(500).json({
      success: false,
      error: 'SERVERLESS_INIT_ERROR',
      message: error?.message || 'Gagal menginisialisasi server API.',
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
    });
  }

  // Rekonstruksi URL dari query parameter __path jika di-rewrite oleh vercel.json
  const query = (req as any).query;
  if (query && query.__path) {
    req.url = '/api/' + query.__path;
  } else if (req.headers['x-matched-path'] && typeof req.headers['x-matched-path'] === 'string') {
    req.url = req.headers['x-matched-path'];
  }

  return app(req, res, (err: any) => {
    if (err) {
      console.error('Vercel Express Unhandled Error:', err);
      return res.status(500).json({
        success: false,
        message: err?.message || 'Terjadi kesalahan pada server API.',
      });
    }
    return res.status(404).json({
      success: false,
      message: `Rute ${req.method} ${req.url} tidak ditemukan di server.`,
    });
  });
}
