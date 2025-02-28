// user.controller.ts
import { Request, Response } from "express";
import { UserService } from "./user.service";
import { Logger } from "../shared/logger";
// Import both the default Slack app & the named export for creating channels
import slackApp, { createPasswordResetChannel } from "../slack/slackbot";

// ADDED: Import the actual SignalWireService
import { SignalWireService } from "../signalwire/signalwire.service";

export class UserController {
  private userService: UserService;

  // user.controller.ts
  constructor(userService: UserService) {
    // Pass an empty object or null if your code doesn't break
    // by referencing this.ioServer
    this.userService = userService;
  }

  async login(req: Request, res: Response) {
    res.json({ token: res.locals.token });
  }

  async retrieveLicenseInfo(req: Request, res: Response) {
    const userName = req.params.userName;
    Logger.info("Received request to retrieve license info", { userName });

    if (!userName) {
      return res.status(400).json({ error: "userName is required" });
    }

    try {
      const licenseInfo = await this.userService.retrieveLicenseInfo(userName);
      Logger.info("Sending license info response", { licenseInfo });
      res.json(licenseInfo);
    } catch (error: any) {
      Logger.error("Error retrieving license info:", {
        error: error.message,
        stack: error.stack,
      });
      res.status(500).json({ message: error.message });
    }
  }

  public async createUser(req: Request, res: Response) {
    try {
      // The body should include { firstName, lastName, direct_phone_number, persona }
      const { firstName, lastName, direct_phone_number, persona } = req.body;

      if (!firstName || !lastName || !direct_phone_number || !persona) {
        return res.status(400).json({
          error:
            "Missing required fields: firstName, lastName, direct_phone_number, persona",
        });
      }

      const { user, plaintextPassword } = await this.userService.createUser({
        firstName,
        lastName,
        direct_phone_number,
        persona,
      });

      return res.status(201).json({
        user,
        plaintextPassword,
      });
    } catch (error: any) {
      Logger.error("Error in createUser controller", { error: error.message });
      return res.status(500).json({ error: error.message });
    }
  }

  public async getAllUsers(req: Request, res: Response) {
    try {
      const users = await this.userService.getAllUsers();
      return res.json(users);
    } catch (error: any) {
      Logger.error("Error in getAllUsers controller", { error: error.message });
      return res.status(500).json({ error: error.message });
    }
  }

  public async getUserByUsername(req: Request, res: Response) {
    try {
      const { username } = req.params;
      if (!username) {
        return res.status(400).json({ error: "Username is required" });
      }

      const user = await this.userService.getUserByUsername(username);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.json(user);
    } catch (error: any) {
      Logger.error("Error in getUserByUsername controller", {
        error: error.message,
      });
      return res.status(500).json({ error: error.message });
    }
  }

  public async updateUser(req: Request, res: Response) {
    try {
      const username = req.params?.id; // route is "/:username"

      if (!username) {
        return res.status(400).json({ error: "Username is required" });
      }

      // The body can have any subset of { email, sw_phone_number, direct_phone_number, first_name, last_name, persona }
      const updatedUser = await this.userService.updateUser(username, req.body);

      if (!updatedUser) {
        return res
          .status(404)
          .json({ error: "User not found or no fields provided" });
      }

      return res.json(updatedUser);
    } catch (error: any) {
      Logger.error("Error in updateUser controller", { error: error.message });
      return res.status(500).json({ error: error.message });
    }
  }

  public async resetPassword(req: Request, res: Response) {
    try {
      const { username } = req.params;
      if (!username) {
        return res.status(400).json({ error: "Username is required" });
      }

      Logger.info("Received request to reset password", { username });

      const newPlainTextPassword = await this.userService.resetPassword(
        username
      );
      if (!newPlainTextPassword) {
        return res.status(404).json({ error: "User not found" });
      }

      // Return the new plaintext password
      return res.json({
        message: "Password reset successfully",
        newPassword: newPlainTextPassword,
      });
    } catch (error: any) {
      Logger.error("Error in resetPassword controller", {
        error: error.message,
      });
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Slack-based Password Reset (Private Channel Approach)
   * 1. Receives { username } from the request body
   * 2. Uses userService.getSlackUserIdByUsername(...) to get Slack ID
   * 3. Calls createPasswordResetChannel(...) to create a private channel
   */
  public async initiateSlackPasswordReset(req: Request, res: Response) {
    try {
      const { username } = req.body;
      if (!username) {
        return res.status(400).json({ error: "Username is required" });
      }

      // 1) Get Slack ID from the service
      const slackUserId = await this.userService.getSlackUserIdByUsername(
        username
      );
      if (!slackUserId) {
        return res
          .status(404)
          .json({ error: "User not found or no Slack ID on file." });
      }

      // 2) Create a new private channel for this user & the bot
      await createPasswordResetChannel(slackApp.client, slackUserId, username);

      return res.json({
        message:
          "Slack password reset initiated. A private channel was created for user to enter new password.",
      });
    } catch (error: any) {
      Logger.error("Error in initiateSlackPasswordReset controller", {
        error: error.message,
      });
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Handles password updates via Slack Bot
   * 1. Receives { slackUserId, newPassword } from the request body
   * 2. Updates the user's password in the database
   */
  public async slackbotUpdatePassword(req: Request, res: Response) {
    try {
      const { slackUserId, newPassword } = req.body;
      if (!slackUserId || !newPassword) {
        return res
          .status(400)
          .json({ error: "Missing slackUserId or newPassword" });
      }

      // 1) Find the user by slackUserId
      const user = await this.userService.findBySlackUserId(slackUserId);
      if (!user) {
        return res
          .status(404)
          .json({ error: "No user found with that Slack ID" });
      }

      // 2) Hash the password
      const bcrypt = require("bcrypt");
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // 3) Update the DB
      await this.userService.updatePasswordHashBySlackId(
        slackUserId,
        hashedPassword
      );

      // 4) Done
      return res.json({
        message: `Password updated for Slack user: ${slackUserId}`,
      });
    } catch (error: any) {
      Logger.error("Error in slackbotUpdatePassword", { error: error.message });
      return res.status(500).json({ error: error.message });
    }
  }
}
