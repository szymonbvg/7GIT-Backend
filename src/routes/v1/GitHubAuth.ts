import { Request, Response } from "express";
import { Route, RouteConfig } from "../Route";
import { Method } from "../../types/API";
import { HttpStatusCode } from "axios";
import { GithubUserData } from "../../types/UserData";
import { MongoDBClient } from "../../clients/MongoDBClient";
import * as jwt from "jsonwebtoken";
import { getJWTSecretKey } from "../../util/Common";

export class GitHubAuth implements Route {
  config(): RouteConfig {
    return {
      method: Method.POST,
      path: "/auth/github",
    };
  }
  async handler(req: Request, res: Response): Promise<void> {
    try {
      const body = req.body as { code?: string };

      const data = new FormData();
      data.append("client_id", process.env.GITHUB_CLIENT_ID);
      data.append("client_secret", process.env.GITHUB_CLIENT_SECRET);
      data.append("code", body.code);
      data.append("redirect_uri", process.env.GITHUB_REDIRECT_URI);

      const OAuthRes = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        body: data,
      });
      const text = await OAuthRes.text();
      const params = new URLSearchParams(text);
      const accessToken = params.get("access_token");

      const userDataRes = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `token ${accessToken}`,
        },
      });
      const userData = (await userDataRes.json()) as GithubUserData;

      if (!userData.login || !userData.avatar_url || !userData.id) {
        res.status(HttpStatusCode.Unauthorized).send();
        return;
      }

      const inserted = await MongoDBClient.getDefaultInstance().addUser(userData);
      if (!inserted) {
        res.status(HttpStatusCode.Unauthorized).send();
        return;
      }

      jwt.sign(userData, getJWTSecretKey(), (err, token) => {
        if (err || !token) {
          res.status(HttpStatusCode.Unauthorized).send();
          return;
        }
        res.send({ token });
      });
    } catch (e) {
      res.status(HttpStatusCode.Unauthorized).send();
    }
  }
}
