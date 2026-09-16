import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { Pool } from '@neondatabase/serverless';

const file = process.argv[2];
if (!file) throw new Error('Usage: node scripts/run-sql.mjs <sql-file>');

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!connectionString) throw new Error('DATABASE_URL or POSTGRES_URL is required.');

const sql = await readFile(resolve(file), 'utf8');
const pool = new Pool({ connectionString });

try {
  await pool.query(sql);
  console.log(`Applied ${file}`);
} finally {
  await pool.end();
}
