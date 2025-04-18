import { Response, Request } from "express";
import { Method } from "../types/API";

export type RouteConfig = {
  method: Method;
  path: string;
};

export interface Route {
  config(): RouteConfig;
  handler(req: Request, res: Response): Promise<void>;
}