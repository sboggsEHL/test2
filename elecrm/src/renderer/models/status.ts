// status.ts

export interface UserStatus {
    user_id: string; // Matches VARCHAR(50) in the database
    elecrm_client: boolean; // Maps to BOOLEAN in the database
    signalwire_conf: boolean; // Maps to BOOLEAN in the database
    active_call: boolean; // Maps to BOOLEAN in the database
    user_status_input: string | null; // Optionally set, matching VARCHAR(20)
    master_status?: string; // Matches VARCHAR(20) in the database
    last_updated?: Date; // Matches TIMESTAMP in the database, often used with JavaScript's Date object
  }

  export enum UserStatusTypes {
    AVAILABLE = "available",
    BUSY = "busy",
    AWAY = "away",
    DND = "dnd",
    OFFLINE = "offline",
  }