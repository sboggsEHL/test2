import { Pool } from "pg";
import { Logger } from "../shared/logger";


interface StatusUpdate {
  userId: string;
  elecrmClient: boolean;
  signalwireConf: boolean;
  activeCall: boolean;
  userStatusInput: string;
}

export class UserStatusService {
  private pool: Pool;

  constructor() {
    this.pool = global.userManagementPool as any;
  }

  async updateUserStatus(update: StatusUpdate): Promise<void> {
    try {
      let masterStatus = this.determineMasterStatus(update);

      const query = `
        INSERT INTO user_status 
        (user_id, elecrm_client, signalwire_conf, active_call, user_status_input, master_status, last_updated)
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
        ON CONFLICT (user_id) 
        DO UPDATE SET 
          elecrm_client = $2,
          signalwire_conf = $3,
          active_call = $4,
          user_status_input = $5,
          master_status = $6,
          last_updated = NOW()`;

      await this.pool.query(query, [
        update.userId,
        update.elecrmClient,
        update.signalwireConf,
        update.activeCall,
        update.userStatusInput,
        masterStatus
      ]);

      Logger.info("User status updated successfully", { 
        userId: update.userId, 
        masterStatus 
      });
    } catch (error) {
      if (error instanceof Error) {
        Logger.error("Error updating user status", { error: error.message });
        throw error;
      } else {
        const err = new Error("Unknown error occurred.");
        Logger.error("Unknown error type caught", { error: err.message });
        throw err;
      }
    }
  }

  private determineMasterStatus(update: StatusUpdate): string {
    if (!update.elecrmClient) return "offline";
    if (update.activeCall || update.signalwireConf) return "busy";
    if (update.userStatusInput) return update.userStatusInput;
    return "available";
  }
}