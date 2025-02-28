import { PoolClient, Client } from "pg";
import { EventEmitter } from "events";
import { query } from "../db/dbNotifications";
import { CombinedLead } from "../db/db.models";
import { Logger } from "../shared/logger";
import { Server } from "socket.io";
import { SpitfireService } from "../spitfire/spitfire.service";

export const leadEventEmitter = new EventEmitter();
export const queueEventEmitter = new EventEmitter();

export interface LeadData {
  id?: string;
  lead_Id?: string;
  created_date: string;
  lastContact?: string;
  first_name: string;
  last_name: string;
  cell_phone?: string;
  phone_primary: string;
  property_state: string;
  property_type: string;
  first_mortgage_balance: number;
  veteran_status: boolean;
  leadStatus?: string;
}

export interface QueueData {
  lead_id: string;
  first_name: string;
  last_name: string;
  state: string;
  phone_number: string;
}

// 1) HELPER to log notifications to app.notify_log using the pool
async function logNotification(channel: string, payload?: string) {
  if (!payload) payload = ""; // handle undefined
  try {
    await global.pool!.query(
      `INSERT INTO app.notify_log (channel, payload) VALUES ($1, $2)`,
      [channel, payload]
    );
    Logger.info("Logged notification to app.notify_log", { channel, payload });
  } catch (err: any) {
    Logger.error("Failed to log notification", { error: err.message, channel });
  }
}

/* -------------------------------------
   POOL-BASED LISTENER (unchanged, but
   we add logNotification() inside)
------------------------------------- */
export async function setupLeadEvents(userId: string): Promise<void> {
  let client: PoolClient | undefined;
  console.info("setupLeadEvents called with userId:", userId);

  try {
    console.info("Attempting to connect to the database pool...");
    client = await global.pool?.connect();
    if (!client) throw new Error("Failed to connect to the database");

    Logger.info("Lead events setup initiated", { userId });
    console.info(
      "Connected to DB. Setting up LISTEN on combined_leads_change."
    );
    await client.query("LISTEN combined_leads_change");
    Logger.info("Listening to combined_leads_change channel", { userId });
    console.info(
      "Now listening for notifications on combined_leads_change (pool-based)."
    );

    // POOL-BASED notification
    client.on("notification", async (msg: any) => {
      Logger.info("Notification received", { userId, channel: msg.channel });
      console.info("DB Notification received on channel:", msg.channel);

      // 2) LOG every notify
      await logNotification(msg.channel, msg.payload);

      try {
        const payload = JSON.parse(msg.payload);
        Logger.info("Full payload received", { payload });
        console.info("Parsed notification payload:", payload);

        if (msg.channel === "combined_leads_change") {
          if (payload.operation === "INSERT") {
            const combinedLead: CombinedLead = mapToCombinedLead(
              payload.new_data
            );
            leadEventEmitter.emit("new_lead", combinedLead);
            Logger.info("New lead notification sent", {
              userId,
              leadId: payload.new_data.id,
            });
            console.info(
              "Emitted new_lead event for lead ID:",
              payload.new_data.id
            );
          } else if (payload.operation === "DELETE") {
            const reducedData: LeadData = mapToLeadData(payload.old_data);
            leadEventEmitter.emit("remove_lead", reducedData);
            Logger.info("Lead removed notification sent", {
              userId,
              leadId: payload.old_data.id,
            });
            console.info(
              "Emitted remove_lead event for lead ID:",
              payload.old_data.id
            );
          }
        }
      } catch (error: any) {
        Logger.error("Error processing notification", {
          error: error.message,
          userId,
          channel: msg.channel,
        });
        console.error(
          "Error processing notification:",
          error.message,
          "UserId:",
          userId,
          "Channel:",
          msg.channel
        );
      }
    });

    // EventEmitter handlers remain unchanged
    leadEventEmitter.on("new_lead", async (data: LeadData) => {
      console.info("Received 'new_lead' event with data:", data);
      try {
        const combinedLead: CombinedLead = mapToCombinedLead(data);
        console.info("Mapped new lead data to CombinedLead:", combinedLead.id);
      } catch (error: any) {
        Logger.error("Error creating new lead", {
          error: error.message,
          userId,
          leadData: data,
        });
        leadEventEmitter.emit("error", {
          message: "Failed to create new lead",
        });
      }
    });

    leadEventEmitter.on("update_lead", async (data: LeadData) => {
      console.info("Received 'update_lead' event with data:", data);
      try {
        await query(
          `UPDATE combined_leads
           SET created_date = $1, first_name = $2, last_name = $3,
               phone_primary = $4, property_state = $5, property_type = $6,
               first_mortgage_balance = $7, veteran_status = $8, leadStatus = $9
           WHERE id = $10`,
          [
            data.created_date,
            data.first_name,
            data.last_name,
            data.phone_primary,
            data.property_state,
            data.property_type,
            data.first_mortgage_balance,
            data.veteran_status,
            data.leadStatus,
            data.id,
          ]
        );
        Logger.info("Lead updated", { userId, leadData: data });
        console.info("Lead updated successfully in DB:", data);
      } catch (error: any) {
        Logger.error("Error updating lead", {
          error: error.message,
          userId,
          leadData: data,
        });
        console.error(
          "Error updating lead in DB:",
          error.message,
          "Data:",
          data
        );
        leadEventEmitter.emit("error", { message: "Failed to update lead" });
      }
    });

    leadEventEmitter.on("disconnect", async () => {
      console.info(
        "Socket disconnected. Cleaning up DB resources (pool-based)."
      );
      try {
        if (client) {
          await client.query("UNLISTEN *");
          client.release();
          Logger.info("Database client disconnected and unlistened", {
            userId,
          });
          console.info(
            "Unlistened DB notifications and released client for userId:",
            userId
          );
        }
      } catch (error: any) {
        Logger.error("Error during disconnection cleanup", {
          error: error.message,
          userId,
        });
        console.error(
          "Error during disconnection cleanup:",
          error.message,
          "UserId:",
          userId
        );
      }
    });
  } catch (error: any) {
    Logger.error("Error setting up lead events", {
      error: error.message,
      userId,
    });
    console.error(
      "Error setting up lead events:",
      error.message,
      "UserId:",
      userId
    );
    if (client) client.release();
  }
}

