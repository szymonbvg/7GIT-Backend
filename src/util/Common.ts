import "dotenv/config";

export function getJWTSecretKey() {
  return process.env.JWT_SECRET_KEY!;
}

export function getMongoURI() {
  return process.env.MONGODB_URI ?? "mongodb://localhost:27027";
}

export function getEmoteSlotsLimit() {
  return process.env.EMOTE_SLOTS ? parseInt(process.env.EMOTE_SLOTS) : 600;
}

export function getServerPort() {
  return process.env.PORT ? parseInt(process.env.PORT) : 3000;
}

export function getLoggingDirectory() {
  return process.env.LOGGING_DIR ?? ".";
}
