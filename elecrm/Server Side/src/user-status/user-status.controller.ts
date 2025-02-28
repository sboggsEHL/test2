import { Request, Response } from "express";
import { UserStatusService } from "./user-status.service";
import { Logger } from "../shared/logger";

export class UserStatusController {
  private userStatusService: UserStatusService;

  constructor() {
    this.userStatusService = new UserStatusService();
  }

  async update(req: Request, res: Response) {
    const { user_id, status } = req.body;

    if (!user_id || !status) {
      res.status(400).json({ error: "User ID and status are required" });
      return;
    }

    try {
      // Default values when updating via REST endpoint
      const statusUpdate = {
        userId: user_id,
        elecrmClient: true, // Since they're using the app to set status
        signalwireConf: false,
        activeCall: false,
        userStatusInput: status,
      };

      if (status === "offline") {
        statusUpdate.elecrmClient = false;
        statusUpdate.signalwireConf = false;
        statusUpdate.activeCall = false;
      }

      await this.userStatusService.updateUserStatus(statusUpdate);
      res.status(200).json({ message: "User status updated successfully" });
    } catch (error) {
      if (error instanceof Error) {
        Logger.error("Error updating user status:", {
          error: error.message,
          stack: error.stack,
        });
        res.status(500).json({ error: error.message });
      } else {
        Logger.error("Unknown error type caught", { error });
        res.status(500).json({ error: "An unexpected error occurred." });
      }
    }
  }
}
