// Server Side/src/user-management/user.service.ts

import bcrypt from "bcrypt";
import axios from "axios";
import { Pool } from "pg";
import { Logger } from "../shared/logger";
import { CreateUserDTO, LicenseRecord, User } from "./user.model";
// Import DidService from the DID module instead of SignalWireService for DID assignment
import { DidService } from "../signalwire/did/did.service";

export class UserService {
  private userManagementDbClient: Pool;
  private didService: DidService;

  constructor(didService: DidService) {
    this.userManagementDbClient = global.userManagementPool as Pool;
    this.didService = didService;
  }

  private generateRandomPassword(length = 12): string {
    const chars =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  // ---------------------------------------------------------------------------
  // CREATE USER
  // ---------------------------------------------------------------------------
  public async createUser(data: CreateUserDTO): Promise<{
    user: Omit<User, "password_hash">;
    plaintextPassword: string;
  }> {
    try {
      // 1. Derive username & email
      const firstInitial = data.firstName.charAt(0).toLowerCase();
      const lastNameLower = data.lastName.toLowerCase();
      const username = `${firstInitial}${lastNameLower}`;
      const email = `${username}@elevated.loans`;

      // 2. Generate random password
      const plainPassword = this.generateRandomPassword();

      // 3. Hash the password
      const password_hash = await bcrypt.hash(plainPassword, 10);

      // 4. Insert user into DB (with sw_phone_number = null initially)
      const insertQuery = `
        INSERT INTO users (
          username,
          email,
          password_hash,
          sw_phone_number,
          direct_phone_number,
          first_name,
          last_name,
          persona
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING
          id,
          username,
          email,
          slack_user_id,
          sw_phone_number,
          direct_phone_number,
          first_name,
          last_name,
          persona,
          created_at,
          updated_at
      `;
      const values = [
        username,
        email,
        password_hash,
        null, // sw_phone_number => assigned below
        data.direct_phone_number,
        data.firstName,
        data.lastName,
        data.persona,
      ];
      const result = await this.userManagementDbClient.query(
        insertQuery,
        values
      );
      const newUser = result.rows[0];

      // 5. Assign a DID from the "free" pool using DidService
      let assignedDid: string | null = null;
      try {
        assignedDid = await this.didService.assignDidToUser(newUser.username);

        // 5a. Update the user with that DID
        const updateSwNumberSql = `
          UPDATE users
          SET sw_phone_number = $1
          WHERE id = $2
          RETURNING
            id,
            username,
            email,
            slack_user_id,
            sw_phone_number,
            direct_phone_number,
            first_name,
            last_name,
            persona,
            created_at,
            updated_at
        `;
        const updatedUserRes = await this.userManagementDbClient.query(
          updateSwNumberSql,
          [assignedDid, newUser.id]
        );
        newUser.sw_phone_number = updatedUserRes.rows[0].sw_phone_number;
      } catch (err: any) {
        Logger.error("Failed to assign DID or update user with DID", {
          error: err.message,
        });
        throw err;
      }

      // 6. Slack sync endpoint (LAST STEP)
      try {
        const baseUrl = process.env.BASE_URL || "http://localhost:3001";
        await axios.get(`${baseUrl}/api/slack/sync-users`);
        Logger.info(
          "Slack sync triggered successfully after user creation & DID assignment."
        );
      } catch (syncErr) {
        Logger.error("Error calling Slack sync endpoint", { error: syncErr });
      }

      // 7. (Optional) Re-fetch the user one last time if Slack might have updated slack_user_id
      const refreshedQuery = `
        SELECT
          id,
          username,
          email,
          slack_user_id,
          sw_phone_number,
          direct_phone_number,
          first_name,
          last_name,
          persona,
          created_at,
          updated_at
        FROM users
        WHERE id = $1
      `;
      const refreshedResult = await this.userManagementDbClient.query(
        refreshedQuery,
        [newUser.id]
      );
      const finalUser = refreshedResult.rows[0] ?? newUser;

      // 8. Return the user + plaintext password
      return {
        user: finalUser,
        plaintextPassword: plainPassword,
      };
    } catch (error: any) {
      Logger.error("Error creating user", { error: error.message });
      throw new Error(error.message);
    }
  }

  // ---------------------------------------------------------------------------
  // READ - GET ALL USERS
  // ---------------------------------------------------------------------------
  public async getAllUsers(): Promise<Omit<User, "password_hash">[]> {
    try {
      const queryText = `
        SELECT
          id, username, email, sw_phone_number, direct_phone_number,
          first_name, last_name, persona, created_at, updated_at
        FROM users
        ORDER BY id ASC
      `;
      const result = await this.userManagementDbClient.query(queryText);
      return result.rows;
    } catch (error: any) {
      Logger.error("Error retrieving all users", { error: error.message });
      throw new Error(error.message);
    }
  }

  // ---------------------------------------------------------------------------
  // READ - GET ONE by USERNAME
  // ---------------------------------------------------------------------------
  public async getUserByUsername(
    username: string
  ): Promise<Omit<User, "password_hash"> | null> {
    try {
      const queryText = `
        SELECT
          id, username, email, sw_phone_number, direct_phone_number,
          first_name, last_name, persona, created_at, updated_at
        FROM users
        WHERE username = $1
      `;

      const result = await this.userManagementDbClient.query(queryText, [
        username,
      ]);
      if (result.rows.length === 0) {
        return null;
      }
      return result.rows[0];
    } catch (error: any) {
      Logger.error("Error retrieving user by username", {
        error: error.message,
      });
      throw new Error(error.message);
    }
  }

  // ---------------------------------------------------------------------------
  // UPDATE - by USERNAME
  // ---------------------------------------------------------------------------
  public async updateUser(
    username: string,
    data: Partial<User>
  ): Promise<Omit<User, "password_hash"> | null> {
    try {
      const fields: string[] = [];
      const values: any[] = [];
      let index = 1;
      if (data.email !== undefined) {
        fields.push(`email = $${index++}`);
        values.push(data.email);
      }
      if (data.direct_phone_number !== undefined) {
        fields.push(`direct_phone_number = $${index++}`);
        values.push(data.direct_phone_number);
      }
      if (data.sw_phone_number !== undefined) {
        fields.push(`sw_phone_number = $${index++}`);
        values.push(data.sw_phone_number);
      }
      if (data.first_name !== undefined) {
        fields.push(`first_name = $${index++}`);
        values.push(data.first_name);
      }
      if (data.last_name !== undefined) {
        fields.push(`last_name = $${index++}`);
        values.push(data.last_name);
      }
      if (data.persona !== undefined) {
        fields.push(`persona = $${index++}`);
        values.push(data.persona);
      }
      if (fields.length === 0) {
        return null;
      }
      const whereClause = `WHERE username = $${index}`;
      values.push(username);
      const updateQuery = `
        UPDATE users
        SET ${fields.join(", ")}
        ${whereClause}
        RETURNING id, username, email, sw_phone_number, direct_phone_number,
                  first_name, last_name, persona, created_at, updated_at
      `;
      const result = await this.userManagementDbClient.query(
        updateQuery,
        values
      );
      if (result.rows.length === 0) {
        return null;
      }
      return result.rows[0];
    } catch (error: any) {
      Logger.error("Error updating user", { error: error.message });
      throw new Error(error.message);
    }
  }

  // ---------------------------------------------------------------------------
  // RESET PASSWORD - by USERNAME
  // ---------------------------------------------------------------------------
  public async resetPassword(username: string): Promise<string | null> {
    try {
      const checkQuery =
        "SELECT username, email FROM users WHERE username = $1";
      const checkResult = await this.userManagementDbClient.query(checkQuery, [
        username,
      ]);
      if (checkResult.rows.length === 0) {
        return null;
      }
      const plainPassword = this.generateRandomPassword();
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      const updateQuery = `
        UPDATE users
        SET password_hash = $1, updated_at = NOW()
        WHERE username = $2
      `;
      await this.userManagementDbClient.query(updateQuery, [
        hashedPassword,
        username,
      ]);
      return plainPassword;
    } catch (error: any) {
      Logger.error("Error resetting password", { error: error.message });
      throw new Error(error.message);
    }
  }

  // ---------------------------------------------------------------------------
  // LICENSE INFO (Existing logic)
  // ---------------------------------------------------------------------------
  async retrieveLicenseInfo(userName: string): Promise<LicenseRecord[]> {
    try {
      const queryStr = `SELECT * FROM license_records WHERE username = $1`;
      const result = await this.userManagementDbClient.query(queryStr, [
        userName,
      ]);
      return this.mapToLicenseRecords(result.rows);
    } catch (error: any) {
      Logger.error("Error retrieving license information", {
        error: error.message,
      });
      return [];
    }
  }

  mapToLicenseRecords = (data: any[]): LicenseRecord[] => {
    return data.map((item) => ({
      individualId: item.individual_id,
      individualLastName: item.individual_last_name,
      individualFirstName: item.individual_first_name,
      individualMiddleName: item.individual_middle_name || undefined,
      individualSuffix: item.individual_suffix || undefined,
      licenseNumber: item.license_number || undefined,
      licenseName: item.license_name,
      industryType: item.industry_type,
      licenseStatus: item.license_status,
      licenseStatusDate: new Date(item.license_status_date),
      originalLicenseDate: item.original_license_date
        ? new Date(item.original_license_date)
        : undefined,
      renewedThroughYear: item.renewed_through_year || undefined,
      preventRenewal: item.prevent_renewal,
      sponsorshipStatus: item.sponsorship_status || undefined,
      sponsorshipStatusDate: item.sponsorship_status_date
        ? new Date(item.sponsorship_status_date)
        : undefined,
      workerClassification: item.worker_classification,
      classificationBeginDate: new Date(item.classification_begin_date),
      relationshipEffectiveDate: new Date(item.relationship_effective_date),
      reportCurrentAsOf: new Date(item.report_current_as_of),
      reportGeneratedTime: new Date(item.report_generated_time),
      username: item.username || undefined,
      state: item.state || undefined,
    }));
  };

  // ---------------------------------------------------------------------------
  // ADDED: Get Slack User ID by Username (For Slack-based reset)
  // ---------------------------------------------------------------------------
  public async getSlackUserIdByUsername(
    username: string
  ): Promise<string | null> {
    try {
      const sql = "SELECT slack_user_id FROM users WHERE username = $1";
      const result = await this.userManagementDbClient.query(sql, [username]);
      if (result.rows.length === 0) {
        return null;
      }
      return result.rows[0].slack_user_id || null;
    } catch (error: any) {
      Logger.error("Error retrieving slack_user_id", { error: error.message });
      throw new Error(error.message);
    }
  }

  public async findBySlackUserId(
    slackUserId: string
  ): Promise<Omit<User, "password_hash"> | null> {
    const sql = `
      SELECT id, username, email, sw_phone_number, direct_phone_number, first_name, last_name, persona
      FROM users
      WHERE slack_user_id = $1
    `;
    const result = await this.userManagementDbClient.query(sql, [slackUserId]);
    if (result.rows.length === 0) return null;
    return result.rows[0];
  }

  public async updatePasswordHashBySlackId(
    slackUserId: string,
    hashedPassword: string
  ): Promise<void> {
    await this.userManagementDbClient.query(
      `UPDATE users SET password_hash = $1 WHERE slack_user_id = $2`,
      [hashedPassword, slackUserId]
    );
  }

  public async getUsernameFromPhoneNumber(
    phoneNumber: string
  ): Promise<string> {
    Logger.info("Looking up username for phone number", { phoneNumber });

    // Ensure phone number starts with +1
    const formattedNumber = phoneNumber.startsWith("+1")
      ? phoneNumber
      : `+1${phoneNumber.replace(/\D/g, "")}`;
    Logger.info("Formatted phone number for lookup", { formattedNumber });

    const queryText = "SELECT username FROM users WHERE sw_phone_number = $1";
    const result = await this.userManagementDbClient.query(queryText, [
      formattedNumber,
    ]);

    if (!result.rows[0]) {
      Logger.error("No user found for phone number", { phoneNumber });
      throw new Error(`No user found with phone number ${phoneNumber}`);
    }

    Logger.info("Found username for phone number", {
      phoneNumber,
      username: result.rows[0].username,
    });

    return result.rows[0].username;
  }
}