/* -------------------------------------
   DEDICATED CLIENT (Direct approach)
   We also log to app.notify_log
------------------------------------- */
let persistentClient: Client | undefined;

export async function setupPersistentLeadEvents(io?: Server): Promise<void> {
  if (persistentClient) {
    console.info(
      "Persistent lead client is already initialized. Skipping re-init."
    );
    return;
  }
  try {
    persistentClient = new Client({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: Number(process.env.DB_PORT || 5432),

      // ADD THIS SSL SECTION:
      ssl: {
        rejectUnauthorized: false,
      },
    });

    await persistentClient.connect();
    console.info(
      "Persistent client connected for combined_leads_change notifications."
    );

    await persistentClient.query("LISTEN combined_leads_change");
    console.info(
      "Now listening for notifications on combined_leads_change (dedicated client)."
    );

    // Direct client notification
    persistentClient.on("notification", async (msg) => {
      console.info("Persistent client -> notification:", msg.channel);

      // 2) LOG to app.notify_log
      await logNotification(msg.channel, msg.payload);

      if (!msg.payload) return; // no data

      try {
        const payload = JSON.parse(msg.payload);
        console.info("Parsed notification payload:", payload);

        if (msg.channel === "combined_leads_change") {
          if (payload.operation === "INSERT") {
            const combinedLead: CombinedLead = mapToCombinedLead(
              payload.new_data
            );

            // Emit events immediately
            leadEventEmitter.emit("new_lead", combinedLead);
            io?.of("/sharktank").emit("new_lead", payload.new_data);
            Logger.info("New lead notification (persistent) sent", {
              global_id: payload.new_data.global_id,
            });

            // Handle Spitfire export asynchronously
            setImmediate(async () => {
              try {
                Logger.info("Initiating Spitfire export for new lead", {
                  global_id: combinedLead.global_id,
                });
                await SpitfireService.getInstance().exportLeadToSpitfire(
                  combinedLead
                );
                Logger.info("Spitfire export completed successfully", {
                  global_id: combinedLead.global_id,
                });
              } catch (error: any) {
                Logger.error("Failed to export lead to Spitfire", {
                  error: error.message,
                  global_id: combinedLead.global_id,
                });
              }
            });
          } else if (payload.operation === "DELETE") {
            leadEventEmitter.emit("remove_lead", payload.old_data);
            Logger.info("Lead removed notification (persistent) sent", {
              global_id: payload.old_data.global_id,
            });
          }
        }
      } catch (err: any) {
        Logger.error("Error in persistent client notification handling", {
          error: err.message,
        });
        console.error("Error in persistent client notification:", err.message);
      }
    });

    // We intentionally do NOT release() here
    // This client remains connected as long as your app runs.
  } catch (error: any) {
    Logger.error("Error setting up persistent lead events", {
      error: error.message,
    });
    console.error("Error setting up persistent lead events:", error.message);

    if (persistentClient) {
      try {
        await persistentClient.end();
      } catch (err) {
        console.error(
          "Error closing persistent client after failure:",
          error.message
        );
      }
      persistentClient = undefined;
    }
  }
}

