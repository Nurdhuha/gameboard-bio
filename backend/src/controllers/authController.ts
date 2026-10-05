import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/database';
import { AuthRequest } from '../middlewares/authMiddleware';

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Nama, email, dan password wajib diisi.' });
      return;
    }

    const existingTeacher = await db('teachers').where({ email: email.toLowerCase() }).first();
    if (existingTeacher) {
      res.status(409).json({ success: false, message: 'Email sudah terdaftar. Silakan gunakan email lain.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const [teacher] = await db('teachers')
      .insert({
        name,
        email: email.toLowerCase(),
        password_hash: passwordHash,
      })
      .returning(['id', 'name', 'email', 'created_at']);

    const secret = process.env.JWT_SECRET || 'ecoplay-default-secret-key';
    const token = jwt.sign({ id: teacher.id, email: teacher.email, name: teacher.name }, secret, {
      expiresIn: '7d',
    });

    res.status(201).json({
      success: true,
      message: 'Registrasi akun pendidik berhasil.',
      token,
      teacher,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Gagal melakukan registrasi.' });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email dan password wajib diisi.' });
      return;
    }

    const teacher = await db('teachers').where({ email: email.toLowerCase() }).first();
    if (!teacher) {
      res.status(401).json({ success: false, message: 'Email atau password tidak sesuai.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, teacher.password_hash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Email atau password tidak sesuai.' });
      return;
    }

    const secret = process.env.JWT_SECRET || 'ecoplay-default-secret-key';
    const token = jwt.sign({ id: teacher.id, email: teacher.email, name: teacher.name }, secret, {
      expiresIn: '7d',
    });

    res.json({
      success: true,
      message: 'Login berhasil.',
      token,
      teacher: {
        id: teacher.id,
        name: teacher.name,
        email: teacher.email,
        created_at: teacher.created_at,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Gagal melakukan login.' });
  }
}

export async function getMe(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.teacher) {
      res.status(401).json({ success: false, message: 'Tidak terotentikasi.' });
      return;
    }

    const teacher = await db('teachers')
      .where({ id: req.teacher.id })
      .select(['id', 'name', 'email', 'created_at'])
      .first();

    if (!teacher) {
      res.status(404).json({ success: false, message: 'Data guru tidak ditemukan.' });
      return;
    }

    res.json({ success: true, teacher });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Gagal mengambil data profil.' });
  }
}
