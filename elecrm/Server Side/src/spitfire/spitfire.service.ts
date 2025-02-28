import { Logger } from "../shared/logger";
import { CombinedLead } from "../db/db.models";
import axios from "axios";
import {
  SpitfireLoginRequest,
  SpitfireLoginResponse,
  SpitfireLeadRequest,
} from "./spitfire.models";

export class SpitfireService {
  private static instance: SpitfireService;
  private readonly LOGIN_URL =
    "https://elevatedhl.spitfireagent.com/SpitFireRestAPI/api/Login/LoginUser";
  private readonly CREATE_URL =
    "https://elevatedhl.spitfireagent.com/SpitFireRestAPI/api/ListClients/CreateListClient";

  private constructor() {
    Logger.info("SpitfireService initialized");
  }

  public static getInstance(): SpitfireService {
    if (!SpitfireService.instance) {
      SpitfireService.instance = new SpitfireService();
    }
    return SpitfireService.instance;
  }

  private async loginToSpitfire(): Promise<{
    accessToken: string;
    customerID: string;
    userID: string;
  } | null> {
    try {
      const payload: SpitfireLoginRequest = {
        username: process.env.SPITFIRE_USERNAME || "",
        password: process.env.SPITFIRE_PASSWORD || "",
        appType: process.env.SPITFIRE_APPTYPE || "",
      };

      Logger.info("Attempting Spitfire login");

      const response = await axios.post<SpitfireLoginResponse>(
        this.LOGIN_URL,
        payload,
        {
          headers: {
            accept: "text/plain",
            "Content-Type": "application/json",
          },
        }
      );

      const loginResult = response.data.loginResult;
      if (loginResult.result === "Success") {
        Logger.info("Spitfire login successful");
        return {
          accessToken: loginResult.accessToken,
          customerID: loginResult.customerID,
          userID: loginResult.userID,
        };
      }

      Logger.warn("Spitfire login failed", { message: loginResult.message });
      return null;
    } catch (error: any) {
      Logger.error("Spitfire login error", { error: error.message });
      throw error;
    }
  }

  private async checkIfAlreadyExported(globalId: string): Promise<boolean> {
    try {
      const result = await global.pool!.query(
        "SELECT 1 FROM public.spitfire_export_log WHERE global_id = $1 LIMIT 1",
        [globalId]
      );
      return result.rows.length > 0;
    } catch (error: any) {
      Logger.error("Error checking export status", {
        error: error.message,
        globalId,
      });
      return false;
    }
  }

  private mapLeadToSpitfirePayload(
    lead: CombinedLead,
    customerId: number,
    userId: number
  ): SpitfireLeadRequest {
    const name = `${lead.first_name || ""} ${lead.last_name || ""}`.trim();
    const uniqueId = lead.ulid || lead.lead_id || lead.id?.toString();

    return {
      customerID: customerId,
      userID: userId,
      listName: "WebPreview_Live_List",
      duplicateCheck: false,
      listClient: {
        listId: 14,
        clientId: 0,
        name,
        firstName: lead.first_name || "",
        lastName: lead.last_name || "",
        company: "",
        address: lead.address || "",
        city: lead.city || "",
        state: lead.state || "",
        zipCode: lead.zip_code || "",
        country: "US",
        voicePhone: lead.cell_phone || lead.home_phone || "",
        secondaryVoicePhone: "",
        homePhone: lead.home_phone || "",
        cellPhone: lead.cell_phone || "",
        faxPhone: "",
        email: lead.email || "",
        webSite: "",
        note: "",
        xmldata: "",
        dateEdited: new Date().toISOString().split("T")[0],
        dateCreated: new Date().toISOString().split("T")[0],
        outboundCallerId: "",
        customFields: {
          field: [
            { name: "property use", value: lead.property_use || "" },
            { name: "property type", value: lead.property_type || "" },
            { name: "loan purpose", value: lead.loan_purpose || "" },
            {
              name: "desired loan amount",
              value: lead.desired_loan_amount?.toString() || "",
            },
            {
              name: "estimated value",
              value: lead.estimated_value?.toString() || "",
            },
          ],
        },
        updatedCustomFields: {
          field: [
            { name: "property use", value: lead.property_use || "" },
            { name: "property type", value: lead.property_type || "" },
            { name: "loan purpose", value: lead.loan_purpose || "" },
            {
              name: "desired loan amount",
              value: lead.desired_loan_amount?.toString() || "",
            },
            {
              name: "estimated value",
              value: lead.estimated_value?.toString() || "",
            },
            { name: "ID", value: uniqueId },
          ],
        },
      },
    };
  }

  public async exportLeadToSpitfire(leadData: CombinedLead): Promise<void> {
    try {
      const globalId = leadData.global_id;
      if (!globalId) {
        throw new Error("Lead missing global_id");
      }

      // Check if already exported
      if (await this.checkIfAlreadyExported(globalId)) {
        Logger.info("Lead already exported to Spitfire", { globalId });
        return;
      }

      // Login to Spitfire
      const auth = await this.loginToSpitfire();
      if (!auth) {
        throw new Error("Failed to authenticate with Spitfire");
      }

      // Map the lead data
      const payload = this.mapLeadToSpitfirePayload(
        leadData,
        parseInt(auth.customerID),
        parseInt(auth.userID)
      );

      // Send to Spitfire
      await axios.post(this.CREATE_URL, payload, {
        headers: {
          accept: "text/plain",
          Authorization: `Bearer ${auth.accessToken}`,
          "Content-Type": "application/json-patch+json",
        },
      });

      // Log the export
      await this.logSpitfireExport(globalId);
      Logger.info("Successfully exported lead to Spitfire", { globalId });
    } catch (error: any) {
      Logger.error("Failed to export lead to Spitfire", {
        error: error.message,
        leadId: leadData.id,
      });
      throw error;
    }
  }

  private async logSpitfireExport(global_id: string): Promise<void> {
    try {
      await global.pool!.query(
        `INSERT INTO public.spitfire_export_log 
                (global_id) 
                VALUES ($1)`,
        [global_id]
      );
      Logger.info("Logged Spitfire export", { global_id });
    } catch (error: any) {
      Logger.error("Failed to log Spitfire export", {
        error: error.message,
        global_id,
      });
    }
  }
}
