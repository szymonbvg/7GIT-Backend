import { Response } from "express";
import { Route, RouteConfig } from "../Route";
import { AuthDataRequest, Method } from "../../types/API";
import { EmoteSet } from "../../types/Emotes";
import { HttpStatusCode } from "axios";
import { MongoDBClient } from "../../clients/MongoDBClient";

export class UpdateEmoteSet implements Route {
  config(): RouteConfig {
    return {
      method: Method.POST,
      path: "/update/emote_set",
    };
  }
  async handler(req: AuthDataRequest, res: Response): Promise<void> {
    const body = req.body as { data?: EmoteSet };

    if (!req.authData) {
      res.status(HttpStatusCode.Unauthorized).send();
      return;
    }

    if (!Array.isArray(body.data) || body.data.some((e) => !e.emoteId || !e.name)) {
      res.status(HttpStatusCode.NotModified).send();
      return;
    }

    const updated = await MongoDBClient.getDefaultInstance().updateEmoteSet(req.authData, body.data);
    res.status(updated ? HttpStatusCode.NoContent : HttpStatusCode.NotModified).send();
  }
}
