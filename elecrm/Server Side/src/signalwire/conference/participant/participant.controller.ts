import { Request, Response } from "express";
import { Logger } from "../../../shared/logger";
import { addParticipantRequest } from "../../signalwire.model";
import { ConferenceService } from "../conference.service";
import { ParticipantService } from "./participant.service";

export class ParticipantController {
  private conferenceService: ConferenceService;
  private participantService: ParticipantService;

  constructor(conferenceService: ConferenceService) {
    this.conferenceService = conferenceService;
    this.participantService = new ParticipantService(conferenceService);
  }

  private readonly logger = Logger;

  async addParticipant(req: Request, res: Response): Promise<void> {
    const { callSid, lamlBinUrl } = req.body;

    if (!callSid || !lamlBinUrl) {
      res.status(400).json({ error: "callSid and lamlBinUrl are required" });
      return;
    }

    try {
      const result = await this.participantService.addParticipantToConference(
        callSid,
        lamlBinUrl
      );

      this.logger.info("Participant added successfully", { result });

      // Start recording the conference **after participant is added**
      if (result.conferenceSid) {
        this.logger.info(
          `Starting recording for conference ${result.conferenceSid}`
        );
        await this.participantService.startConferenceRecording(
          result.conferenceSid
        );
      }

      res.status(200).json(result);
    } catch (error: any) {
      this.logger.error("Error adding participant:", {
        error: error.message,
        stack: error.stack,
      });
      res.status(500).json({ error: "Failed to add participant" });
    }
  }

  public async muteParticipant(req: Request, res: Response) {
    const { conferenceName, callSid } = req.body;

    Logger.info("Received /conference/participant/mute request", {
      conferenceName,
      callSid,
    });

    if (!conferenceName || !callSid) {
      return res
        .status(400)
        .json({ error: "Conference name and Participant SID are required" });
    }

    try {
      const result = await this.participantService.muteParticipant(
        conferenceName,
        callSid
      );
      Logger.info("Sending /conference/participant/mute response", { result });
      res.status(200).json(result);
    } catch (error: any) {
      Logger.error("Error muting participant:", {
        error: error.message,
        stack: error.stack,
      });
      res.status(500).json({ error: "Failed to mute participant" });
    }
  }

  public async unmuteParticipant(req: Request, res: Response) {
    const { conferenceSid, callSid } = req.body;

    Logger.info("Received /conference/participant/unmute request", {
      conferenceSid,
      callSid,
    });

    if (!conferenceSid || !callSid) {
      return res
        .status(400)
        .json({ error: "Conference SID and Participant SID are required" });
    }

    try {
      const result = await this.participantService.unmuteParticipant(
        conferenceSid,
        callSid
      );
      Logger.info("Sending /conference/participant/unmute response", {
        result,
      });
      res.status(200).json(result);
    } catch (error: any) {
      Logger.error("Error unmuting participant:", {
        error: error.message,
        stack: error.stack,
      });
      res.status(500).json({ error: "Failed to unmute participant" });
    }
  }

  public async holdParticipant(req: Request, res: Response) {
    const { conferenceName, callSid } = req.body;

    Logger.info("Received /conference/participant/hold request", {
      conferenceName,
      callSid,
    });

    if (!conferenceName || !callSid) {
      return res
        .status(400)
        .json({ error: "Conference name and Participant SID are required" });
    }

    try {
      const result = await this.participantService.holdParticipant(
        conferenceName,
        callSid
      );
      Logger.info("Sending /conference/participant/hold response", { result });
      res.status(200).json(result);
    } catch (error: any) {
      Logger.error("Error holding participant:", {
        error: error.message,
        stack: error.stack,
      });
      res.status(500).json({ error: "Failed to hold participant" });
    }
  }

  public async resumeParticipant(req: Request, res: Response) {
    const { conferenceSid, callSid } = req.body;

    Logger.info("Received /conference/participant/resume request", {
      conferenceSid,
      callSid,
    });

    if (!conferenceSid || !callSid) {
      return res
        .status(400)
        .json({ error: "Conference SID and Participant SID are required" });
    }

    try {
      const result = await this.participantService.resumeParticipant(
        conferenceSid,
        callSid
      );
      Logger.info("Sending /conference/participant/resume response", {
        result,
      });
      res.status(200).json(result);
    } catch (error: any) {
      Logger.error("Error resuming participant:", {
        error: error.message,
        stack: error.stack,
      });
      res.status(500).json({ error: "Failed to resume participant" });
    }
  }

  async getAllParticipants(req: Request, res: Response): Promise<void> {
    try {
      const { conferenceName } = req.query;
      if (!conferenceName || typeof conferenceName !== "string") {
        res.status(400).json({ error: "Conference name is required" });
        return; // <-- Explicit return statement to match void
      }

      const result = await this.participantService.getAllParticipants(
        conferenceName
      );
      res.status(200).json(result);
      return; // <-- Explicit return statement to match void
    } catch (error: any) {
      Logger.error("Error fetching participants:", {
        error: error.message,
        stack: error.stack,
      });
      res.status(500).json({ error: "Failed to fetch participants" });
      return; // <-- Explicit return statement to match void
    }
  }

  async deleteParticipant(req: Request, res: Response): Promise<void> {
    try {
      const { conferenceSid, callSid } = req.body;
      if (!conferenceSid || !callSid) {
        res
          .status(400)
          .json({ error: "Conference SID and Participant SID are required" });
        return;
      }
      const result = await this.participantService.deleteParticipant(
        conferenceSid,
        callSid
      );
      res.status(200).json(result);
      return;
    } catch (error: any) {
      this.logger.error("Error deleting participant:", {
        error: error.message,
        stack: error.stack,
      });
      res.status(500).json({ error: "Failed to delete participant" });
      return;
    }
  }

  async updateParticipant(req: Request, res: Response): Promise<void> {
    try {
      const { conferenceSid, callSid, data } = req.body;
      if (!conferenceSid || !callSid || !data) {
        res.status(400).json({
          error: "Conference SID, Participant SID, and data are required",
        });
        return;
      }
      const result = await this.participantService.updateParticipant(
        conferenceSid,
        callSid,
        data
      );
      res.status(200).json(result);
      return;
    } catch (error: any) {
      this.logger.error("Error updating participant:", {
        error: error.message,
        stack: error.stack,
      });
      res.status(500).json({ error: "Failed to update participant" });
      return;
    }
  }
}
