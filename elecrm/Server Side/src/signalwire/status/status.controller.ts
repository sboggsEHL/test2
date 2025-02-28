import { Request, Response } from "express";
import { StatusService } from "./status.service";
import { SignalWireService } from "../signalwire.service";
import { Logger } from "../../shared/logger";

export class StatusController {
  private statusService: StatusService;
  private signalWireService: SignalWireService;

  constructor(private ioServer: any) {
    // Create SignalWireService instance
    this.signalWireService = new SignalWireService(ioServer);
    // Pass both ioServer and SignalWireService to StatusService
    this.statusService = new StatusService(ioServer, this.signalWireService);
  }

  /**
   * POST /webhook/recording-status-callback
   * Receives and processes recording status callbacks.
   */
  public async recordingStatusCallback(req: Request, res: Response): Promise<void> {
    try {
      await this.statusService.recordingStatusCallback(req.body);
      res.status(200).send("OK");
    } catch (error: any) {
      Logger.error("Error in recordingStatusCallback", { error: error.message });
      res.status(500).send("Failed to update call logs");
    }
  }

  /**
   * POST /webhook/voice-status-callback
   * Receives and processes voice status callbacks.
   */
  public async voiceStatusCallback(req: Request, res: Response): Promise<void> {
    try {
      await this.statusService.voiceStatusCallback(req.body);
      res.status(200).send("Status callback processed successfully");
    } catch (error: any) {
      Logger.error("Error in voiceStatusCallback", { error: error.message });
      res.status(500).send("Failed to process status callback");
    }
  }

  /**
   * POST /call-logs/call-status
   * Processes call status updates.
   */
  public async callStatusUpdate(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.statusService.callStatusUpdate(req.body);
      res.status(200).json({ message: "Call status processed successfully", result });
    } catch (error: any) {
      Logger.error("Error in callStatusUpdate", { error: error.message });
      res.status(500).json({ error: "Failed to process call status update" });
    }
  }
}
