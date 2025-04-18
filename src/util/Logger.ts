import pino, { Level } from "pino";
import { getLoggingDirectory } from "./Common";

export class Logger {
  private static pino?: pino.Logger;
  private static day?: number;

  public static initPino() {
    const date = new Date();
    this.day = date.getDate();
    const parsedDate = date.toISOString().split("T")[0];

    this.pino = pino(
      pino.transport({
        targets: [
          { level: "trace", target: "pino-pretty" },
          {
            level: "trace",
            target: "pino/file",
            options: { destination: `${getLoggingDirectory()}/${parsedDate}.log` },
          },
        ],
      })
    );
  }

  public static log(level: Level, data: unknown) {
    const date = new Date();
    if (date.getDate() !== this.day || !this.pino) {
      this.initPino();
    }

    this.pino![level](data);
  }
}
