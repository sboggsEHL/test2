import { Router } from "express";
import { UserStatusController } from "./user-status.controller";

export class UserStatusModule {
  public router: Router;
  private userStatusController: UserStatusController;

  constructor() {
    this.router = Router();
    this.userStatusController = new UserStatusController();
    this.setupRoutes();
  }

  private setupRoutes() {
    this.router.post(
      "/update-status",
      this.userStatusController.update.bind(this.userStatusController)
    );
  }
}