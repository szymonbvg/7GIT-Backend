import { Response } from "express";
import { Route, RouteConfig } from "../Route";
import { AuthDataRequest, Method } from "../../types/API";
import { HttpStatusCode } from "axios";
import { MongoDBClient } from "../../clients/MongoDBClient";

export class GetEmote implements Route {
  config(): RouteConfig {
    return {
      method: Method.GET,
      path: "/emotes/:id",
    };
  }
  async handler(req: AuthDataRequest, res: Response): Promise<void> {
    const { id } = req.params;

    if (!req.authData) {
      res.status(HttpStatusCode.Unauthorized).send();
      return;
    }

    const emoteData = await MongoDBClient.getDefaultInstance().getEmoteById(req.authData.id, id);
    res.send({ emoteData });
  }
}
