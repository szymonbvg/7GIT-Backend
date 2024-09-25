import { Request, Response } from "express";
import { MongoDBClient } from "../../clients/MongoDBClient";
import { Emote, EmoteSet } from "../../types/Emotes";
import { getTokenData } from "../../util/Common";
import { HttpStatusCode } from "axios";
import { getEmoteSlotsLimit } from "../../util/Config";

type UpdateBody = {
  type: "set" | "emote";
  data: EmoteSet | Emote;
};

export class EmotesController {
  async getEmoteSet(req: Request, res: Response) {
    const { user } = req.params;

    const emoteSet = await MongoDBClient.getDefaultInstance().fetchEmoteSet({ username: user });
    res.send({ emotes: emoteSet });
  }

  async getEmote(req: Request, res: Response) {
    const { id } = req.params;

    const payload = getTokenData(req);
    if (!payload) {
      res.status(HttpStatusCode.Unauthorized).send();
      return;
    }

    const data = await MongoDBClient.getDefaultInstance().getEmoteById(payload.id, id);
    res.send({ emoteData: data });
  }

  async addEmote(req: Request, res: Response) {
    const body = req.body as Emote;

    if (body.emoteId && body.name) {
      const payload = getTokenData(req);
      if (!payload) {
        res.status(HttpStatusCode.Unauthorized).send();
        return;
      }

      const emotes = await MongoDBClient.getDefaultInstance().fetchEmoteSet({ userId: payload.id });
      if (emotes && emotes.length >= getEmoteSlotsLimit()) {
        res.status(HttpStatusCode.Ok).send({ msg: "you have reached the limit of slots" });
        return;
      }

      const exists = await MongoDBClient.getDefaultInstance().isEmoteInSet(payload.id, body.name);
      if (exists) {
        res.status(HttpStatusCode.Ok).send({ msg: `emote with name '${body.name}' already exists` });
        return;
      }

      const added = await MongoDBClient.getDefaultInstance().addEmote(payload.id, body.name, body.emoteId);
      if (added) {
        res.status(HttpStatusCode.NoContent).send();
        return;
      }
    }
    res.status(HttpStatusCode.NotModified).send();
  }

  async removeEmote(req: Request, res: Response) {
    const body = req.body as { emoteId: string };

    if (body.emoteId) {
      const payload = getTokenData(req);
      if (!payload) {
        res.status(HttpStatusCode.Unauthorized).send();
        return;
      }

      const removed = await MongoDBClient.getDefaultInstance().removeEmote(payload.id, body.emoteId);
      if (removed) {
        res.status(HttpStatusCode.NoContent).send();
        return;
      }
    }
    res.status(HttpStatusCode.NotModified).send();
  }

  async update(req: Request, res: Response) {
    const body = req.body as UpdateBody;
    const payload = getTokenData(req);
    if (!payload) {
      res.status(HttpStatusCode.Unauthorized).send();
      return;
    }

    let updated = false;
    switch (body.type) {
      case "set": {
        const data = body.data as EmoteSet;
        if (!Array.isArray(data) || data.some((i) => !i.emoteId || !i.name)) {
          break;
        }

        updated = await MongoDBClient.getDefaultInstance().updateEmoteSet(payload, body.data as EmoteSet);
        break;
      }
      case "emote": {
        const data = body.data as Emote;
        if (!data) {
          break;
        }

        const exists = await MongoDBClient.getDefaultInstance().isEmoteInSet(payload.id, data.name);
        if (exists) {
          res.status(HttpStatusCode.Ok).send({ msg: `emote with name '${data.name}' already exists` });
          return;
        }

        updated = await MongoDBClient.getDefaultInstance().updateEmoteName(
          payload.id,
          data.emoteId,
          data.name
        );
        break;
      }
    }
    res.status(updated ? HttpStatusCode.NoContent : HttpStatusCode.NotModified).send();
  }
}
