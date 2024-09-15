import { serve } from "@hono/node-server";
import { Hono } from "hono";
import fs from "fs";
import { showRoutes } from "hono/dev";
import { outputDir } from "./utils/paths";
import routes from "./routes/routes";
import { HTTPException } from "hono/http-exception";

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

const app = new Hono();

app.get("/", (c) => {
  return c.text("Image API!");
});
app.route("/", routes);
app.onError((error, c) => {
  if (error instanceof HTTPException) {
    return c.json(error.message, error.status);
  }
  return c.json({ error: "Internal server error" }, 500);
});

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});

showRoutes(app, {
  verbose: true,
});
