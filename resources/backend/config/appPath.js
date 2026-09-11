import path from "path";

export default {
  uploads:
    process.env.UPLOADS_PATH ||
    path.join(process.cwd(), "uploads"),

  backups:
    process.env.BACKUPS_PATH ||
    path.join(process.cwd(), "backups"),

  logs:
    process.env.LOGS_PATH ||
    path.join(process.cwd(), "logs"),
};