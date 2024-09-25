import { Router } from "express";
import { RoutesHandler } from "../RoutesHandler";
import { AuthController } from "../../controllers/v1/AuthController";

export class AuthRouter implements RoutesHandler {
  private router: Router;
  private controller: AuthController;

  constructor() {
    this.router = Router();
    this.controller = new AuthController();
  }

  getInstance(): Router {
    return this.router;
  }
  handleRoutes(): void {
    this.router.post("/github", this.controller.handleGithubLogin);
  }
  path(): string {
    return "/v1/auth";
  }
}
