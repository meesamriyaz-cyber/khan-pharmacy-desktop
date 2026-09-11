import path from "path";

export const APP_DATA_PATH = "C:\\ProgramData\\KHANPHARMACY";

export const DATABASE_PATH = path.join(APP_DATA_PATH, "database");
export const UPLOADS_PATH = path.join(APP_DATA_PATH, "uploads");
export const BACKUPS_PATH = path.join(APP_DATA_PATH, "backups");
export const LOGS_PATH = path.join(APP_DATA_PATH, "logs");
export const CONFIG_PATH = path.join(APP_DATA_PATH, "config");