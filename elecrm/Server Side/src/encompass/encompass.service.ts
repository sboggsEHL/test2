import axios from "axios";
import { Logger, safeStringify } from "../shared/logger";
import { Pool } from "pg";
import { EncompassExportFormat } from "./encompass.model";

export class EncompassService {
  private tokenUrl =
    process.env.ENC_TOKEN_URL || "https://api.elliemae.com/oauth2/v1/token";
  private loanSchemaUrl = `${
    process.env.ENC_API_URL || "https://api.elliemae.com"
  }/v3/schemas/loan`;
  private customSchemaUrl = `${
    process.env.ENC_API_URL || "https://api.elliemae.com"
  }/v3/settings/loan/customFields`;
  private cache: { token: string; fetchedAt: Date } | null = null;
  private appDBClient: Pool;

  constructor() {
    this.appDBClient = global.pool as Pool;
  }

  async getBearerToken(forceRefresh = false): Promise<string> {
    const payload = new URLSearchParams({
      grant_type: "password",
      username: process.env.ENC_USERNAME || "",
      password: process.env.ENC_PASSWORD || "",
      client_id: process.env.ENC_CLIENT_ID || "",
      client_secret: process.env.ENC_CLIENT_SECRET || "",
    }).toString();

    const headers = { "Content-Type": "application/x-www-form-urlencoded" };

    try {
      const response = await axios.post(this.tokenUrl, payload, { headers });
      const token = response.data.access_token;

      this.cache = { token, fetchedAt: new Date() };
      Logger.info("Token fetched successfully", { token });
      return token;
    } catch (error) {
      Logger.error("Error fetching token", { error });
      throw new Error("Failed to fetch Bearer Token");
    }
  }

  async getLoanSchema(): Promise<any> {
    try {
      const token = await this.getBearerToken();
      Logger.info("Fetching loan schema from URL...", {
        url: this.loanSchemaUrl,
      });

      const response = await axios.get(this.loanSchemaUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Logger.info("Loan schema fetched successfully", {
        schema: response.data,
      });
      return response.data;
    } catch (error) {
      Logger.error("Error fetching loan schema", { error });
      throw new Error("Failed to fetch loan schema");
    }
  }

  async getCustomSchema(): Promise<any> {
    try {
      const token = await this.getBearerToken();
      Logger.info("Fetching custom schema from URL...", {
        url: this.customSchemaUrl,
      });

      const response = await axios.get(this.customSchemaUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Logger.info("Custom schema fetched successfully", {
        schema: response.data,
      });
      return response.data;
    } catch (error) {
      Logger.error("Error fetching custom schema", { error });
      throw new Error("Failed to fetch custom schema");
    }
  }

  private isTokenValid(fetchedAt: Date, now: Date): boolean {
    const diffMs = now.getTime() - fetchedAt.getTime();
    const diffMinutes = diffMs / 1000 / 60;
    Logger.debug("Token validity check", {
      fetchedAt,
      now,
      diffMinutes,
      isValid: diffMinutes < 15,
    });
    return diffMinutes < 15;
  }

  async exportToEncompass(
    leadData: EncompassExportFormat,
    leadId: string,
    userName: string
  ): Promise<any> {
    const token = await this.getBearerToken();

    const exportUrl = `${process.env.ENC_API_URL}/v3/loans?loanFolder=Prospects&view=entity&templateType=templateSet&templatePath=\\Companywide\\Refinance&loID=${userName}`;
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    Logger.info("Exporting data to Encompass...", {
      url: exportUrl,
      data: safeStringify(leadData),
    });

    try {
      const response = await axios.post(exportUrl, leadData, { headers });

      Logger.info("Updating lead export status in DB for lead", leadId);

      const query = `
              UPDATE app.combined_leads 
              SET exported = true
              WHERE lead_id = $1 
              RETURNING *
            `;

      const updatedDBResults = await this.appDBClient.query(query, [leadId]);

      if (updatedDBResults.rows.length === 0) {
        Logger.error("Error updating lead export status in DB", {
          leadId,
          userName,
        });
        throw new Error("Failed to update lead export status in DB");
      }

      Logger.info("Lead exported successfully", {
        leadId,
        userName,
        result: updatedDBResults.rows[0],
      });

      return response.data;
    } catch (error) {
      Logger.error("Error exporting data:", {
        error: safeStringify(error),
        data: safeStringify(leadData),
      });
      throw new Error("Failed to export data to Encompass");
    }
  }
}

export default EncompassService;
