import { serve } from "@hono/node-server";
import { Hono } from "hono";
import fs from "fs";
import sharp from "sharp";
import path from "path";
import { encode } from "blurhash";

const app = new Hono();
const outputDir = "./temp";

const getBlurhash = async (imageBuffer: Buffer) => {
  const image = await sharp(imageBuffer)
    .raw()
    .ensureAlpha()
    .toBuffer({ resolveWithObject: true });
  const { data, info } = image;
  const blurhash = encode(
    new Uint8ClampedArray(data),
    info.width,
    info.height,
    4,
    4,
  );
  return blurhash;
};

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.post("/image", async (c) => {
  const body = await c.req.parseBody();
  const image = body.image;
  const imageBuff = await new Blob([image]).arrayBuffer();
  const uuid = crypto.randomUUID();

  if (!image) {
    return c.json({ error: "No image provided" }, 400);
  }

  const outputFileName = path.join(outputDir, `${uuid}-original`);
  await sharp(imageBuff).toFile(outputFileName);

  const hashes = [];
  const sizes = [320, 480, 768, 1024, 1280];
  for (const width of sizes) {
    const outputFileName = path.join(outputDir, `${uuid}-${width}.webp`);
    const resizedBuffer = await sharp(imageBuff)
      .resize(width)
      .webp({ quality: 75 })
      .toBuffer();
    fs.writeFileSync(outputFileName, resizedBuffer);
    const blurhash = await getBlurhash(resizedBuffer);
    console.log(`foi o hash do ${width}`);
    hashes.push(blurhash);
  }

  return c.json(
    {
      message: "Image compressed successfully",
      hashes,
    },
    200,
  );
});

app.get("image/:fileName", async (c) => {
  const fileName = c.req.param("fileName");
  const outputFileName = path.join(outputDir, `${fileName}`);
  const file = fs.readFileSync(outputFileName);
  if (!file) {
    return c.json({ error: "Imagem não encontrada" }, 404);
  }
  return c.body(file, 200);
});

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
