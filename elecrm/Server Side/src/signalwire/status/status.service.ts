import { query } from "../signalwire.database";
import { Logger } from "../../shared/logger";
import { SignalWireService } from "../signalwire.service";

export class StatusService {
  private ioServer: any;
  private signalWireService: SignalWireService;

  constructor(ioServer: any, signalWireService: SignalWireService) {
    this.ioServer = ioServer;
    this.signalWireService = signalWireService;
  }

  /**
   * Processes the recording status callback data by updating the call log through SignalWireService.
   */
  public async recordingStatusCallback(data: any): Promise<void> {
    const { CallSid, ConferenceSid, RecordingSid, RecordingUrl, RecordingDuration } = data;
    Logger.info("Received Recording Status Callback", { CallSid, ConferenceSid, RecordingSid, RecordingUrl, RecordingDuration });

    if (!CallSid && !ConferenceSid) {
      Logger.warn("Missing required fields - no CallSid or ConferenceSid", { CallSid, ConferenceSid });
      throw new Error("Missing callSid or conferenceSid");
    }

    if (!RecordingUrl) {
      Logger.warn("Missing RecordingUrl in recording callback", { CallSid, ConferenceSid });
      throw new Error("Missing RecordingUrl");
    }

    const sidUsedForLookup = CallSid || ConferenceSid;
    const parsedDuration = RecordingDuration ? parseInt(RecordingDuration, 10) : undefined;

    // Get existing record to maintain values
    const existingRecord = await query(
      "SELECT * FROM call_logs WHERE call_sid = $1",
      [sidUsedForLookup]
    );
    
    if (!existingRecord.rows.length) {
      Logger.warn("No existing call log found for recording update", { sidUsedForLookup });
      throw new Error("No matching record found");
    }

    const existing = existingRecord.rows[0];
    
    // Update with existing values and new recording info
    await this.signalWireService.logCallStatus(
      sidUsedForLookup,
      existing.call_status,
      existing.direction,
      existing.from_number,
      existing.to_number,
      parsedDuration || existing.call_duration,
      RecordingUrl,
      existing.participant_sid,
      existing.conference_sid
    );

    Logger.info("Recording URL updated", { sidUsedForLookup, RecordingUrl, updatedDuration: parsedDuration });
  }

  /**
   * Processes call status update data by using SignalWireService's logCallStatus.
   */
  public async callStatusUpdate(data: any): Promise<any> {
    try {
      const { CallSid, CallStatus, Direction, From, To, CallDuration, RecordingUrl } = data;
      Logger.info("Logging the call status update", { From, To, CallSid });
      
      return await this.signalWireService.logCallStatus(
        CallSid,
        CallStatus,
        Direction,
        From,
        To,
        CallDuration ? parseInt(CallDuration, 10) : undefined,
        RecordingUrl
      );
    } catch (error: any) {
      Logger.error("Error updating call status", { error: error.message });
      throw new Error("Failed to update call status");
    }
  }

  /**
   * Processes the voice status callback by updating call logs and emitting a call-ended event if needed.
   */
  public async voiceStatusCallback(data: any): Promise<void> {
    const { CallSid, CallStatus, From, To, Direction, CallDuration, HangupDirection, HangupBy, recordingUrl } = data;
    Logger.info("Received voice status callback", { CallSid, CallStatus, From, To, Direction, CallDuration, HangupDirection, HangupBy, recordingUrl });

    try {
      // Update the call log using SignalWireService's logCallStatus
      await this.signalWireService.logCallStatus(
        CallSid,
        CallStatus,
        Direction,
        From,
        To,
        CallDuration ? parseInt(CallDuration, 10) : undefined,
        HangupDirection,
        HangupBy,
        recordingUrl
      );

      // Emit the call-ended event if the call has ended
      const endedStatuses = ["completed", "canceled", "busy", "failed", "no-answer"];
      if (endedStatuses.includes(CallStatus.toLowerCase())) {
        Logger.info("Emitting call-ended event", { CallSid, CallStatus });
        this.ioServer.emit("call-ended", { callSid: CallSid, status: CallStatus });
      }
    } catch (error: any) {
      Logger.error("Error processing voice status callback", { error: error.message });
      throw new Error("Failed to process voice status callback");
    }
  }
}
