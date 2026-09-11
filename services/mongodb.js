import { app } from "electron";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import waitOn from "wait-on";
import { DATABASE_PATH } from "../utils/path.js";

let mongoProcess;

export async function startMongo() {

    const mongoFolder = app.isPackaged
        ? path.join(process.resourcesPath, "resources", "mongodb", "bin")
        : path.join(process.cwd(), "resources", "mongodb", "bin");

    const dbPath = DATABASE_PATH;

    fs.mkdirSync(dbPath, { recursive: true });

    const mongod = path.join(
        mongoFolder,
        "mongod.exe"
    );

    mongoProcess = spawn(
        mongod,
        [
            "--dbpath",
            dbPath,

            "--port",
            "27018",
            "--bind_ip",
            "127.0.0.1"
        ],
        {
            windowsHide: true
        }
    );

    mongoProcess.on("error", (err) => {
        console.error("MongoDB spawn failed:", err);
    });

    mongoProcess.stdout.on("data", (d) => {
        console.log(d.toString());
    });

    mongoProcess.stderr.on("data", (d) => {
        console.log(d.toString());
    });

    try {
        await waitOn({
            resources: [
                "tcp:127.0.0.1:27018"
            ],
            timeout: 30000
        });
    } catch (err) {
        console.error("MongoDB failed to start:", err);
        if (mongoProcess) {
            mongoProcess.kill();
            mongoProcess = null;
        }
        throw err;
    }

    console.log("MongoDB Ready");
}

export function stopMongo() {

    if (mongoProcess) {

        try {
            mongoProcess.kill();
        } catch (err) {
            console.error("Error stopping MongoDB:", err);
        }

        mongoProcess = null;

    }

}
