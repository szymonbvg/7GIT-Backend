import { Response } from "express";
import { Route, RouteConfig } from "../Route";
import { AuthDataRequest, Method } from "../../types/API";
import { Emote } from "../../types/Emotes";
import { HttpStatusCode } from "axios";
import { MongoDBClient } from "../../clients/MongoDBClient";

export class UpdateEmote implements Route {
  config(): RouteConfig {
    return {
      method: Method.POST,
      path: "/update/emote",
    };
  }
  async handler(req: AuthDataRequest, res: Response): Promise<void> {
    const body = req.body as Partial<Emote>;

    if (!req.authData) {
      res.status(HttpStatusCode.Unauthorized).send();
      return;
    }

    if (!body.emoteId || !body.name) {
      res.status(HttpStatusCode.NotModified).send();
      return;
    }

    const isInSet = await MongoDBClient.getDefaultInstance().isEmoteInSet(req.authData.id, body.name);
    if (isInSet) {
      res.send({ msg: `emote with name '${body.name}' already exists` });
      return;
    }

    const updated = await MongoDBClient.getDefaultInstance().updateEmoteName(
      req.authData.id,
      body.emoteId,
      body.name
    );
    res.status(updated ? HttpStatusCode.NoContent : HttpStatusCode.NotModified).send();
  }
}
