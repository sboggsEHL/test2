// Server Side/src/signalwire/conference/conference.controller.ts
import { Request, Response, NextFunction } from "express";
import { Logger } from "../../shared/logger";
import { ConferenceService } from "./conference.service";
import { UserService } from "../../user-management/user.service";

export class ConferenceController {
  private conferenceService;
  private ioServer: any;

  constructor(ioServer: any, conferenceService: ConferenceService) {
    this.ioServer = ioServer;
    this.conferenceService = conferenceService;
  }

  public async getOrCreateConferenceRoom(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const { conferenceName } = req.body;
    Logger.info("Received /conference/connect request", { conferenceName });
    if (!conferenceName) {
      res.status(400).json({ error: "Conference name is required" });
      return;
    }
    try {
      const result = await this.conferenceService.createOrFetchConferenceRoom(
        conferenceName
      );
      Logger.info("Sending /conference/connect response", { result });
      res.status(200).json(result);
    } catch (error: any) {
      Logger.error("Error connecting to conference:", {
        error: error.message,
        stack: error.stack,
      });
      next(error);
    }
  }

  public async disconnectConference(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const { conferenceName } = req.body;
    Logger.info("Received /conference/disconnect request", { conferenceName });
    if (!conferenceName) {
      res.status(400).json({ error: "Conference name is required" });
      return;
    }
    try {
      const result = await this.conferenceService.disconnectConference(
        conferenceName
      );
      Logger.info("Sending /conference/disconnect response", { result });
      res.status(200).json(result);
    } catch (error: any) {
      Logger.error("Error disconnecting conference:", {
        error: error.message,
        stack: error.stack,
      });
      next(error);
    }
  }

  /**
   * GET /conference/list
   * Lists all conferences.
   */
  public async listAllConferences(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    Logger.info("Received /conference/list request");
    try {
      const result = await this.conferenceService.listAllConferences();
      Logger.info("Sending /conference/list response", { result });
      res.status(200).json(result);
    } catch (error: any) {
      Logger.error("Error listing all conferences:", {
        error: error.message,
        stack: error.stack,
      });
      next(error);
    }
  }
  /**
   * GET /conference/retrieve
   * Retrieves a specific conference by its SID.
   */
  public async retrieveConference(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const { conferenceSid } = req.query;
    Logger.info("Received /conference/retrieve request", { conferenceSid });
    if (!conferenceSid) {
      res.status(400).json({ error: "Conference SID is required" });
      return;
    }
    try {
      const result = await this.conferenceService.retrieveConference(
        String(conferenceSid)
      );
      Logger.info("Sending /conference/retrieve response", { result });
      res.status(200).json(result);
    } catch (error: any) {
      Logger.error("Error retrieving conference:", {
        error: error.message,
        stack: error.stack,
      });
      next(error);
    }
  }

  /**
   * POST /conference/active
   * Gets the active conference by name.
   */
  public async getActiveConference(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const { conferenceName } = req.body;
    Logger.info("Received /conference/active request", { conferenceName });
    if (!conferenceName) {
      res.status(400).json({ error: "conferenceName is required" });
      return;
    }
    try {
      const result = await this.conferenceService.getActiveConference(
        String(conferenceName)
      );
      Logger.info("Sending /conference/active response", { result });
      res.status(200).json(result);
    } catch (error: any) {
      Logger.error("Error fetching active conference:", {
        error: error.message,
        stack: error.stack,
      });
      next(error);
    }
  }

  /**
   * POST /conference/dtmf
   * Sends DTMF tones to a conference.
   */
  public async sendConferenceDtmf(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const { callSid, dtmfTones, lamlBinUrl } = req.body;
    try {
      const results = await this.conferenceService.sendConferenceDtmfTone(
        callSid,
        dtmfTones,
        lamlBinUrl
      );
      res.status(200).json({
        message: "DTMF tones sent successfully to conference participants",
        results,
      });
    } catch (error: any) {
      Logger.error("Error sending DTMF tones", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      next(error);
    }
  }

  // =======================================
  // Attended and Unattended Transfer
  // =======================================

  /**
   * BLIND TRANSFER
   * POST /conference/transfer/blind
   * Body: { callSid: string, targetUsername: string }
   */
  public async blindTransfer(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { callSid, targetUsername } = req.body;

      if (!callSid || !targetUsername) {
        res
          .status(400)
          .json({ error: "callSid and targetUsername are required" });
        return;
      }

      const result = await this.conferenceService.blindTransfer(
        callSid,
        targetUsername
      );

      res.status(200).json(result);
    } catch (error: any) {
      Logger.error("Controller error in blindTransfer", {
        error: error.message,
        stack: error.stack,
      });
      next(error);
    }
  }

  /**
   * HANGUP CALL
   * POST /conference/transfer/hangup
   * Body: { callSid: string }
   */
  public async hangupCall(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { callSid } = req.body;
      if (!callSid) {
        res.status(400).json({ error: "callSid is required" });
        return;
      }
      const result = await this.conferenceService.hangupCall(callSid);
      res.status(200).json(result);
    } catch (error: any) {
      Logger.error("Controller error in hangupCall", {
        error: error.message,
        stack: error.stack,
      });
      next(error);
    }
  }

  /**
   * ATTENDED (WARM) TRANSFER
   * POST /conference/transfer/attended
   * Body: {
   *   conferenceSid: string,
   *   originalCallSid: string,
   *   consultFrom: string,
   *   consultTo: string,
   *   consultUrl: string
   * }
   */
  public async attendedTransfer(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const {
        conferenceSid,
        originalCallSid,
        consultFrom,
        consultTo,
        consultUrl,
        username,
      } = req.body;
      if (
        !conferenceSid ||
        !originalCallSid ||
        !consultFrom ||
        !consultTo ||
        !consultUrl ||
        !username
      ) {
        res.status(400).json({
          error:
            "conferenceSid, originalCallSid, consultFrom, consultTo, consultUrl, username are required",
        });
        return;
      }

      // 1) Hold the original participant
      await this.conferenceService.holdOriginalParticipant(
        conferenceSid,
        originalCallSid
      );

      // 2) Dial out to target agent's conference
      const consultCall = await this.conferenceService.createConsultationCall(
        consultFrom,
        consultTo,
        consultUrl,
        originalCallSid,
        username
      );

      res.status(200).json({
        message: "Attended transfer initiated",
        ...consultCall,
      });
    } catch (error: any) {
      Logger.error("Controller error in attendedTransfer", {
        error: error.message,
        stack: error.stack,
      });
      next(error);
    }
  }
}
