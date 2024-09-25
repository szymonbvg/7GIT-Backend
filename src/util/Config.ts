import "dotenv/config";

export function getJWTSecretKey() {
  return process.env.JWT_SECRET_KEY ?? "h4sl0m4sl0";
}

export function getMongoURI() {
  return process.env.MONGODB_URI ?? "mongodb://localhost:27027";
}

export function getEmoteSlotsLimit() {
  return process.env.EMOTE_SLOTS ? parseInt(process.env.EMOTE_SLOTS) : 600;
}
