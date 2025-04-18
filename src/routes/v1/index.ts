import { Version, VersionConfig } from "../Version";
import { AddEmote } from "./AddEmote";
import { GetEmote } from "./GetEmote";
import { GetEmoteSet } from "./GetEmoteSet";
import { GitHubAuth } from "./GitHubAuth";
import { RemoveEmote } from "./RemoveEmote";
import { UpdateEmote } from "./UpdateEmote";
import { UpdateEmoteSet } from "./UpdateEmoteSet";

export class V1 extends Version {
  config(): VersionConfig {
    return {
      prefix: "/v1",
      routes: [
        new GitHubAuth(),
        new GetEmote(),
        new GetEmoteSet(),
        new RemoveEmote(),
        new AddEmote(),
        new UpdateEmote(),
        new UpdateEmoteSet(),
      ],
    };
  }
}
