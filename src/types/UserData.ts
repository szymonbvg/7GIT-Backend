import { ObjectId } from "mongodb";
import { EmoteSet } from "./Emotes";
import { JwtPayload } from "jsonwebtoken";

export type UserData = {
  _id: ObjectId;
  id: number;
  emotes: EmoteSet;
  username: string;
};

export type GithubUserData = {
  id: number;
  login: string;
  avatar_url: string;
};

export type Payload = GithubUserData & JwtPayload;
