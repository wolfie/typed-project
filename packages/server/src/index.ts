import env from "./env";
import express from "express";
import chalk from "chalk";
import routes from "./routes";
import logger from "./logger";

const log = logger("express");

const app = express();

app.use(routes);

app.listen(env.PORT, () => {
  log(`Server started in port ${chalk.yellow(env.PORT)}`);
});
