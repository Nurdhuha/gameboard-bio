import fs from 'fs';
import path from 'path';
import { db } from './database';

export async function runMigration() {
  console.log('🚀 Memulai migrasi skema database...');
  try {
    const schemaPath = path.resolve(__dirname, '../../schema.sql');
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`File schema.sql tidak ditemukan di ${schemaPath}`);
    }

    const sql = fs.readFileSync(schemaPath, 'utf8');
    await db.raw(sql);
    console.log('✅ Migrasi database berhasil dijalankan! Seluruh tabel Ecoplay telah dibuat.');
  } catch (err: any) {
    console.error('❌ Gagal menjalankan migrasi database:', err.message || err);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

if (require.main === module) {
  runMigration();
}
