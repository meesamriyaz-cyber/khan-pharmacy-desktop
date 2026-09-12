import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const electronRoot = path.resolve(__dirname, "..");

const frontendRoot = path.resolve(
  electronRoot,
  "..",
  "Medicose-frontend"
);

const backendRoot = path.resolve(
  electronRoot,
  "..",
  "Medicose-backend"
);

const mongoRoot = path.resolve(
  electronRoot,
  "..",
  "mongodb"
);

const resourcesRoot = path.join(electronRoot, "resources");

console.log("Cleaning resources...");

await fs.emptyDir(resourcesRoot);

console.log("Building React...");

execSync("npm run build", {
  cwd: frontendRoot,
  stdio: "inherit",
});

console.log("Copying frontend...");

await fs.copy(
  path.join(frontendRoot, "dist"),
  path.join(resourcesRoot, "frontend")
);

console.log("Copying backend...");

await fs.copy(
  backendRoot,
  path.join(resourcesRoot, "backend"),
  {
    filter: (src) => {
      return (
        !src.includes("node_modules") &&
        !src.includes(".git")
      );
    },
  }
);

const backendDbConfig = path.join(resourcesRoot, "backend", "config", "db.js");
if (await fs.pathExists(backendDbConfig)) {
  const dbConfig = await fs.readFile(backendDbConfig, "utf8");
  await fs.writeFile(
    backendDbConfig,
    dbConfig.replace(
      /"mongodb:\/\/127\.0\.0\.1:2701\/haleem_medicose"/g,
      'process.env.DESKTOP_MONGO_URI || "mongodb://127.0.0.1:27018/haleem_medicose"'
    )
  );
}

await fs.copy(
  path.join(electronRoot, "scripts", "seedDesktopDatabase.js"),
  path.join(resourcesRoot, "backend", "scripts", "seedDesktopDatabase.js")
);

console.log("Copying MongoDB...");

if (fs.existsSync(mongoRoot)) {
  await fs.copy(
    mongoRoot,
    path.join(resourcesRoot, "mongodb"),
    {
      filter: (src) => {
        return !src.includes(".git") && !src.toLowerCase().endsWith(".pdb");
      },
    }
  );
} else {
  console.warn("WARNING: MongoDB not found at", mongoRoot, "— skipping MongoDB copy.");
}
console.log("Build completed.");
console.log("Installing backend production dependencies...");

execSync("npm ci --omit=dev", {
  cwd: path.join(resourcesRoot, "backend"),
  stdio: "inherit",
});
