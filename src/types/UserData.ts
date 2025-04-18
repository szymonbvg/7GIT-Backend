import { JwtPayload } from "jsonwebtoken";

export type GithubUserData = {
  id: number;
  login: string;
  avatar_url: string;
};

export type AuthData = GithubUserData & JwtPayload;
