import { NextFunction, Request, Response } from "express";
import { AuthDataRequest } from "../types/API";
import * as jwt from "jsonwebtoken";
import { getJWTSecretKey } from "../util/Common";
import { AuthData } from "../types/UserData";

export function authMiddleware(req: AuthDataRequest, _res: Response, next: NextFunction) {
  try {
    const token = req.get("X-Auth-Token");
    if (!token) {
      next();
      return;
    }
    jwt.verify(token, getJWTSecretKey(), (_err, decoded) => {
      req.authData = decoded as AuthData;
      next();
    })
  } catch (e) {
    next();
  }
}
