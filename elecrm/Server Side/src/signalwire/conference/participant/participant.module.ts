import { Router } from "express";
import { ParticipantController } from "./participant.controller";
import { ParticipantService } from "./participant.service";
import { ConferenceService } from "../conference.service";

export class ParticipantModule {
  public router: Router;
  private participantController: ParticipantController;
  private participantService: ParticipantService;

  constructor(conferenceService: ConferenceService) {
    this.router = Router();
    
    // Create service and controller
    this.participantService = new ParticipantService(conferenceService);
    this.participantController = new ParticipantController(conferenceService);
    
    this.setupRoutes();
  }

  private setupRoutes() {
    this.router.post("/add", (req, res) => 
      this.participantController.addParticipant(req, res));
      
    this.router.post("/mute", (req, res) => 
      this.participantController.muteParticipant(req, res));
      
    this.router.post("/unmute", (req, res) => 
      this.participantController.unmuteParticipant(req, res));
      
    this.router.post("/hold", (req, res) => 
      this.participantController.holdParticipant(req, res));
      
    this.router.post("/resume", (req, res) => 
      this.participantController.resumeParticipant(req, res));
      
    this.router.get("/getAll", (req, res) => 
      this.participantController.getAllParticipants(req, res));
      
    this.router.delete("/delete", (req, res) => 
      this.participantController.deleteParticipant(req, res));
      
    this.router.put("/update", (req, res) => 
      this.participantController.updateParticipant(req, res));
  }
}
