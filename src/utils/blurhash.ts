import { encode } from "blurhash";
import sharp from "sharp";

export const getBlurhash = async (imageBuffer: Buffer) => {
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
