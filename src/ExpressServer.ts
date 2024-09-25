import express from "express";
import * as cors from "cors";
import helmet from "helmet";
import bodyParser from "body-parser";
import { AuthRouter } from "./routes/v1/AuthRouter";
import { EmotesRouter } from "./routes/v1/EmotesRouter";

export class ExpressServer {
  private app: express.Application;

  constructor() {
    this.app = express();
  }

  private controlRoutes() {
    const routers = [new AuthRouter(), new EmotesRouter()];

    for (const router of routers) {
      router.handleRoutes();
      this.app.use(router.path(), router.getInstance());
    }
  }

  public init(port: number): boolean {
    try {
      this.app.use(cors.default());
      this.app.use(express.json());
      this.app.use(helmet());
      this.app.use(bodyParser.json());

      this.controlRoutes();

      this.app.listen(port ?? 3000);

      return true;
    } catch (e) {
      return false;
    }
  }
}
