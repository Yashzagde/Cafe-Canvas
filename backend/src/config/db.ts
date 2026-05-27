import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../../../drizzle/schema.js';
import dotenv from 'dotenv';

// Load environmental variables
dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set in environmental variables');
}

// Disable prefetch as it is not supported for Transaction pool mode
const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });
