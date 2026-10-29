import mysql2, { Pool, PoolConnection, RowDataPacket, ResultSetHeader, OkPacket } from 'mysql2/promise';
import { config } from '../config/env';
import { logger } from '../config/logger';

/**
 * Creates a connection pool using config from env.
 * When NODE_ENV is 'test', uses TEST_DB_* variables.
 */
const isTest = config.NODE_ENV === 'test';

export const pool: Pool = mysql2.createPool({
  host: isTest ? (config.TEST_DB_HOST ?? config.DB_HOST) : config.DB_HOST,
  port: isTest ? config.TEST_DB_PORT : config.DB_PORT,
  user: isTest ? (config.TEST_DB_USER ?? config.DB_USER) : config.DB_USER,
  password: isTest ? (config.TEST_DB_PASSWORD ?? config.DB_PASSWORD) : config.DB_PASSWORD,
  database: isTest ? (config.TEST_DB_NAME ?? config.DB_NAME) : config.DB_NAME,
  connectionLimit: config.DB_CONNECTION_LIMIT,
  waitForConnections: true,
  queueLimit: 0,
  timezone: '+00:00',
  charset: 'utf8mb4',
});

pool.on('connection', () => {
  logger.debug('MySQL pool connection established');
});

/**
 * Execute a parameterized query and return typed rows.
 */
export async function query<T extends RowDataPacket>(
  sql: string,
  params?: unknown[],
): Promise<T[]> {
  const [rows] = await pool.execute<T[]>(sql, params as any);
  return rows;
}

/**
 * Execute a DML statement (INSERT / UPDATE / DELETE) and return result metadata.
 */
export async function execute(
  sql: string,
  params?: unknown[],
): Promise<ResultSetHeader> {
  const [result] = await pool.execute<ResultSetHeader>(sql, params as any);
  return result;
}

/**
 * Get a connection from the pool for transaction use.
 */
export async function getConnection(): Promise<PoolConnection> {
  return pool.getConnection();
}
