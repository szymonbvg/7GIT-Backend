import { Request, Response } from "express";
import { Route, RouteConfig } from "../Route";
import { Method } from "../../types/API";
import { MongoDBClient } from "../../clients/MongoDBClient";

export class GetEmoteSet implements Route {
  config(): RouteConfig {
    return {
      method: Method.GET,
      path: "/users/:user/emotes",
    };
  }
  async handler(req: Request, res: Response): Promise<void> {
    const { user } = req.params;
    const emotes = await MongoDBClient.getDefaultInstance().fetchEmoteSet({ username: user });

    res.send({ emotes });
  }
}
