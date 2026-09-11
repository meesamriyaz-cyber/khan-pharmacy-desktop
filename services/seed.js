import { app } from "electron";
import { fork } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { CONFIG_PATH } from "../utils/path.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getBackendFolder() {
  return app.isPackaged
    ? path.join(process.resourcesPath, "resources", "backend")
    : path.join(__dirname, "..", "resources", "backend");
}

function getSeedFolder() {
  return app.isPackaged
    ? path.join(process.resourcesPath, "seed-data", "haleem_medicose")
    : path.join(__dirname, "..", "seed-data", "haleem_medicose");
}

export async function seedDatabase() {
  const seedFolder = getSeedFolder();

  if (!fs.existsSync(seedFolder)) {
    console.log("No seed data folder found, skipping database seed.");
    return;
  }

  const seedFiles = fs
    .readdirSync(seedFolder)
    .filter((file) => /\.(bson|json)$/i.test(file));

  if (seedFiles.length === 0) {
    console.log("Seed data folder is empty, skipping database seed.");
    return;
  }

  const backendFolder = getBackendFolder();
  const scriptFile = path.join(backendFolder, "scripts", "seedDesktopDatabase.js");

  if (!fs.existsSync(scriptFile)) {
    throw new Error(`Database seed script was not found: ${scriptFile}`);
  }

  await new Promise((resolve, reject) => {
    const child = fork(scriptFile, [], {
      cwd: backendFolder,
      env: {
        ...process.env,
        ELECTRON_RUN_AS_NODE: "1",
        DESKTOP_APP: "true",
        DESKTOP_MONGO_URI: "mongodb://127.0.0.1:27018/haleem_medicose",
        SEED_DATA_PATH: seedFolder,
        CONFIG_PATH,
      },
      stdio: "inherit",
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Database seed failed with exit code ${code}`));
      }
    });
  });
}
