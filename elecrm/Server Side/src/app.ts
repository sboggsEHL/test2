import { Request, Response } from "express";
import path from "path";

require("dotenv").config({ path: path.resolve(__dirname, ".env") });

import express from "express";
import http from "http";
import helmet from "helmet";
import bodyParser from "body-parser";
import cors from "cors";
import fs from "fs";
import { Server } from "socket.io";
import { Pool } from "pg";
import { verifyToken } from "./middlewares/jwt.js";
import { UserModule } from "./user-management/user.module";
import { SignalWireModule } from "./signalwire/signalwire.module";
import { SMSModule } from "./signalwire/sms/sms.module";
import { corsMiddleware } from "./middlewares/corsMiddleware";
import { initializeWebSockets } from "./websockets";

import { EncompassModule } from "./encompass/encompass.module"; // Import the encompass module
import { listenForNotifications } from "./db/dbNotifications";
import { setupLeadEvents, setupQueueEvents } from "./lead/leadEvents";
import { setupPersistentLeadEvents } from "./lead/leadEvents"; // <--- already imported
import { Logger } from "./shared/logger";
import { UserStatusModule } from "./user-status/user-status.module";
import { startSlackBot } from "./slack/slackbot";
import { SlackModule } from "./slack/slack.module";
import { UserService } from "./user-management/user.service";
import { DidService } from "./signalwire/did/did.service";

// Set DEBUG environment variable to filter socket.io logs
process.env.DEBUG = "yourAppNamespace:*,-socket.io:*,-engine.io:*";

Logger.info("Starting application...");

const app = express();
Logger.info("Express app created");

// === Initialize PostgreSQL Pool with SSL for DigitalOcean ===
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_POOL_PORT ? parseInt(process.env.DB_POOL_PORT) : 5432,
  ssl: {
    rejectUnauthorized: false, // Accept self-signed certificates (for testing)
  },
});

global.userManagementPool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: "user_management", // <== the second DB
  password: process.env.DB_PASSWORD,
  port: process.env.DB_POOL_PORT
    ? parseInt(process.env.DB_POOL_PORT, 10)
    : 5432,
  ssl: {
    rejectUnauthorized: false,
  },
});

global.signalWirePool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: "signalwire", // <== the third DB
  password: process.env.DB_PASSWORD,
  port: process.env.DB_POOL_PORT
    ? parseInt(process.env.DB_POOL_PORT, 10)
    : 5432,
  ssl: {
    rejectUnauthorized: false,
  },
});

global.pool = pool;

