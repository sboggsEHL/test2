import axios from "axios";
import qs from "qs";
import { Logger } from "../../../shared/logger";
import { RestClient } from "@signalwire/compatibility-api";
import { CallInstance } from "@signalwire/compatibility-api/lib/rest/api/v2010/account/call";
import { ConferenceService } from "../conference.service";

export class ParticipantService {
  private readonly logger = Logger;
  private readonly SIGNALWIRE_PROJECT_ID =
    process.env.SIGNALWIRE_PROJECT_ID || "";
  private readonly SIGNALWIRE_AUTH_TOKEN =
    process.env.SIGNALWIRE_AUTH_TOKEN || "";
  private readonly SIGNALWIRE_API_URL = process.env.SIGNALWIRE_API_URL || "";
  private readonly authString = Buffer.from(
    `${this.SIGNALWIRE_PROJECT_ID}:${this.SIGNALWIRE_AUTH_TOKEN}`
  ).toString("base64");
  private readonly SIGNALWIRE_API_FULL_URL = `https://${this.SIGNALWIRE_API_URL}/api/laml/2010-04-01/Accounts/${this.SIGNALWIRE_PROJECT_ID}`;
  private readonly signalWireClient: any;
  private conferenceService;

  constructor(conferenceService: ConferenceService) {
    this.signalWireClient = RestClient(
      this.SIGNALWIRE_PROJECT_ID,
      this.SIGNALWIRE_AUTH_TOKEN,
      { signalwireSpaceUrl: process.env.SIGNALWIRE_API_URL }
    );
    this.conferenceService = conferenceService;
  }

  // ---------------------------------------------------------------------------
  // ADD PARTICIPANT TO CONFERENCE
  // ---------------------------------------------------------------------------
  async addParticipantToConference(
    callSid: string,
    lamlBinUrl: string
  ): Promise<any> {
    try {
      this.logger.info("Adding participant with SignalWire", {
        callSid,
        lamlBinUrl,
      });

      const response = await this.signalWireClient.calls(callSid).update({
        method: "POST",
        url: lamlBinUrl,
        record: "record-from-ringing",
        recordingStatusCallback: `${process.env.BASE_URL}/api/signalwire/webhook/recording-status-callback`,
        recordingStatusCallbackMethod: "POST",
      });

      this.logger.info("Participant added successfully", {
        callSid,
        lamlBinUrl,
      });

      return {
        message: "Participant added successfully",
        callSid: response.sid,
        status: response.status,
        conferenceSid: response.parentCallSid || null, // Get conference SID
      };
    } catch (error: any) {
      this.logger.error("Error adding participant:", {
        error: error.message,
        stack: error.stack,
      });
      throw new Error("Failed to add participant");
    }
  }
  // ---------------------------------------------------------------------------
  // Start Conference Recording
  // ---------------------------------------------------------------------------
  public async startConferenceRecording(conferenceSid: string): Promise<void> {
    try {
      this.logger.info(
        `[START RECORDING] => Recording conference: ${conferenceSid}`
      );

      await this.signalWireClient.conferences(conferenceSid).update({
        record: true,
        recordingStatusCallback: `${process.env.BASE_URL}/api/signalwire/webhook/recording-status-callback`,
        recordingStatusCallbackMethod: "POST",
      });

      this.logger.info(`[START RECORDING] => Successfully started recording.`);
    } catch (error: any) {
      this.logger.error("[START RECORDING] Error:", {
        error: error.message,
        stack: error.stack,
      });
      throw new Error("Failed to start conference recording");
    }
  }

  // ---------------------------------------------------------------------------
  // MUTE PARTICIPANT
  // ---------------------------------------------------------------------------
  public async muteParticipant(conferenceName: string, callSid: string) {
    try {
      Logger.info("Muting participant", { conferenceName, callSid });

      const conference = await this.conferenceService.getActiveConference(
        conferenceName
      );
      if (!conference) {
        throw new Error(`Conference ${conferenceName} not found`);
      }

      const response = await this.signalWireClient
        .conferences(conference.conferenceSid)
        .participants(callSid)
        .update({ muted: true });

      if (response?.muted !== true) {
        throw new Error("Failed to mute participant");
      }

      Logger.info("Participant muted successfully", {
        conferenceName,
        callSid,
      });
      return {
        message: "Participant muted successfully",
        conferenceSid: conference.conferenceSid,
        callSid,
      };
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error.message;
      Logger.error("Error muting participant:", {
        error: error.message,
        stack: error.stack,
      });
      throw new Error(`Failed to mute participant: ${errorMessage}`);
    }
  }

  // ---------------------------------------------------------------------------
  // UNMUTE PARTICIPANT
  // ---------------------------------------------------------------------------
  async unmuteParticipant(
    conferenceSid: string,
    callSid: string
  ): Promise<any> {
    try {
      this.logger.info("Unmuting participant", { conferenceSid, callSid });
      const response = await this.signalWireClient
        .conferences(conferenceSid)
        .participants(callSid)
        .update({ muted: false });
      if (response?.muted !== false) {
        throw new Error("Failed to unmute participant");
      }
      this.logger.info("Participant unmuted successfully", {
        conferenceSid,
        callSid,
      });
      return {
        message: "Participant unmuted successfully",
        conferenceSid,
        callSid,
      };
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error.message;
      this.logger.error("Error unmuting participant:", {
        error: error.message,
        stack: error.stack,
      });
      throw new Error(`Failed to unmute participant: ${errorMessage}`);
    }
  }

