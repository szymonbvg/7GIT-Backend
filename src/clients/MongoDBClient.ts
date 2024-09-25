import { Document, Filter, MongoClient } from "mongodb";
import { getMongoURI } from "../util/Config";
import { EmoteSet } from "../types/Emotes";
import { GithubUserData, UserData } from "../types/UserData";
import { Payload } from "../types/UserData";
import { Logger } from "../util/Logger";

export class MongoDBClient {
  private client: MongoClient;
  private static default: MongoDBClient;

  constructor() {
    this.client = new MongoClient(getMongoURI());
  }

  static getDefaultInstance() {
    if (!this.default) {
      this.default = new MongoDBClient();
    }
    return this.default;
  }

  async addUser(userData: GithubUserData) {
    try {
      const users = this.client.db("7git").collection("users");

      const filter = {
        id: userData.id,
      };

      const emotes = await this.fetchEmoteSet({ userId: userData.id });
      const newDoc = {
        $set: {
          username: userData.login,
          emotes: emotes === null ? [] : emotes,
        },
      };

      await users.updateOne(filter, newDoc, { upsert: true });
    } catch (e) {
      if (e instanceof Error) {
        Logger.getInstance().error(e);
      }
    }
  }

  async isEmoteInSet(userId: number, emoteName: string) {
    try {
      const users = this.client.db("7git").collection("users");

      const filter = {
        id: userId,
        "emotes.name": emoteName,
      };

      const data = await users.findOne(filter);
      return data !== null;
    } catch (e) {
      if (e instanceof Error) {
        Logger.getInstance().error(e);
      }
      return false;
    }
  }

  async updateEmoteSet(payload: Payload, emoteSet: EmoteSet) {
    try {
      const users = this.client.db("7git").collection("users");

      const filter = {
        id: payload.id,
      };

      const newEmoteSet = {
        id: payload.id,
        username: payload.login,
        emotes: emoteSet,
      };

      const result = await users.replaceOne(filter, newEmoteSet);
      return result.modifiedCount > 0;
    } catch (e) {
      if (e instanceof Error) {
        Logger.getInstance().error(e);
      }
      return false;
    }
  }

  async updateEmoteName(userId: number, emoteId: string, newName: string) {
    try {
      const users = this.client.db("7git").collection("users");

      const filter = {
        id: userId,
        "emotes.emoteId": emoteId,
      };
      const update = {
        $set: {
          "emotes.$.name": newName,
        },
      };

      const result = await users.updateOne(filter, update);
      return result.modifiedCount > 0;
    } catch (e) {
      if (e instanceof Error) {
        Logger.getInstance().error(e);
      }
      return false;
    }
  }

  async fetchEmoteSet(props: { userId?: number; username?: string }) {
    try {
      const users = this.client.db("7git").collection("users");

      let filter: Filter<Document> | null = null;
      if (props.userId) {
        filter = {
          id: props.userId,
        };
      } else if (props.username) {
        filter = {
          username: props.username,
        };
      }

      if (!filter) {
        return null;
      }

      const data = await users.findOne(filter);
      if (!data) {
        return null;
      }

      return (data as UserData).emotes;
    } catch (e) {
      if (e instanceof Error) {
        Logger.getInstance().error(e);
      }
      return null;
    }
  }

  async addEmote(userId: number, emoteName: string, emoteId: string) {
    try {
      const users = this.client.db("7git").collection("users");

      const filter = {
        id: userId,
      };
      const update = {
        $push: {
          emotes: Object({
            emoteId: emoteId,
            name: emoteName,
          }),
        },
      };

      const result = await users.updateOne(filter, update);
      return result.modifiedCount > 0;
    } catch (e) {
      if (e instanceof Error) {
        Logger.getInstance().error(e);
      }
      return false;
    }
  }

  async removeEmote(userId: number, emoteId: string) {
    try {
      const users = this.client.db("7git").collection("users");

      const filter = {
        id: userId,
      };

      const update = {
        $pull: {
          emotes: {
            emoteId: emoteId,
          },
        },
      };

      const result = await users.updateOne(filter, update);
      return result.modifiedCount > 0;
    } catch (e) {
      if (e instanceof Error) {
        Logger.getInstance().error(e);
      }
      return false;
    }
  }

  async getEmoteById(userId: number, emoteId: string) {
    try {
      const users = this.client.db("7git").collection("users");

      const data = await users.findOne({
        id: userId,
        emotes: {
          $elemMatch: {
            emoteId: emoteId,
          },
        },
      });
      if (!data) {
        return null;
      }

      const parsed = data as UserData;
      const result = parsed.emotes.filter((emote) => emote.emoteId === emoteId)[0];

      return result;
    } catch (e) {
      if (e instanceof Error) {
        Logger.getInstance().error(e);
      }
      return null;
    }
  }
}
