import fs from "fs";
import pngToIco from "png-to-ico";

const buf = await pngToIco("build/icon.png");

fs.writeFileSync("build/icon.ico", buf);

console.log("Icon created successfully!");