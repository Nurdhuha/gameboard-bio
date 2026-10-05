import { Request, Response } from 'express';
import { createApp } from '../backend/src/app';

const app = createApp();

export default function handler(req: Request, res: Response) {
  const matchedPath = (req.headers['x-matched-path'] || req.headers['x-forwarded-uri']) as string | undefined;
  if (matchedPath && typeof matchedPath === 'string') {
    req.url = matchedPath;
  }

  return app(req, res, (err: any) => {
    if (err) {
      console.error('Vercel Serverless Express Error:', err);
      return res.status(500).json({
        success: false,
        message: err?.message || 'Terjadi kesalahan pada server API.',
      });
    }
    return res.status(404).json({
      success: false,
      message: `Rute ${req.method} ${req.url} tidak ditemukan.`,
    });
  });
}
