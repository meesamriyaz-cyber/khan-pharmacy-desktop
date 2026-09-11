import { startMongo, stopMongo } from "./services/mongodb.js";
import { startBackend, stopBackend } from "./services/backend.js";
import { seedDatabase } from "./services/seed.js";
import { app, BrowserWindow, shell } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import {
  DATABASE_PATH,
  UPLOADS_PATH,
  BACKUPS_PATH,
  LOGS_PATH,
  CONFIG_PATH,
} from "./utils/path.js";

const gotLock = app.requestSingleInstanceLock();

if (!gotLock) {
  app.quit();
  process.exit(0);
}

app.on("second-instance", () => {
  if (BrowserWindow.getAllWindows().length) {
    const win = BrowserWindow.getAllWindows()[0];

    if (win.isMinimized()) {
      win.restore();
    }

    win.focus();
  }
});
let splash;


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getResourcePath(...segments) {
  return app.isPackaged
    ? path.join(process.resourcesPath, "resources", ...segments)
    : path.join(__dirname, "resources", ...segments);
}

function createSplash() {

    splash = new BrowserWindow({

        width: 450,
        height: 320,

        frame: false,

        resizable: false,

        movable: false,

        alwaysOnTop: true,
        transparent: false,

        center: true,

        autoHideMenuBar: true
    });

    splash.loadFile(path.join(__dirname, "splash.html"));
}

function createWindow() {
   const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    autoHideMenuBar: true,  
    backgroundColor: "#ffffff",
    show:false,
    icon: path.join(__dirname, "build", "icon.ico"),
    webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        preload: path.join(__dirname, "preload.cjs")
    }
  

  });
      win.webContents.openDevTools({
    mode: "detach"
  });
  win.webContents.setWindowOpenHandler(({ url }) => {
  shell.openExternal(url);
  return { action: "deny" };
    });
  if (app.isPackaged) {
     win.webContents.on("before-input-event", (event, input) => {
    if (input.key === "F12") {
      event.preventDefault();
    }

    if (
      input.control &&
      input.shift &&
      input.key.toLowerCase() === "i"
    ) {
      event.preventDefault();
    }
  });
const frontendPath = getResourcePath("frontend", "index.html");

//console.log("Frontend path:", frontendPath);
//console.log("Exists:", fs.existsSync(frontendPath));

win.loadFile(frontendPath);
  } else {
    win.loadURL("http://localhost:5173");
  }
  win.once("ready-to-show", () => {
  if(splash){

        splash.close();

        splash = null;

    }

    win.show();
});
win.webContents.on("before-input-event", (event, input) => {
  // Disable F5
  if (input.key === "F5") {
    event.preventDefault();
  }

  // Disable Ctrl+R
  if (input.control && input.key.toLowerCase() === "r") {
    event.preventDefault();
  }

  // Disable Ctrl+Shift+R
  if (input.control && input.shift && input.key.toLowerCase() === "r") {
    event.preventDefault();
  }
});
return win
}


app.whenReady().then(async () => {
  try {
    createDataFolders();
    createSplash();
    console.log("Electron started");

    await startMongo();
    await seedDatabase();
    await startBackend();

    console.log("Services started");

    createWindow();

    console.log("Window created");

  } catch (err) {
    console.error("Application startup failed:", err);

    // Leave this commented until everything works
    // app.quit();
  }
});

function createDataFolders() {
  [
    DATABASE_PATH,
    UPLOADS_PATH,
    BACKUPS_PATH,
    LOGS_PATH,
    CONFIG_PATH,
  ].forEach((folder) => {
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
  });
}

app.on("before-quit", async () => {
  console.log("Closing application...");

  try {
    await stopBackend();
    await stopMongo();
  } catch (e) {
    console.error(e);
  }
});
