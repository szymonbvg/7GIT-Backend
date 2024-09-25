import { Request } from "express";
import { Payload } from "../types/UserData";
import * as jwt from "jsonwebtoken";
import { getJWTSecretKey } from "./Config";

export function getTokenData(request: Request): Payload | undefined {
  const token = request.header("X-Auth-Token") ?? "";
  try {
    const payload = jwt.verify(token, getJWTSecretKey()) as Payload;
    return payload;
  } catch (e) {
    return undefined;
  }
}