/* --------------------------
   QUEUE EVENTS (pool-based)
   Also log to notify_log
-------------------------- */
export async function setupQueueEvents(): Promise<void> {
  let client: PoolClient | undefined;
  console.info("setupQueueEvents called");

  try {
    console.info("Attempting to connect to the database pool...");
    client = await global.pool?.connect();
    if (!client) throw new Error("Failed to connect to the database");

    Logger.info("Queue events setup initiated");
    console.info("Connected to DB. Setting up LISTEN on queue_table_change.");
    await client.query("LISTEN queue_table_change");
    Logger.info("Listening to queue_table_change channel");
    console.info("Now listening for notifications on queue_table_change.");

    // POOL-BASED queue notification
    client.on("notification", async (msg: any) => {
      Logger.info("Notification received", { channel: msg.channel });
      console.info("DB Notification received on channel:", msg.channel);

      // 2) LOG to app.notify_log
      await logNotification(msg.channel, msg.payload);

      try {
        const payload = JSON.parse(msg.payload);
        Logger.info("Full payload received", { payload });
        console.info("Parsed notification payload:", payload);

        if (
          msg.channel === "queue_table_change" &&
          payload.operation === "INSERT"
        ) {
          console.info("INSERT operation detected for queue_table_change.");
          const queueData: QueueData = mapToQueueData(payload.new_data);
          queueEventEmitter.emit("queue_update", queueData);

          Logger.info("Queue update emitted", {
            leadId: queueData.lead_id,
            firstName: queueData.first_name,
            lastName: queueData.last_name,
            state: queueData.state,
            phone_number: queueData.phone_number,
          });
          console.info(
            "Emitted 'queue_update' event for lead_id:",
            queueData.lead_id
          );
        }
      } catch (error: any) {
        Logger.error("Error processing notification", {
          error: error.message,
          channel: msg.channel,
        });
        console.error(
          "Error processing notification:",
          error.message,
          "Channel:",
          msg.channel
        );
      }
    });

    queueEventEmitter.on("queue_update", async (data: QueueData) => {
      console.info("Received 'queue_update' event with data:", data);
      try {
        // Additional processing if needed
        console.info("Processed queue data with lead_id:", data.lead_id);
      } catch (error: any) {
        Logger.error("Error processing queue update", {
          error: error.message,
          queueData: data,
        });
        queueEventEmitter.emit("error", {
          message: "Failed to process queue update",
        });
      }
    });

    queueEventEmitter.on("disconnect", async () => {
      console.info(
        "Queue event emitter disconnected. Cleaning up DB resources."
      );
      try {
        if (client) {
          await client.query("UNLISTEN *");
          client.release();
          Logger.info(
            "Database client disconnected and unlistened for queue events"
          );
          console.info("Unlistened DB notifications and released client");
        }
      } catch (error: any) {
        Logger.error("Error during queue disconnection cleanup", {
          error: error.message,
        });
        console.error(
          "Error during queue disconnection cleanup:",
          error.message
        );
      }
    });
  } catch (error: any) {
    Logger.error("Error setting up queue events", {
      error: error.message,
    });
    console.error("Error setting up queue events:", error.message);
    if (client) client.release();
  }
}

// MAPPING HELPERS (unchanged)
function mapToCombinedLead(data: any): CombinedLead {
  return {
    id: data.id,
    global_id: data.global_id,
    lead_id: data.lead_id,
    first_name: data.first_name,
    middle_name: data.middle_name || "",
    last_name: data.last_name,
    suffix: data.suffix || "",
    email: data.email || "",
    dob: data.dob ? new Date(data.dob) : null,
    veteran: data.veteran_status || false,
    credit: data.credit || "",
    marital_status: data.marital_status || "",
    address: data.address || "",
    city: data.city || "",
    state: data.state || "",
    zip_code: data.zip_code || "",
    home_phone: data.phone_primary || "",
    cell_phone: data.cell_phone || "",
    property_use: "",
    property_type: data.property_type,
    loan_purpose: "",
    mortgage_balance: data.first_mortgage_balance,
    second_mortgage_balance: 0,
    desired_loan_amount: 0,
    estimated_value: 0,
    lead_source: "",
    created_at: new Date(data.created_date),
    updated_at: new Date(),
    exported: false,
    status: data.status || "",
  };
}

function mapToLeadData(data: any): LeadData {
  console.info("Mapping data to LeadData with data:", data);
  return {
    lead_Id: data.id,
    created_date: data.created_date,
    lastContact: data.lastContact || "",
    first_name: data.first_name,
    last_name: data.last_name,
    phone_primary: data.phone_primary,
    property_state: data.property_state,
    property_type: data.property_type,
    first_mortgage_balance: data.first_mortgage_balance,
    veteran_status: data.veteran_status,
    leadStatus: data.leadStatus || "",
  };
}

function mapToQueueData(data: any): QueueData {
  console.info("Mapping data to QueueData with data:", data);
  return {
    lead_id: data.lead_id,
    first_name: data.first_name,
    last_name: data.last_name,
    phone_number: data.phone_number,
    state: data.state,
  };
}
