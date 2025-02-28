import { Router } from "express";
import multer from "multer";

import { SignalWireService } from "./signalwire.service";
import { CallModule } from "./call/call.module";
import { DidModule } from "./did/did.module";
import { StatusModule } from "./status/status.module";
import { VoicemailModule } from "./voicemail/voicemail.module";
import { SignalWireController } from "./signalwire.controller";
import { UserService } from "../user-management/user.service";
import { ConferenceModule } from "./conference/conference.module";

export class SignalWireModule {
  public router: Router;
  private ioServer: any;
  private signalWireController: SignalWireController;
  private userService: UserService;

  constructor(ioServer: any, userService: UserService) {
    this.router = Router();
    this.ioServer = ioServer;
    this.userService = userService;

    // Create shared SignalWireService instance
    const signalWireService = new SignalWireService(ioServer);

    // Initialize controllers with shared service
    this.signalWireController = new SignalWireController(
      ioServer,
      signalWireService
    );

    // Instantiate each submodule with shared service
    const callModule = new CallModule(ioServer, signalWireService);
    const conferenceModule = new ConferenceModule(ioServer, userService);
    const didModule = new DidModule();
    const statusModule = new StatusModule(ioServer);
    const voicemailModule = new VoicemailModule();

    // Mount them
    this.setupRoutes(
      callModule,
      conferenceModule,
      didModule,
      statusModule,
      voicemailModule
    );
  }

  private setupRoutes(
    callModule: CallModule,
    conferenceModule: ConferenceModule,
    didModule: DidModule,
    statusModule: StatusModule,
    voicemailModule: VoicemailModule
  ) {
    // => final: /api/signalwire/call/dial, etc.
    this.router.use("/call", callModule.router);

    // => final: /api/signalwire/conference/connect, etc.
    this.router.use("/conference", conferenceModule.router);

    // => final: /api/signalwire/dids, /api/signalwire/dids/buy, etc.
    this.router.use("/dids", didModule.router);

    // => final: /api/signalwire/webhook/..., /api/signalwire/call-logs/...
    this.router.use("/", statusModule.router);

    // => final: /api/signalwire/voicemail/upload, etc.
    this.router.use("/voicemail", voicemailModule.router);

    // Leftover routes from your old SignalWireController:
    const upload = multer();

    this.router.get("/team-status", (req, res) =>
      this.signalWireController.getTeamStatus(req, res)
    );

    this.router.post("/webhook/incoming-call", (req, res) =>
      this.signalWireController.incomingCallNotification(req, res)
    );
  }
}
