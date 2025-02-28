import { Request, Response } from "express";
import { Logger, safeStringify } from "../shared/logger";
import EncompassService from "./encompass.service";
import { mapToEncompassFormat } from "./encompass.model"; // Import the mapping function from the model

export class EncompassController {
  constructor(private readonly service: EncompassService) {}

  async getToken(req: Request, res: Response): Promise<void> {
    try {
      Logger.info("Incoming request for getToken", { headers: req.headers });
      const token = await this.service.getBearerToken();
      Logger.info("Successful response for getToken", { token });
      res.status(200).json({ token });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      Logger.error("Error in getToken", { error: errorMessage });
      res.status(500).json({ error: errorMessage });
    }
  }

  async getLoanSchema(req: Request, res: Response): Promise<void> {
    try {
      Logger.info("Fetching loan schema...");
      const schema = await this.service.getLoanSchema();
      Logger.info("Loan schema fetched successfully");
      res.status(200).json(schema);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      Logger.error("Error fetching loan schema", { error: errorMessage });
      res.status(500).json({ error: errorMessage });
    }
  }

  async getCustomSchema(req: Request, res: Response): Promise<void> {
    try {
      Logger.info("Fetching custom schema...");
      const schema = await this.service.getCustomSchema();
      Logger.info("Custom schema fetched successfully");
      res.status(200).json(schema);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      Logger.error("Error fetching custom schema", { error: errorMessage });
      res.status(500).json({ error: errorMessage });
    }
  }

  async exportLead(req: Request, res: Response): Promise<void> {
    try {
      Logger.info("Incoming request to export lead", {
        body: safeStringify(req.body),
      });
      const { leadData, userName } = req.body;

      const encompassData = mapToEncompassFormat(leadData);
      Logger.info("Formatted encompassData", {
        encompassData: safeStringify(encompassData),
      });

      const result = await this.service.exportToEncompass(
        encompassData,
        leadData.lead_id,
        userName
      );
      Logger.info("Lead exported successfully");

      res.status(200).json(result);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      Logger.error("Error exporting lead", {
        error: safeStringify(error),
      });
      res.status(500).json({ error: errorMessage });
    }
  }
}
