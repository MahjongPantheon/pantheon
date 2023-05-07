import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "url";
import express from "express";
import cluster from 'node:cluster';
import { availableParallelism } from 'node:os';
import process from 'node:process';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const numCPUs = availableParallelism();

export async function createServer(app) {
  const resolve = (p) => path.resolve(__dirname, p);

  app.use((await import("compression")).default());
  app.use(
    (await import("serve-static")).default(resolve("dist/client"), {
      index: false,
    })
  );

  app.use("*", async (req, res) => {
    const url = "/";

    const template = fs.readFileSync(
      resolve("dist/client/index.html"),
      "utf-8"
    );
    const render = (await import("./dist/server/server.js")).SSRRender;

    const appHtml = render(url); //Rendering component without any client side logic de-hydrated like a dry sponge
    const html = template.replace(`<!--app-html-->`, appHtml); //Replacing placeholder with SSR rendered components

    res.status(200).set({ "Content-Type": "text/html" }).end(html); //Outputing final html
  });

  return app;
}

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {
  const app = express();
  createServer(app).then((app) =>
    app.listen(3033, () => {
      console.log("http://localhost:3033");
    })
  );

  console.log(`Worker ${process.pid} started`);
}

