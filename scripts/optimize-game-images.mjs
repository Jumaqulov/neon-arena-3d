// Optimizes the official game artwork in assets-src/games/ into src/assets/games/.
//
//   <slug>-cover.(jpg|png|webp)  portrait key art  -> 600x900 JPEG
//   <slug>-hero.(jpg|png|webp)   wide key art      -> 1920x620 JPEG
//
// Next.js then serves AVIF/WebP at the exact sizes each <Image> asks for, and
// static imports give every image a blur placeholder. Run after adding or
// replacing artwork:  npm run images:optimize
import { readdir, mkdir, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SRC = path.resolve("assets-src/games");
const OUT = path.resolve("src/assets/games");
const TARGETS = {
  cover: { width: 600, height: 900, quality: 82 },
  hero: { width: 1920, height: 620, quality: 80 },
};

await mkdir(OUT, { recursive: true });
const files = (await readdir(SRC)).filter((f) => /-(cover|hero)\.(jpe?g|png|webp)$/i.test(f));

for (const file of files) {
  const [, slug, kind] = file.match(/^(.+)-(cover|hero)\.[a-z]+$/i);
  const t = TARGETS[kind.toLowerCase()];
  const out = path.join(OUT, `${slug}-${kind.toLowerCase()}.jpg`);
  await sharp(path.join(SRC, file))
    .resize(t.width, t.height, { fit: "cover", position: "attention", withoutEnlargement: true })
    .jpeg({ quality: t.quality, mozjpeg: true, progressive: true })
    .toFile(out);
  const [before, after] = await Promise.all([stat(path.join(SRC, file)), stat(out)]);
  console.log(`${file.padEnd(30)} ${(before.size / 1024).toFixed(0).padStart(4)} KB -> ${(after.size / 1024).toFixed(0).padStart(4)} KB`);
}
