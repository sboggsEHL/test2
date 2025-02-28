import { Pool, QueryResult, QueryResultRow } from "pg";
import { Logger } from "../shared/logger";

interface DatabaseError extends Error {
  message: string;
  stack?: string;
}

// Declare global pool type
declare global {
  var pool: Pool | undefined;
}

// Function to handle database queries with error handling
export async function query<T extends QueryResultRow>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const start = Date.now();
  try {
    if (!global.pool) {
      throw new Error("Database connection pool is not initialized");
    }
    const res = await global.pool.query<T>(text, params); // Use global pool
    const duration = Date.now() - start;
    Logger.log("db", `Executed query in ${duration}ms`);
    return res;
  } catch (err) {
    const error = err as DatabaseError;
    Logger.error("Error executing query", {
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

// Listen for PostgreSQL notifications using the shared connection pool
export async function listenForNotifications(
  onNotification: (channel: string, payload: any) => void
): Promise<void> {
  if (!global.pool) {
    throw new Error("Database connection pool is not initialized");
  }

  const client = await global.pool.connect();
  try {
    await client.query("LISTEN new_lead");
    await client.query("LISTEN remove_lead");

    client.on("notification", (msg: any) => {
      onNotification(msg.channel, JSON.parse(msg.payload));
    });
  } catch (error: any) {
    Logger.error("Error setting up notification listeners", {
      error: error.message,
      stack: error.stack,
    });
  } finally {
    Logger.info("Notification listener set up successfully");
  }
}

// Graceful shutdown function to close pool
export async function closePool(): Promise<void> {
  if (global.pool) {
    await global.pool.end();
    Logger.info("Database connection pool closed");
  }
}

export {};
