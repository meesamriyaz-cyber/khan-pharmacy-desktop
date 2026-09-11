import { app } from "electron";
import { fork } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import waitOn from "wait-on";
import {
  BACKUPS_PATH,
  CONFIG_PATH,
  DATABASE_PATH,
  LOGS_PATH,
  UPLOADS_PATH,
} from "../utils/path.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let backendProcess;

export async function startBackend() {
  let backendFolder;

  if (app.isPackaged) {
    backendFolder = path.join(process.resourcesPath, "resources", "backend");
  } else {
    backendFolder = path.join(
      __dirname,
      "..",
      "..",
      "haleem-medicose-backend"
    );
  }

  const serverFile = path.join(backendFolder, "server.js");

  console.log("Starting backend from:");
  console.log(serverFile);

 backendProcess = fork(serverFile, [], {
  cwd: backendFolder,
  env: {
    ...process.env,
    NODE_ENV: app.isPackaged ? "production" : "development",
    ELECTRON_RUN_AS_NODE: "1",
    DESKTOP_APP: "true",
    DESKTOP_MONGO_URI: "mongodb://127.0.0.1:27018/haleem_medicose",
    DATABASE_PATH,
    UPLOADS_PATH,
    BACKUPS_PATH,
    LOGS_PATH,
    CONFIG_PATH,
  },
  stdio: "inherit",
});

  await waitOn({
    resources: ["tcp:127.0.0.1:5000"],
    timeout: 30000,
  });

  console.log("Backend Ready");
}

export function stopBackend() {
  if (backendProcess) {
    try {
      backendProcess.kill();
    } catch (err) {
      console.error("Error stopping backend:", err);
    }

    backendProcess = null;
  }
}
