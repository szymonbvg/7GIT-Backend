import { Request, Response } from "express";
import "dotenv/config";
import * as jwt from "jsonwebtoken";
import { MongoDBClient } from "../../clients/MongoDBClient";
import { getJWTSecretKey } from "../../util/Config";
import { GithubUserData } from "../../types/UserData";
import { HttpStatusCode } from "axios";

export class AuthController {
  async handleGithubLogin(req: Request, res: Response) {
    try {
      const body = req.body as { code: string };

      const data = new FormData();
      data.append("client_id", process.env.GITHUB_CLIENT_ID);
      data.append("client_secret", process.env.GITHUB_CLIENT_SECRET);
      data.append("code", body.code);
      data.append("redirect_uri", process.env.GITHUB_REDIRECT_URI);

      const OAuthRes = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        body: data,
      });
      const paramsStr = await OAuthRes.text();
      const params = new URLSearchParams(paramsStr);
      const accessToken = params.get("access_token");
      const userDataRes = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `token ${accessToken}`,
        },
      });
      const parsed = await userDataRes.json();
      const { login, avatar_url, id } = parsed as GithubUserData;
      const userData: GithubUserData = {
        id: id,
        login: login,
        avatar_url: avatar_url,
      };

      if (userData.id && userData.login && userData.avatar_url) {
        await MongoDBClient.getDefaultInstance().addUser(userData);

        const token = jwt.sign(userData, getJWTSecretKey());
        res.send({ token: token });
        return;
      }
      res.status(HttpStatusCode.Unauthorized).send();
    } catch (e) {
      res.status(HttpStatusCode.Unauthorized).send();
    }
  }
}
