// user.database.ts
import { Logger } from "../shared/logger";

export async function query(text: string, params?: any[]): Promise<any> {
  // Ensure userManagementPool is defined
  if (!global.userManagementPool) {
    throw new Error("userManagementPool is not initialized. Check your app.ts setup.");
  }

  const start = Date.now();
  try {
    const res = await global.userManagementPool.query(text, params);
    const duration = Date.now() - start;
    Logger.info(`Executed query in ${duration}ms`);
    return res;
  } catch (err) {
    if (err instanceof Error) {
      Logger.error(`Error executing query: ${err.message}`);
    } else {
      Logger.error("Unknown error occurred during query execution");
    }
    throw err;
  }
}
