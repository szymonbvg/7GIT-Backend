import { Request } from "express";
import { AuthData } from "./UserData";

export enum Method {
  GET = "get",
  POST = "post",
  PUT = "put",
  PATCH = "patch",
  DELETE = "delete",
  OPTIONS = "options",
  LINK = "link",
  UNLINK = "unlink",
}

export type AuthDataRequest = Request & { authData?: AuthData };
