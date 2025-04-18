import express from "express";
import * as cors from "cors";
import helmet from "helmet";
import bodyParser from "body-parser";
import { authMiddleware } from "./middleware/auth";
import { getServerPort } from "./util/Common";
import { V1 } from "./routes/v1";

export class ExpressServer {
  private app: express.Application = express();

  constructor() {}

  public init() {
    this.app.use(authMiddleware);
    this.app.use(cors.default());
    this.app.use(express.json());
    this.app.use(helmet());
    this.app.use(bodyParser.json());

    V1.init(this.app);

    this.app.listen(getServerPort());
  }
}
