import { Document, Filter, MongoClient } from "mongodb";
import { getMongoURI } from "../util/Common";
import { Emote, EmoteSet } from "../types/Emotes";
import { AuthData, GithubUserData } from "../types/UserData";
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

      const result = await users.updateOne(filter, newDoc, { upsert: true });
      return result.upsertedCount > 0 || result.matchedCount > 0 || result.modifiedCount > 0;
    } catch (e) {
      Logger.log("error", e);
      return false;
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
      Logger.log("error", e);
      return false;
    }
  }

  async updateEmoteSet(authData: AuthData, emoteSet: EmoteSet) {
    try {
      const users = this.client.db("7git").collection("users");

      const filter = {
        id: authData.id,
      };

      const newEmoteSet = {
        id: authData.id,
        username: authData.login,
        emotes: emoteSet,
      };

      const result = await users.replaceOne(filter, newEmoteSet);
      return result.modifiedCount > 0;
    } catch (e) {
      Logger.log("error", e);
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
      Logger.log("error", e);
      return false;
    }
  }

  async fetchEmoteSet(options: { userId?: number; username?: string }): Promise<EmoteSet | null> {
    try {
      const users = this.client.db("7git").collection("users");

      let filter: Filter<Document> | null = null;
      if (options.userId) {
        filter = {
          id: options.userId,
        };
      } else if (options.username) {
        filter = {
          username: options.username,
        };
      }

      if (!filter) {
        return null;
      }

      const data = await users.findOne(filter, { projection: { emotes: 1 } });
      if (!data) {
        return null;
      }

      const { emotes } = data;
      return emotes as EmoteSet;
    } catch (e) {
      Logger.log("error", e);
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
      Logger.log("error", e);
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
      Logger.log("error", e);
      return false;
    }
  }

  async getEmoteById(userId: number, emoteId: string): Promise<Emote | null> {
    try {
      const users = this.client.db("7git").collection("users");

      const data = await users.findOne(
        {
          id: userId,
          "emotes.emoteId": emoteId,
        },
        { projection: { "emotes.$": 1 } }
      );
      if (!data) {
        return null;
      }

      const { emotes } = data;
      return emotes[0] as Emote;
    } catch (e) {
      Logger.log("error", e);
      return null;
    }
  }

  async getUsedSlotsCount(userId: number): Promise<number | null> {
    try {
      const users = this.client.db("7git").collection("users");

      const result = await users
        .aggregate([{ $match: { id: userId } }, { $project: { usedSlots: { $size: "$emotes" } } }])
        .toArray();

      if (result.length <= 0) {
        return null;
      }

      const { usedSlots } = result[0];
      return usedSlots as number;
    } catch (e) {
      Logger.log("error", e);
      return null;
    }
  }
}
