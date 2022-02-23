import express from "express";
import compression from "compression";
import { createRequestHandler } from "@remix-run/express";

import * as serverBuild from "@remix-run/dev/server-build";

const app = express();

app.use(compression());

app.disable("x-powered-by");

app.use(
  "/build",
  express.static("public/build", { immutable: true, maxAge: "1y" })
);
app.use(express.static("public", { maxAge: "1h" }));

app.post("*", (_, res, next) => {
  if (
    process.env.FLY_REGION &&
    process.env.FLY_PRIMARY_REGION &&
    process.env.FLY_REGION !== process.env.FLY_PRIMARY_REGION
  ) {
    res
      .status(202)
      .setHeader("fly-replay", `region=${process.env.FLY_PRIMARY_REGION}`)
      .end(`rewriting to ${process.env.FLY_PRIMARY_REGION}`);
  } else {
    next();
  }
});

app.all(
  "*",
  createRequestHandler({
    build: serverBuild,
    mode: process.env.NODE_ENV,
  })
);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
});
