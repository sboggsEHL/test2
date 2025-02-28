import { Router } from "express";
import { SlackController } from "./slack.controller";

export class SlackModule {
  public router: Router;

  constructor() {
    this.router = Router();
    const slackController = new SlackController();

    // Route to sync Slack users
    this.router.get("/sync-users", slackController.syncSlackUsers.bind(slackController));
  }
}
