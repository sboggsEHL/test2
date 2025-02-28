import axios from "axios";
import { Logger } from "../shared/logger";
import { SlackUser } from "./slack.model";

export class SlackService {
  private readonly baseUrl = "https://slack.com/api";
  private readonly botToken = process.env.SLACK_API_BOT_TOKEN;

  constructor() {
    if (!this.botToken) {
      throw new Error("SLACK_API_BOT_TOKEN is not set in environment variables.");
    }
  }

  async getAllUsers(): Promise<SlackUser[]> {
    try {
      Logger.info("Fetching all Slack users...");
      const response = await axios.get(`${this.baseUrl}/users.list`, {
        headers: {
          Authorization: `Bearer ${this.botToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.data.ok) {
        Logger.error("Slack API error:", { error: response.data.error });
        throw new Error(response.data.error);
      }

      Logger.info("Slack users retrieved successfully");

      // Parse Slack users into SlackUser model
      return response.data.members
        .filter((user: any) => user.profile?.email) // Only include users with emails
        .map(
          (user: any) =>
            new SlackUser(user.id, user.name, user.profile.real_name, user.profile.email)
        );
    } catch (err) {
      Logger.error("Error fetching Slack users:", {
        error: err instanceof Error ? err.message : "Unknown error",
      });
      throw err;
    }
  }
}
