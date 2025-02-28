import { Router } from "express";
import { UserController } from "./user.controller";
import { verifyToken } from "../middlewares/jwt.js";
import authenticateUser from "../middlewares/auth";
import { UserService } from "./user.service";

export class UserModule {
  public router: Router;
  private userController: UserController;

  constructor(userService: UserService) {
    this.router = Router();
    this.userController = new UserController(userService);
    this.setupRoutes();
  }

  private setupRoutes() {
    this.router.post(
      "/login",
      authenticateUser,
      this.userController.login.bind(this.userController)
    );

    this.router.get(
      "/license/:userName",
      verifyToken,
      this.userController.retrieveLicenseInfo.bind(this.userController)
    );
    // NEW: Create a User (POST /api/user)
    this.router.post(
      "/",
      verifyToken, // or some role-based middleware
      this.userController.createUser.bind(this.userController)
    );
    // NEW: Get All Users
    this.router.get(
      "/",
      verifyToken, // or role-based check
      this.userController.getAllUsers.bind(this.userController)
    );
    // NEW: Get One User by username
    this.router.get(
      "/:username",
      verifyToken,
      this.userController.getUserByUsername.bind(this.userController)
    );

    // NEW: Edit User
    this.router.put(
      "/:id",
      verifyToken, // or role-based check
      this.userController.updateUser.bind(this.userController)
    );

    // NEW: Reset Password
    this.router.post(
      "/:id/reset_password",
      verifyToken, // or role-based check
      this.userController.resetPassword.bind(this.userController)
    );

    this.router.post(
      "/slackreset",
      this.userController.initiateSlackPasswordReset.bind(this.userController)
    );

    this.router.post(
      "/slackbot_update_password",
      // Possibly no auth or a secret if you want
      this.userController.slackbotUpdatePassword.bind(this.userController)
    );
  }
}
