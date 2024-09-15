import { Context } from "hono";
import path from "path";
import fs from "fs";
import { HTTPException } from "hono/http-exception";
import { outputDir } from "../utils/paths";
import sharp from "sharp";
import { getBlurhash } from "../utils/blurhash";

export const getImage = async (c: Context) => {
  try {
    const fileName = c.req.param("fileName");
    const outputFileName = path.join(outputDir, `${fileName}`);
    const file = fs.readFileSync(outputFileName);
    if (!file) {
      throw new HTTPException(404, { message: "Imagem não encontrada" });
    }
    return c.body(file, 200);
  } catch (error: any) {
    throw new HTTPException(error.status, { message: error.message });
  }
};

export const uploadImage = async (c: Context) => {
  try {
    const body = await c.req.parseBody();
    const { file, type } = body;
    const imageBuff = await new Blob([file]).arrayBuffer();
    const uuid = crypto.randomUUID();

    if (!type) {
      throw new HTTPException(400, {
        message: "O tipo da imagem é obrigatório",
      });
    }

    if (!file) {
      throw new HTTPException(400, { message: "A imagem é obrigatória" });
    }

    const outputFileName = path.join(outputDir, `${uuid}-original.${type}`);
    await sharp(imageBuff).toFile(outputFileName);

    const sizes = [320, 480, 768, 1024, 1280];
    for (const width of sizes) {
      const outputFileName = path.join(outputDir, `${uuid}-${width}.webp`);
      const resizedBuffer = await sharp(imageBuff)
        .resize(width)
        .webp({ quality: 75 })
        .toBuffer();
      fs.writeFileSync(outputFileName, resizedBuffer);
    }

    return c.json(
      {
        message: "Imagem processada com sucesso",
      },
      200,
    );
  } catch (error: any) {
    throw new HTTPException(error.status, { message: error.message });
  }
};
