import { Route } from "./Route";
import express from "express";

export type VersionConfig = {
  prefix: string;
  routes: Route[];
};

export abstract class Version {
  abstract config(): VersionConfig;
  static init<T extends Version>(this: new () => T, app: express.Application): Version {
    const v = new this();
    const cfg = v.config();

    for (const route of cfg.routes) {
      const c = route.config();
      app[c.method](`${cfg.prefix}${c.path}`, (req, res) => {
        route.handler(req, res);
      });
    }

    return v;
  }
}
