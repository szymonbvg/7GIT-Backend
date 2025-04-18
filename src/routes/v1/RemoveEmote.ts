import { Response } from "express";
import { Route, RouteConfig } from "../Route";
import { AuthDataRequest, Method } from "../../types/API";
import { HttpStatusCode } from "axios";
import { MongoDBClient } from "../../clients/MongoDBClient";

export class RemoveEmote implements Route {
  config(): RouteConfig {
    return {
      method: Method.POST,
      path: "/emotes/remove",
    };
  }
  async handler(req: AuthDataRequest, res: Response): Promise<void> {
    const body = req.body as { emoteId?: string };

    if (!req.authData) {
      res.status(HttpStatusCode.Unauthorized).send();
      return;
    }

    if (!body.emoteId) {
      res.status(HttpStatusCode.NotModified).send();
      return;
    }

    const removed = await MongoDBClient.getDefaultInstance().removeEmote(req.authData.id, body.emoteId);
    res.status(removed ? HttpStatusCode.NoContent : HttpStatusCode.NotModified).send();
  }
}
