//Server Side\src\signalwire\conference\conference.service.ts
import axios from "axios";
import { CompatibilityApi, RestClient } from "@signalwire/compatibility-api";
import { Logger } from "../../shared/logger";
import { CallInstance } from "@signalwire/compatibility-api/lib/rest/api/v2010/account/call";
import { UserService } from "../../user-management/user.service";
import qs from "qs";

export class ConferenceService {
  private SIGNALWIRE_PROJECT_ID = process.env.SIGNALWIRE_PROJECT_ID || "";
  private SIGNALWIRE_AUTH_TOKEN = process.env.SIGNALWIRE_AUTH_TOKEN || "";
  private SIGNALWIRE_API_URL = process.env.SIGNALWIRE_API_URL || "";
  private authString = Buffer.from(
    `${this.SIGNALWIRE_PROJECT_ID}:${this.SIGNALWIRE_AUTH_TOKEN}`
  ).toString("base64");
  private SIGNALWIRE_API_FULL_URL = `https://${this.SIGNALWIRE_API_URL}/api/laml/2010-04-01/Accounts/${this.SIGNALWIRE_PROJECT_ID}`;
  private signalWireClient: CompatibilityApi;
  private userService: UserService;
  private ioServer: any;

  constructor(ioServer: any, userService: UserService) {
    this.userService = userService;
    this.ioServer = ioServer;
    // The ioServer parameter is preserved for consistency (if logging or events are needed)
    this.signalWireClient = RestClient(
      this.SIGNALWIRE_PROJECT_ID,
      this.SIGNALWIRE_AUTH_TOKEN,
      {
        signalwireSpaceUrl: process.env.SIGNALWIRE_API_URL,
      }
    );
  }

