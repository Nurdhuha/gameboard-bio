import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = process.env.VERCEL
  ? path.join('/tmp', 'uploads')
  : path.resolve(process.cwd(), 'uploads');

// Pastikan direktori uploads tersedia (gunakan /tmp di Vercel Serverless)
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch {
  // Abaikan error perizinan sistem berkas jika di lingkungan serverless
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const roomCode = req.params.roomCode || 'GENERAL';
    const timestamp = Date.now();
    const randomSuffix = Math.round(Math.random() * 1e4);
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `foto-${roomCode}-${timestamp}-${randomSuffix}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Maksimal 5 MB
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Format berkas tidak didukung. Harap unggah format JPG, PNG, atau WEBP.'));
    }
  },
});
