import Redis from "ioredis";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const redis = new Redis(process.env.UPSTASH_URL, {
  tls: {},
  maxRetriesPerRequest: 2,
  retryDelayOnFailover: 100,
  enableReadyCheck: true,
  maxRetries: 3,
  retryDelayOnClusterDown: 300,
  connectTimeout: 5000, // 5 seconds
  commandTimeout: 3000, // 3 seconds
});
redis.on("error", (err) => {
  console.error("Redis error:", err);
});

redis.on("connect", () => {
  console.log("Redis connected successfully");
});

redis.on("close", () => {
  console.log("Redis connection closed");
});

redis.on("reconnecting", () => {
  console.log("Redis reconnecting...");
});

export default redis;
