import { pool } from '../../config/database';
import { logger } from '../../utils/logger';
import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../../.env') });

/**
 * Database Migration Runner
 * Executes the schema.sql file to set up the database
 */

async function runMigrations() {
  try {
    logger.info('Starting database migrations...');

    // Read the schema file
    const schemaPath = path.join(__dirname, '..', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Execute the schema
    await pool.query(schema);

    logger.info('Database migrations completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
