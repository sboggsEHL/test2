import { Router } from "express";
import { ConferenceController } from "./conference.controller";
import { ConferenceService } from "./conference.service";
import { ParticipantModule } from "./participant/participant.module";
import { UserService } from "../../user-management/user.service";

export class ConferenceModule {
  public router: Router;
  private conferenceController: ConferenceController;
  private conferenceService: ConferenceService;
  private ioServer: any;

  constructor(ioServer: any, userService: UserService) {
    this.ioServer = ioServer;
    this.router = Router();
    
    // Create shared service
    this.conferenceService = new ConferenceService(ioServer, userService);
    
    // Create controllers/modules
    this.conferenceController = new ConferenceController(this.ioServer, this.conferenceService);
    const participantModule = new ParticipantModule(this.conferenceService);
    
    this.setupRoutes(participantModule);
  }

  private setupRoutes(participantModule: ParticipantModule): void {
    // Basic conference routes
    this.router.post("/connect", (req, res, next) => 
      this.conferenceController.getOrCreateConferenceRoom(req, res, next));
      
    this.router.post("/disconnect", (req, res, next) => 
      this.conferenceController.disconnectConference(req, res, next));
      
    this.router.get("/list", (req, res, next) => 
      this.conferenceController.listAllConferences(req, res, next));
      
    this.router.get("/retrieve", (req, res, next) => 
      this.conferenceController.retrieveConference(req, res, next));
      
    this.router.post("/active", (req, res, next) => 
      this.conferenceController.getActiveConference(req, res, next));
      
    this.router.post("/dtmf", (req, res, next) => 
      this.conferenceController.sendConferenceDtmf(req, res, next));

    // Mount the participant router at /participant
    // => /api/signalwire/conference/participant/*
    this.router.use("/participant", participantModule.router);

    // Transfer endpoints
    this.router.post("/transfer/blind", (req, res, next) => 
      this.conferenceController.blindTransfer(req, res, next));
      
    this.router.post("/transfer/hangup", (req, res, next) => 
      this.conferenceController.hangupCall(req, res, next));
      
    this.router.post("/transfer/attended", (req, res, next) => 
      this.conferenceController.attendedTransfer(req, res, next));
  }
}
