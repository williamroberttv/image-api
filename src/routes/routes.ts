import { Hono } from "hono";
import { getImage, uploadImage } from "../services/file";
import { HTTPException } from "hono/http-exception";

const routes = new Hono();

routes.post("/upload", async (c) => {
  try {
    return await uploadImage(c);
  } catch (error: any) {
    throw new HTTPException(error.status, {
      message: error.message,
      cause: error,
    });
  }
});
routes.get("/image/:fileName", async (c) => {
  try {
    return await getImage(c);
  } catch (error: any) {
    throw new HTTPException(error.status, {
      message: error.message,
      cause: error,
    });
  }
});

export default routes;