  // ---------------------------------------------------------------------------
  // HOLD PARTICIPANT
  // ---------------------------------------------------------------------------
  public async holdParticipant(conferenceName: string, callSid: string) {
    try {
      Logger.info("Holding participant", { conferenceName, callSid });

      const conference = await this.conferenceService.getActiveConference(
        conferenceName
      );
      if (!conference) {
        throw new Error(`Conference ${conferenceName} not found`);
      }

      const response = await this.signalWireClient
        .conferences(conference.conferenceSid)
        .participants(callSid)
        .update({ hold: true });

      if (response?.hold !== true) {
        throw new Error("Failed to hold participant");
      }

      Logger.info("Participant held successfully", { conferenceName, callSid });
      return {
        message: "Participant held successfully",
        conferenceSid: conference.conferenceSid,
        callSid,
      };
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error.message;
      Logger.error("Error holding participant:", {
        error: error.message,
        stack: error.stack,
      });
      throw new Error(`Failed to hold participant: ${errorMessage}`);
    }
  }

  // ---------------------------------------------------------------------------
  // RESUME PARTICIPANT
  // ---------------------------------------------------------------------------
  async resumeParticipant(
    conferenceSid: string,
    callSid: string
  ): Promise<any> {
    try {
      this.logger.info("Resuming participant", { conferenceSid, callSid });
      const response = await this.signalWireClient
        .conferences(conferenceSid)
        .participants(callSid)
        .update({ hold: false });
      if (response?.hold !== false) {
        throw new Error("Failed to resume participant");
      }
      this.logger.info("Participant resumed successfully", {
        conferenceSid,
        callSid,
      });
      return {
        message: "Participant resumed successfully",
        conferenceSid,
        callSid,
      };
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error.message;
      this.logger.error("Error resuming participant:", {
        error: error.message,
        stack: error.stack,
      });
      throw new Error(`Failed to resume participant: ${errorMessage}`);
    }
  }

  // ---------------------------------------------------------------------------
  // GET ALL PARTICIPANTS
  // ---------------------------------------------------------------------------
  public async getAllParticipants(conferenceName: string) {
    try {
      Logger.info("Fetching all participants for conference", {
        conferenceName,
      });

      const conference = await this.conferenceService.getActiveConference(
        conferenceName
      );
      if (!conference || !conference.conferenceSid) {
        throw new Error(`Conference ${conferenceName} not found`);
      }

      const response = await axios.get(
        `${this.SIGNALWIRE_API_FULL_URL}/Conferences/${conference.conferenceSid}/Participants`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Basic ${this.authString}`,
          },
        }
      );

      if (!response.data || !response.data.participants) {
        throw new Error(
          `No participants found for conference ${conferenceName}`
        );
      }

      Logger.info("Fetched participants successfully", {
        conferenceSid: conference.conferenceSid,
      });
      return {
        message: "Participants fetched successfully",
        participants: response.data.participants,
      };
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error.message;
      Logger.error("Error fetching participants:", {
        error: errorMessage,
        stack: error.stack,
      });
      throw new Error(`Failed to fetch participants: ${errorMessage}`);
    }
  }

  // ---------------------------------------------------------------------------
  // DELETE PARTICIPANT
  // ---------------------------------------------------------------------------
  async deleteParticipant(
    conferenceSid: string,
    callSid: string
  ): Promise<any> {
    try {
      const response = await axios.delete(
        `${this.SIGNALWIRE_API_FULL_URL}/Conferences/${conferenceSid}/Participants/${callSid}`,
        {
          headers: {
            Authorization: `Basic ${this.authString}`,
          },
        }
      );
      if (response.status !== 204) {
        throw new Error("Failed to delete participant");
      }
      this.logger.info("Deleted participant successfully", {
        conferenceSid,
        callSid,
      });
      return { message: "Participant deleted successfully" };
    } catch (error: any) {
      this.logger.error("Error deleting participant:", {
        error: error.message,
      });
      throw new Error("Failed to delete participant");
    }
  }

  // ---------------------------------------------------------------------------
  // UPDATE PARTICIPANT
  // ---------------------------------------------------------------------------
  async updateParticipant(
    conferenceSid: string,
    callSid: string,
    data: any
  ): Promise<any> {
    try {
      const response = await axios.post(
        `${this.SIGNALWIRE_API_FULL_URL}/Conferences/${conferenceSid}/Participants/${callSid}`,
        qs.stringify(data),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
            Authorization: `Basic ${this.authString}`,
          },
        }
      );
      this.logger.info("Updated participant status successfully", {
        conferenceSid,
        callSid,
      });
      return response.data;
    } catch (error: any) {
      this.logger.error("Error updating participant:", {
        error: error.message,
      });
      throw new Error("Failed to update participant");
    }
  }
}
