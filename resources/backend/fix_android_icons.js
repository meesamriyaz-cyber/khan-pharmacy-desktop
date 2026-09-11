import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Android icon directories
const androidResPath = "../haleem-medicose-frontend/android/app/src/main/res";

// Directories to clean
const iconDirs = [
  "mipmap-mdpi",
  "mipmap-hdpi",
  "mipmap-xhdpi",
  "mipmap-xxhdpi",
  "mipmap-xxxhdpi",
];

console.log("🧹 Cleaning up duplicate Android icon files...");

iconDirs.forEach((dirName) => {
  const dirPath = path.join(androidResPath, dirName);

  if (!fs.existsSync(dirPath)) {
    console.log(`⚠️  Directory not found: ${dirPath}`);
    return;
  }

  const files = fs.readdirSync(dirPath);

  // Remove duplicate WebP files
  const webpFiles = files.filter((file) => file.endsWith(".webp"));
  webpFiles.forEach((file) => {
    const filePath = path.join(dirPath, file);
    fs.unlinkSync(filePath);
    console.log(`🗑️  Removed duplicate: ${filePath}`);
  });

  console.log(`✅ Cleaned directory: ${dirName}`);
});

console.log("\n🎉 Duplicate icon files removed successfully!");
console.log("\nNow only the required PNG files remain:");
console.log("- ic_launcher.png (regular icon)");
console.log("- ic_launcher_round.png (round icon)");
console.log("\nThe app should now build without duplicate resource errors.");
