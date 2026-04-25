import { createWriteStream, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import archiver from "archiver";

const ROOT = resolve(dirname(new URL(import.meta.url).pathname), "..");
const SKILLS_DIR = resolve(ROOT, "skills");
const OUTPUT = resolve(ROOT, "public", "skills.zip");

if (!existsSync(SKILLS_DIR)) {
  console.error("skills/ directory not found");
  process.exit(1);
}

mkdirSync(dirname(OUTPUT), { recursive: true });

const output = createWriteStream(OUTPUT);
const archive = archiver("zip", { zlib: { level: 9 } });

output.on("close", () => {
  console.log(`skills.zip created (${archive.pointer()} bytes)`);
});

archive.on("error", (err) => {
  throw err;
});

archive.pipe(output);
archive.glob("**/*", {
  cwd: SKILLS_DIR,
  ignore: ["**/*:Zone.Identifier", "**/plan-to-tracker/plan-to-tracker/**"],
});
await archive.finalize();