  // ---------------------------------------------------------------------------
  // CREATE OR FETCH CONFERENCE ROOM
  // ---------------------------------------------------------------------------
  public async createOrFetchConferenceRoom(conferenceName: string) {
    try {
      const formattedConferenceName = `${conferenceName}-conference`;
      const formattedBinName = `${conferenceName}-bin`;

      Logger.info("Checking if conference exists", { formattedConferenceName });

      // Fetch the list of LamlBins to check if the conference already exists
      const existingBinsResponse = await axios.get(
        `${this.SIGNALWIRE_API_FULL_URL}/LamlBins`,
        {
          headers: {
            Authorization: `Basic ${this.authString}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      // Search for the conferenceName in the existing LamlBins
      const existingBin = existingBinsResponse.data.laml_bins.find(
        (bin: any) => bin.name === formattedBinName
      );

      if (existingBin) {
        Logger.info("Conference room already exists", {
          formattedConferenceName,
          laMLBinUrl: existingBin.request_url,
          conferenceSid: existingBin.conference_sid,
        });

        const conference = await this.getActiveConference(
          formattedConferenceName
        );

        return {
          message: "Conference room already exists",
          conferenceName: formattedConferenceName,
          conferenceSid: conference?.conferenceSid || "",
          laMLBinUrl: existingBin.request_url,
          binName: formattedBinName,
        };
      }

      // If the room does not exist, create it
      Logger.info("Creating a new conference room", {
        formattedConferenceName,
      });

      // LAML content enabling per‑leg recording
      const laMLContent = `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Dial>
          <Conference 
            record="record-from-start"
            recordingStatusCallback="https://elecrm-serverside-kvg9r.ondigitalocean.app/api/signalwire/webhook/recording-status-callback"
            recordingStatusCallbackMethod="POST"
            startConferenceOnEnter="true" 
            endConferenceOnExit="false" 
            waitUrl="" 
            beep="false"
            statusCallback="https://elecrm-serverside-kvg9r.ondigitalocean.app/api/signalwire/webhook/voice-status-callback"
            statusCallbackMethod="POST"
            statusCallbackEvents="start end join leave mute hold speaker"
          >
            ${formattedConferenceName}
          </Conference>
        </Dial>
      </Response>`;

      // Create new LamlBin
      const createResponse = await axios.post(
        `${this.SIGNALWIRE_API_FULL_URL}/LamlBins`,
        new URLSearchParams({
          Name: formattedBinName,
          Contents: laMLContent,
        }),
        {
          headers: {
            Authorization: `Basic ${this.authString}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      const laMLBinUrl = createResponse.data.request_url;

      Logger.info("Created conference successfully", {
        conferenceName: formattedConferenceName,
        laMLBinUrl,
      });

      // Optionally retrieve the new conference
      const conference = await this.getActiveConference(
        formattedConferenceName
      );

      return {
        message: "Conference created successfully",
        conferenceName: formattedConferenceName,
        conferenceSid: conference?.conferenceSid || "",
        binName: formattedBinName,
        laMLBinUrl,
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        Logger.error("Error fetching/creating conference:", {
          message: error.message,
          stack: error.stack,
        });
        throw new Error(`Failed to fetch/create conference: ${error.message}`);
      } else {
        Logger.error("Unknown error occurred while creating conference", {
          error,
        });
        throw new Error(
          "Failed to fetch/create conference due to an unknown error"
        );
      }
    }
  }

  // ---------------------------------------------------------------------------
  // DISCONNECT CONFERENCE
  // ---------------------------------------------------------------------------
  public async disconnectConference(conferenceName: string) {
    try {
      Logger.info("Disconnecting conference", { conferenceName });

      const conference = await this.getActiveConference(conferenceName);
      if (!conference) {
        throw new Error(`Conference ${conferenceName} not found`);
      }

      const response = await this.signalWireClient
        .conferences(conference.conferenceSid)
        .update({
          status: "completed",
        });

      if (response?.status !== "completed") {
        throw new Error("Failed to disconnect conference");
      }

      Logger.info("Conference disconnected successfully", { conference });
      return {
        message: "Conference disconnected successfully",
        conferenceSid: conference.conferenceSid,
      };
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error.message;
      Logger.error("Error disconnecting conference:", {
        error: error.message,
        stack: error.stack,
      });
      throw new Error(`Failed to disconnect conference: ${errorMessage}`);
    }
  }

  // ---------------------------------------------------------------------------
  // LIST ALL CONFERENCES
  // ---------------------------------------------------------------------------
  public async listAllConferences() {
    try {
      const response = await axios.get(
        `${this.SIGNALWIRE_API_FULL_URL}/Conferences`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Basic ${this.authString}`,
          },
        }
      );
      Logger.info("Fetched all conferences successfully");
      return response.data.conferences;
    } catch (error: any) {
      Logger.error("Error listing all conferences:", { error: error.message });
      throw new Error("Failed to list all conferences");
    }
  }

  // ---------------------------------------------------------------------------
  // RETRIEVE A SPECIFIC CONFERENCE
  // ---------------------------------------------------------------------------
  public async retrieveConference(conferenceSid: string) {
    try {
      const response = await axios.get(
        `${this.SIGNALWIRE_API_FULL_URL}/Conferences/${conferenceSid}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Basic ${this.authString}`,
          },
        }
      );
      Logger.info("Fetched conference details successfully", { conferenceSid });
      return response.data;
    } catch (error: any) {
      Logger.error("Error retrieving conference:", { error: error.message });
      throw new Error("Failed to retrieve conference");
    }
  }

  // ---------------------------------------------------------------------------
  // GET ACTIVE CONFERENCE
  // ---------------------------------------------------------------------------
  public async getActiveConference(conferenceName: string) {
    try {
      // Fetch the list of active conferences
      const activeConferences = await this.signalWireClient.conferences.list();

      // Search for the matching name
      const matchingConference = activeConferences.find(
        (conf: any) => conf.friendlyName === conferenceName
      );

      if (matchingConference) {
        Logger.info("Found active conference", { sid: matchingConference.sid });
        return {
          message: "Conference created and found successfully",
          conferenceSid: matchingConference.sid,
          friendlyName: matchingConference.friendlyName,
          matchingConference,
        };
      } else {
        return null;
      }
    } catch (error: any) {
      Logger.error("Error fetching active conference:", {
        error: error.message,
        stack: error.stack,
      });
      throw new Error(`Failed to fetch active conference: ${error.message}`);
    }
  }

  // ---------------------------------------------------------------------------
  // SEND CONFERENCE DTMF TONE
  // ---------------------------------------------------------------------------
  public async sendConferenceDtmfTone(
    callSid: string,
    dtmfTones: string,
    lamlBinUrl: string
  ): Promise<CallInstance> {
    try {
      Logger.info("Starting to send DTMF tones", {
        callSid,
        dtmfTones,
        lamlBinUrl,
      });

      // Build instructions to play tones
      const response = new RestClient.LaML.VoiceResponse();
      response.play({ digits: `w${dtmfTones}` });
      response.redirect(lamlBinUrl);

      Logger.info("Generated LaML Response", {
        callSid,
        laMlResponse: response.toString(),
      });

      // Send instructions over to SignalWire
      const updateResponse = await this.signalWireClient.calls(callSid).update({
        twiml: response.toString(),
      });

      Logger.info("Update response received from SignalWire", {
        callSid,
        updateResponse,
      });

      Logger.info("Finished sending DTMF tones", { callSid, updateResponse });
      return updateResponse;
    } catch (error) {
      Logger.error("Error occurred while sending DTMF tones", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      if (error instanceof Error) {
        throw new Error(`Failed to send DTMF tone: ${error.message}`);
      }
      throw new Error("An unknown error occurred");
    }
  }

  // =======================================
  // Transfer Operations Methods
  // =======================================


  /**
   * HANGUP CALL
   * Body: { callSid: string }
   */
  public async hangupCall(callSid: string): Promise<any> {
    try {
      Logger.info("Hanging up call", { callSid });
      const response = await this.signalWireClient.calls(callSid).update({
        status: "completed",
      });
      return response;
    } catch (error: any) {
      Logger.error("Error in hangupCall", { error: error.message });
      throw new Error(
        "Failed to hang up call. The call may have already ended."
      );
    }
  }

  /**
   * HOLD ORIGINAL PARTICIPANT
   * Body: { conferenceSid: string, originalCallSid: string }
   */
  public async holdOriginalParticipant(
    conferenceSid: string,
    originalCallSid: string
  ): Promise<any> {
    try {
      Logger.info("Holding original participant", {
        conferenceSid,
        originalCallSid,
      });
      const response = await this.signalWireClient
        .conferences(conferenceSid)
        .participants(originalCallSid)
        .update({ hold: true });
      return response;
    } catch (error: any) {
      Logger.error("Error in holdOriginalParticipant", {
        error: error.message,
      });
      throw new Error("Failed to put participant on hold. Please try again.");
    }
  }

  /**
   * UNHOLD ORIGINAL PARTICIPANT
   * Body: { conferenceSid: string, originalCallSid: string }
   */
  public async unholdOriginalParticipant(
    conferenceSid: string,
    originalCallSid: string
  ): Promise<any> {
    try {
      Logger.info("Unholding original participant", {
        conferenceSid,
        originalCallSid,
      });
      const response = await this.signalWireClient
        .conferences(conferenceSid)
        .participants(originalCallSid)
        .update({ hold: false });
      return response;
    } catch (error: any) {
      Logger.error("Error in unholdOriginalParticipant", {
        error: error.message,
      });
      throw new Error("Failed to take participant off hold. Please try again.");
    }
  }

  /**
   * CREATE CONSULTATION CALL
   * Body: { consultFrom: string, consultTo: string, consultUrl: string }
   */
  public async createConsultationCall(
    consultFrom: string,
    consultTo: string,
    consultUrl: string,
    originalCallSid: string,
    username: string
  ): Promise<any> {
    try {
      Logger.info("Creating consultation call", {
        consultFrom,
        consultTo,
        consultUrl,
      });

      // Get username from phone number
      const targetUsername = await this.userService.getUsernameFromPhoneNumber(
        consultTo
      );

      const targetUserDetails = await this.userService.getUserByUsername(
        targetUsername
      );

      const targetDisplayName = targetUserDetails
        ? `${targetUserDetails.first_name} ${targetUserDetails.last_name}`
        : targetUsername;

      try {
        Logger.info(
          "Creating call to connect Loan Officer B to Loan Officer A",
          {
            consultFrom,
            consultTo,
            consultUrl,
          }
        );

        // Create a call to connect Loan Officer B to Loan Officer A's conference
        const response = await this.signalWireClient.calls.create({
          url: `https://elevatedhl.signalwire.com/laml-bins/d4055290-e7fa-4023-93a5-155e0204eedf?username=${username}`,
          from: consultFrom,
          to: consultTo,
          statusCallback: `${process.env.BASE_URL}/api/signalwire/webhook/voice-status-callback?isWarmTransfer=true`,
          statusCallbackMethod: "POST",
          statusCallbackEvent: [
            "initiated",
            "ringing",
            "answered",
            "completed",
          ],
        });

        return {
          status: "pending",
          targetUsername: targetUsername,
          targetDisplayName: targetDisplayName,
          callResponse: response,
        };
      } catch (error: any) {
        Logger.error("Error creating consultation call", {
          error: error.message,
        });
        throw new Error(
          `Failed to connect to agent (${consultTo}). Please verify the number and try again.`
        );
      }
    } catch (error: any) {
      Logger.error("Error in createConsultationCall", { error: error.message });
      throw new Error(error.message);
    }
  }

  /**
   * ADD CONSULTATION CALL TO CONFERENCE
   * Adds a call to a user's conference
   */
  public async addConsultationCallToConference(
    callSid: string,
    targetUsername: string
  ): Promise<any> {
    try {
      Logger.info("Adding call to conference", {
        callSid,
        targetUsername,
      });
      
      // Generate the LAML bin URL for the target username
      const lamlBinUrl = `https://elevatedhl.signalwire.com/laml-bins/d4055290-e7fa-4023-93a5-155e0204eedf?username=${targetUsername}`;
      
      // Update the call with the new LAML
      const response = await this.signalWireClient
        .calls(callSid)
        .update({
          url: lamlBinUrl,
          method: "POST",
        });
        
      return response;
    } catch (error: any) {
      Logger.error("Error in addConsultationCallToConference", {
        error: error.message,
      });
      throw new Error(
        "Failed to add call to conference. Please try again."
      );
    }
  }

  /**
   * BLIND TRANSFER
   * Transfers a call to another user's conference
   */
  public async blindTransfer(
    callSid: string,
    targetUsername: string
  ): Promise<any> {
    try {
      Logger.info("Initiating blind transfer", { callSid, targetUsername });

      // Use addConsultationCallToConference to transfer the call
      const result = await this.addConsultationCallToConference(
        callSid,
        targetUsername
      );

      return {
        message: "Participant transferred successfully",
        callSid,
        ...result
      };
    } catch (error: any) {
      Logger.error("Error in blindTransfer", { error: error.message });
      throw new Error(error.message);
    }
  }

}