// Handle unexpected errors on idle clients
pool.on("error", (err: { message: any }, client: any) => {
  Logger.error("Unexpected error on idle PostgreSQL client", {
    error: err.message,
  });
  process.exit(-1);
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Create a namespace for SignalWire
const signalWireNamespace = io.of("/signalwire");

// Handle connections to the SignalWire namespace
signalWireNamespace.on("connection", (socket) => {
  Logger.info("A user connected to SignalWire namespace:", socket.id);

  socket.on("disconnect", (reason) => {
    Logger.info(
      "User disconnected from SignalWire namespace:",
      socket.id,
      "Reason:",
      reason
    );
  });
});

const sharktankNamespace = io.of("/sharktank");
sharktankNamespace.on("connection", (socket) => {
  Logger.info("A user connected to SharkTank namespace:", socket.id);

  socket.on("disconnect", (reason) => {
    Logger.info(
      "User disconnected from SharkTank namespace:",
      socket.id,
      "Reason:",
      reason
    );
  });
});

// === Updated Logging for Server Address ===
server.on("listening", () => {
  const address = server.address();
  if (address && typeof address === "object") {
    Logger.info(
      "Server listening:",
      `http://${address.address}:${address.port}`
    );
  }
});

Logger.info("Express app and Socket.IO server created");

// Apply middlewares before defining routes
app.use(corsMiddleware);
app.use(helmet());
app.use(express.json());

// Add URL-encoded body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Make the pool available to your routes via app.locals
app.locals.pool = pool;

// Create shared services
const didService = new DidService();
const userService = new UserService(didService);

// === Existing Routes ===

// Import and use the SignalWire module
const userModule = new UserModule(userService);
app.use("/api/user", userModule.router);

const userStatusModule = new UserStatusModule();
app.use("/api/user-status", userStatusModule.router);

const signalWireModule = new SignalWireModule(signalWireNamespace, userService);
app.use("/api/signalwire", signalWireModule.router);

// Import and use the Encompass module
const encompassModule = new EncompassModule();
app.use("/api/encompass", encompassModule.router);

console.log("Encompass routes loaded at /api/encompass");

const smsModule = new SMSModule();
app.use("/api/signalwire/sms", smsModule.router);

app.get(
  "/api/sharktankleads",
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const result = await app.locals.pool.query(
        `
        SELECT 
          *,
          created_at AT TIME ZONE 'GMT' AT TIME ZONE 'America/Phoenix' AS created_phx
        FROM app.combined_leads
        WHERE status = 'new' AND assigned_to IS NULL
        ORDER BY created_at DESC
        `
      );
      res.json(result.rows);
    } catch (err: any) {
      Logger.error("Error querying database:", {
        message: err.message,
        stack: err.stack,
      });
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// GET /api/pipelineleads
app.get(
  "/api/pipelineleads",
  verifyToken,
  async (req: Request, res: Response) => {
    Logger.info("Querying pipeline leads", { query: req.query });
    const { username } = req.query;

    if (!username) {
      return res
        .status(400)
        .json({ error: "Username query parameter is required" });
    }

    try {
      const result = await app.locals.pool.query(
        "SELECT * FROM app.combined_leads WHERE assigned_to = $1 ORDER BY created_at ASC",
        [username]
      );

      // Map the result.rows to your desired format
      const pipelineLeads = result.rows.map((row: any) => ({
        id: row.id,
        global_id: row.global_id,
        lead_id: row.lead_id,
        tu_pk: row.tu_pk,
        first_name: row.first_name,
        middle_name: row.middle_name,
        last_name: row.last_name,
        suffix: row.suffix,
        email: row.email,
        dob: row.dob,
        veteran: row.veteran,
        credit: row.credit,
        marital_status: row.marital_status,
        first_name_b2: row.first_name_b2,
        last_name_b2: row.last_name_b2,
        address: row.address,
        city: row.city,
        state: row.state,
        zip_code: row.zip_code,
        home_phone: row.home_phone,
        cell_phone: row.cell_phone,
        property_use: row.property_use,
        property_type: row.property_type,
        loan_purpose: row.loan_purpose,
        mortgage_balance: row.mortgage_balance,
        second_mortgage_balance: row.second_mortgage_balance,
        desired_loan_amount: row.desired_loan_amount,
        estimated_value: row.estimated_value,
        lead_source: row.lead_source,
        ulid: row.ulid,
        status: row.status,
        assigned_to: row.assigned_to,
        assigned_at: row.assigned_at,
        updated_at: row.updated_at,
        created_at: row.created_at,
        exported: row.exported,
      }));

      Logger.info("Pipeline leads queried", { result: pipelineLeads });
      res.json(pipelineLeads);
    } catch (err: any) {
      Logger.error("Error querying database:", {
        message: err.message,
        stack: err.stack,
      });
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// POST /api/assignlead
app.post(
  "/api/assignlead",
  verifyToken,
  async (req: Request, res: Response) => {
    const { leadId, username } = req.body;

    Logger.info("Received assign lead request", { leadId, username });

    try {
      // Start a transaction
      await app.locals.pool.query("BEGIN");

      // Check if the lead exists and is unassigned
      const leadResult = await app.locals.pool.query(
        "SELECT * FROM app.combined_leads WHERE lead_id = $1 AND assigned_to IS NULL",
        [leadId]
      );

      Logger.info("Lead Checked", { leadId, username });

      if (leadResult.rows.length === 0) {
        Logger.warn("Lead not found or already assigned", { leadId });
        await app.locals.pool.query("ROLLBACK");
        return res
          .status(400)
          .json({ error: "Lead not found or already assigned" });
      }

      Logger.info("Attempting To Assign Lead", {
        leadId,
        username,
        leadResult,
      });

      // Update the lead with assignment details
      const updateResult = await app.locals.pool.query(
        "UPDATE app.combined_leads SET assigned_to = $1, assigned_at = NOW(), status = 'assigned' WHERE lead_id = $2 RETURNING *",
        [username, leadId]
      );

      // Commit the transaction
      await app.locals.pool.query("COMMIT");

      // Log and return the updated lead
      Logger.info("Lead successfully assigned", {
        leadId,
        username,
        result: updateResult.rows[0],
      });

      res.json(updateResult.rows[0]);
    } catch (error: any) {
      // Rollback on error
      await app.locals.pool.query("ROLLBACK");
      Logger.error("Error assigning lead: ", { message: error.message });
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// Start listening for PostgreSQL notifications
listenForNotifications((channel, payload) => {
  Logger.info(`Database NOTIFY received: ${channel}`, payload);

  if (channel === "new_lead") {
    io.of("/sharktank").emit("new_lead", payload);
  }
}).catch((error) => {
  Logger.error("Error in listenForNotifications", {
    error: error.message,
    stack: error.stack,
  });
});

// Setup lead events
setupLeadEvents("system"); // Pass a system userId or any identifier

//Setup queue evetns
setupQueueEvents();

// ADDED THIS LINE: call the persistent client-based listener
setupPersistentLeadEvents();
setupPersistentLeadEvents(io);

//Set up Slack Bot and Initialize Slack API Module
const slackModule = new SlackModule();
app.use("/api/slack", slackModule.router);

async function main() {
  // 1) Start Slack Bot
  try {
    await startSlackBot();
    Logger.info("Slack Bot started successfully.");
  } catch (err) {
    Logger.error("Slack Bot failed to start", {
      error: (err as Error).message,
    });
    // optionally: process.exit(1);
  }

  // 2) Start Express Server
  const port = parseInt(process.env.SERVER_PORT || "3001", 10);

  server.listen(port, "0.0.0.0", () => {
    Logger.info(`Server started on port ${port}`);
    initializeWebSockets(io);
  });

  Logger.info("Application setup complete");
}

// Invoke main()
main().catch((error) => {
  Logger.error("Fatal error in main()", { message: error.message });
  process.exit(1);
});

// Keep module exports
module.exports = { app, server, io };
