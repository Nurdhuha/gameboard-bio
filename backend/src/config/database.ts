import 'pg';
import knex, { Knex } from 'knex';
import dotenv from 'dotenv';

import path from 'path';

dotenv.config();
if (!process.env.DATABASE_URL) {
  dotenv.config({ path: path.resolve(__dirname, '../../.env') });
}

const connectionString = process.env.DATABASE_URL;

// Konfigurasi koneksi Knex ke PostgreSQL (Supabase)
const knexConfig: Knex.Config = {
  client: 'pg',
  connection: connectionString
    ? {
        connectionString,
        ssl:
          process.env.DB_SSL === 'false' || connectionString.includes('sslmode=disable')
            ? false
            : process.env.NODE_ENV === 'production' ||
              connectionString.includes('supabase') ||
              connectionString.includes('pooler') ||
              connectionString.includes('neon.tech') ||
              connectionString.includes('render.com') ||
              connectionString.includes('sslmode=require') ||
              (!connectionString.includes('localhost') && !connectionString.includes('127.0.0.1'))
            ? { rejectUnauthorized: false }
            : false,
      }
    : {
        host: process.env.DB_HOST || '127.0.0.1',
        port: Number(process.env.DB_PORT) || 5432,
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'ecoplay',
      },
  pool: {
    min: 0,
    max: process.env.VERCEL ? 3 : 10,
    idleTimeoutMillis: 30000,
  },
};

export const db = knex(knexConfig);

export async function testDatabaseConnection(): Promise<boolean> {
  try {
    await db.raw('SELECT 1');
    console.log('✅ Koneksi database berhasil terhubung.');
    return true;
  } catch (error: any) {
    console.warn('⚠️  Peringatan database: Belum dapat terhubung ke database. Detail error:', error?.message || error);
    console.warn('👉 Pastikan DATABASE_URL di file .env sudah sesuai dengan kredensial Supabase Anda.');
    return false;
  }
}
