export default async function handler(req, res) {
  const result = {};
  try {
    result.hasDbUrl = Boolean(process.env.DATABASE_URL);
    result.nodeEnv = process.env.NODE_ENV;
    
    try {
      const pg = await import('pg');
      result.pgLoaded = true;
    } catch (e) {
      result.pgError = e.message;
    }

    try {
      const knex = await import('knex');
      result.knexLoaded = true;
      const k = knex.default({
        client: 'pg',
        connection: process.env.DATABASE_URL || 'postgres://localhost/postgres',
      });
      result.knexClientCreated = true;
      await k.raw('SELECT 1');
      result.knexConnected = true;
    } catch (e) {
      result.knexError = e.message;
    }

    res.status(200).json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, stack: err.stack });
  }
}
