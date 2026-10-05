import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  teacher?: {
    id: string;
    email: string;
    name: string;
  };
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Akses ditolak: Token autentikasi tidak ditemukan.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const secret = process.env.JWT_SECRET || 'ecoplay-default-secret-key';

  try {
    const decoded = jwt.verify(token, secret) as { id: string; email: string; name: string };
    req.teacher = decoded;
    next();
  } catch (error) {
    res.status(403).json({ success: false, message: 'Akses ditolak: Token tidak valid atau telah kedaluwarsa.' });
  }
}
