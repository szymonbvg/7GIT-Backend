import { ExpressServer } from "./ExpressServer";
import { getServerPort } from "./util/Common";
import { Logger } from "./util/Logger";

async function main() {
  if (
    !process.env.GITHUB_CLIENT_ID ||
    !process.env.GITHUB_CLIENT_SECRET ||
    !process.env.GITHUB_REDIRECT_URI
  ) {
    throw new Error("GitHub OAuth data not set");
  }

  if (!process.env.JWT_SECRET_KEY) {
    throw new Error("JWT secret key not set");
  }

  const server = new ExpressServer();
  server.init();

  Logger.log("info", `Server successfully launched on port ${getServerPort()}`);
}

main().catch((e) => {
  Logger.log("error", e);
  process.exit();
});
