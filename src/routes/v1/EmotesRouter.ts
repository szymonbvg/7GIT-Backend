import { Router } from "express";
import { RoutesHandler } from "../RoutesHandler";
import { EmotesController } from "../../controllers/v1/EmotesController";

export class EmotesRouter implements RoutesHandler {
  private router: Router;
  private controller: EmotesController;

  constructor() {
    this.router = Router();
    this.controller = new EmotesController();
  }

  getInstance(): Router {
    return this.router;
  }
  handleRoutes(): void {
    this.router.get("/:user", this.controller.getEmoteSet);
    this.router.get("/emote/:id", this.controller.getEmote);
    this.router.post("/update", this.controller.update);
    this.router.post("/add", this.controller.addEmote);
    this.router.post("/remove", this.controller.removeEmote);
  }
  path(): string {
    return "/v1/emotes";
  }
}
