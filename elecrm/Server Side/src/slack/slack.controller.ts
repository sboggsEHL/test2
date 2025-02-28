import { Request, Response } from "express";
import { SlackService } from "./slack.service";
import { query } from "../user-management/user.database";
import { Logger } from "../shared/logger";

export class SlackController {
  private slackService: SlackService;

  constructor() {
    this.slackService = new SlackService();
  }

  async syncSlackUsers(req: Request, res: Response): Promise<void> {
    try {
      const slackUsers = await this.slackService.getAllUsers();

      Logger.info("Processing Slack users", { users: slackUsers });

      for (const user of slackUsers) {
        try {
          // Update the database with the slack_user_id
          const result = await query(
            "UPDATE users SET slack_user_id = $1 WHERE email = $2 RETURNING *",
            [user.id, user.email]
          );

          if (result.rowCount === 0) {
            Logger.warn("No matching user found in database", { email: user.email });
          } else {
            Logger.info("Slack user ID updated", {
              email: user.email,
              slackUserId: user.id,
            });
          }
        } catch (err) {
          Logger.error("Error updating Slack user ID in database", {
            email: user.email,
            error: err instanceof Error ? err.message : "Unknown error",
          });
        }
      }

      res.status(200).json({ message: "Slack users synchronized successfully" });
    } catch (err) {
      Logger.error("Error synchronizing Slack users", {
        error: err instanceof Error ? err.message : "Unknown error",
      });
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
}
