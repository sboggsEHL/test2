import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { leadEventEmitter, queueEventEmitter } from "../lead/leadEvents";
import { Logger } from "../shared/logger";
import { listenForNotifications } from "../db/dbNotifications";
import { Pool } from "pg"; // Ensure you have the Pool imported for database operations

export async function initializeWebSockets(io: Server): Promise<void> {
  try {
    // Ensure the global pool is defined before proceeding
    if (!global.pool) {
      throw new Error("Database connection pool is not initialized");
    }

    const sharktankNamespace = io.of("/sharktank");
    setupSharktankNamespace(sharktankNamespace);

    const userStatusNamespace = io.of("/userstatus");
    setupUserStatusNamespace(userStatusNamespace);

    // Listen for lead events and emit them to WebSocket clients
    leadEventEmitter.on("new_lead", (lead) => {
      sharktankNamespace.emit("new_lead", lead);
    });

    leadEventEmitter.on("remove_lead", (lead) => {
      sharktankNamespace.emit("remove_lead", lead);
    });

    queueEventEmitter.on("queue_update", (lead) => {
      sharktankNamespace.emit("queue_update", lead);
    });

    // Start listening for notifications
    listenForNotifications((channel: string, payload: any) => {
      if (channel === "new_lead") {
        sharktankNamespace.emit("new_lead", payload);
      } else if (channel === "remove_lead") {
        sharktankNamespace.emit("remove_lead", payload);
      }
    }).catch((error: unknown) => {
      if (error instanceof Error) {
        Logger.error("Error in listenForNotifications", {
          error: error.message,
          stack: error.stack,
        });
      }
    });

    Logger.info("WebSocket server initialized successfully");
  } catch (error: unknown) {
    if (error instanceof Error) {
      Logger.error("Failed to initialize WebSocket server", {
        error: error.message,
        stack: error.stack,
      });
    }
    throw error;
  }
}

// Abstracted function to set up SharkTank namespace
function setupSharktankNamespace(namespace: ReturnType<Server["of"]>) {
  namespace.on("connection", (socket: Socket) => {
    Logger.info("New client connected", { socketId: socket.id });
    const isDev = process.env.NODE_ENV === "development";
    const userId: any = "test_dev"; // Replace with your authentication logic
    if (userId) {
      Logger.info(`User authenticated: ${userId}`, { socketId: socket.id });
    } else if (!isDev) {
      Logger.info("Authentication failed, disconnecting", {
        socketId: socket.id,
      });
      socket.disconnect(true);
    }

    socket.on("disconnect", () => {
      Logger.info("Client disconnected", { socketId: socket.id });
    });

    socket.on("error", (error: Error) => {
      Logger.error("Socket error:", {
        error: error.message,
        stack: error.stack,
      });
    });
  });
}

// Abstracted function to set up User Status namespace
function setupUserStatusNamespace(namespace: ReturnType<Server["of"]>) {
  interface UserStatusUpdateData {
    user_id: string;
    elecrm_client: boolean;
    signalwire_conf: boolean;
    active_call: boolean;
    user_status_input: string | null;
  }

  namespace.on("connection", (socket: Socket) => {
    Logger.info("User status client connected", { socketId: socket.id });

    socket.on("update_user_status", async (data: UserStatusUpdateData) => {
      const {
        user_id,
        elecrm_client,
        signalwire_conf,
        active_call,
        user_status_input,
      } = data;

      let masterStatus = determineUserMasterStatus({
        elecrm_client,
        signalwire_conf,
        active_call,
        user_status_input
      });

      try {
        if (!global.pool) throw new Error("Database connection pool is not initialized");

        // Update database
        await global.pool.query(
          `INSERT INTO user_status 
           (user_id, elecrm_client, signalwire_conf, active_call, user_status_input, master_status, last_updated)
           VALUES ($1, $2, $3, $4, $5, $6, NOW())
           ON CONFLICT (user_id)
           DO UPDATE SET 
             elecrm_client = $2, 
             signalwire_conf = $3, 
             active_call = $4, 
             user_status_input = $5, 
             master_status = $6, 
             last_updated = NOW()`,
          [user_id, elecrm_client, signalwire_conf, active_call, user_status_input, masterStatus]
        );

        // Broadcast status update to all connected clients
        namespace.emit("user_status_updated", { user_id, masterStatus });
        
        Logger.info(`User status updated: ${user_id}`, { masterStatus });
      } catch (error: unknown) {
        if (error instanceof Error) {
          Logger.error("Error updating user status:", { error: error.message });
        }
      }
    });

    socket.on("disconnect", async () => {
      try {
        // Get user_id from socket session or connection data
        const user_id = socket.data.user_id;
        if (user_id) {
          // Update user status to offline in database
          await global.pool?.query(
            `UPDATE user_status 
             SET elecrm_client = false, master_status = 'offline', last_updated = NOW()
             WHERE user_id = $1`,
            [user_id]
          );
          
          // Broadcast offline status
          namespace.emit("user_status_updated", { 
            user_id, 
            masterStatus: 'offline' 
          });
        }
      } catch (error) {
        if (error instanceof Error) {
          Logger.error("Error handling disconnect:", { error: error.message });
        }
      }
      
      Logger.info("User status client disconnected", { socketId: socket.id });
    });
  });
}

// Helper function to determine master status
function determineUserMasterStatus({
  elecrm_client,
  signalwire_conf,
  active_call,
  user_status_input
}: {
  elecrm_client: boolean;
  signalwire_conf: boolean;
  active_call: boolean;
  user_status_input: string | null;
}): string {
  if (!elecrm_client) return "offline";
  if (active_call || signalwire_conf) return "busy";
  if (user_status_input) return user_status_input;
  return "available";
}

export default initializeWebSockets;
