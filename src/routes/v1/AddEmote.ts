import { Response } from "express";
import { Route, RouteConfig } from "../Route";
import { AuthDataRequest, Method } from "../../types/API";
import { Emote } from "../../types/Emotes";
import { HttpStatusCode } from "axios";
import { MongoDBClient } from "../../clients/MongoDBClient";
import { getEmoteSlotsLimit } from "../../util/Common";

export class AddEmote implements Route {
  config(): RouteConfig {
    return {
      method: Method.POST,
      path: "/emotes/add",
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

    const usedSlots = await MongoDBClient.getDefaultInstance().getUsedSlotsCount(req.authData.id);
    if (!usedSlots) {
      res.status(HttpStatusCode.NotModified).send();
      return;
    }
    if (usedSlots >= getEmoteSlotsLimit()) {
      res.send({ msg: "you have reached the limit of slots" });
      return;
    }

    const isInSet = await MongoDBClient.getDefaultInstance().isEmoteInSet(req.authData.id, body.name);
    if (isInSet) {
      res.send({ msg: `emote with name '${body.name}' already exists` });
      return;
    }

    const upserted = await MongoDBClient.getDefaultInstance().addEmote(
      req.authData.id,
      body.name,
      body.emoteId
    );
    res.status(upserted ? HttpStatusCode.NoContent : HttpStatusCode.NotModified).send();
  }
}
