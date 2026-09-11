import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Source logo path
const logoPath = "assets/haleemmedicose_logo.png";

// Android icon directories
const androidResPath = "../haleem-medicose-frontend/android/app/src/main/res";

// Icon sizes for different densities
const iconSizes = {
  "mipmap-mdpi": 48,
  "mipmap-hdpi": 72,
  "mipmap-xhdpi": 96,
  "mipmap-xxhdpi": 144,
  "mipmap-xxxhdpi": 192,
};

console.log("🚀 Generating Android launcher icons...");

// Check if logo exists
if (!fs.existsSync(logoPath)) {
  console.error(`❌ Logo file not found: ${logoPath}`);
  process.exit(1);
}

// Create directories and copy icons
Object.keys(iconSizes).forEach((dirName) => {
  const dirPath = path.join(androidResPath, dirName);

  // Create directory if it doesn't exist
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Created directory: ${dirPath}`);
  }

  // Copy logo as regular icon
  const regularIconPath = path.join(dirPath, "ic_launcher.png");
  fs.copyFileSync(logoPath, regularIconPath);
  console.log(`✅ Created: ${regularIconPath}`);

  // Copy logo as round icon
  const roundIconPath = path.join(dirPath, "ic_launcher_round.png");
  fs.copyFileSync(logoPath, roundIconPath);
  console.log(`✅ Created: ${roundIconPath}`);

  // Copy as foreground webp
  const foregroundPath = path.join(dirPath, "ic_launcher_foreground.webp");
  fs.copyFileSync(logoPath, foregroundPath);
  console.log(`✅ Created: ${foregroundPath}`);

  // Copy as round foreground webp
  const roundForegroundPath = path.join(dirPath, "ic_launcher_round.webp");
  fs.copyFileSync(logoPath, roundForegroundPath);
  console.log(`✅ Created: ${roundForegroundPath}`);
});

// Create playstore icon (512x512)
const playstorePath = path.join(androidResPath, "ic_launcher-playstore.png");
fs.copyFileSync(logoPath, playstorePath);
console.log(`✅ Created: ${playstorePath}`);

console.log("\n🎉 All Android launcher icons generated successfully!");
console.log("\nNext steps:");
console.log("1. Update the ic_launcher_background.xml if needed");
console.log("2. Build the Android app to see the new launcher icon");
