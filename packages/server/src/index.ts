import env from "./env";
import express from "express";
import chalk from "chalk";

const app = express();

app.listen(env.PORT, () => {
  console.log(`Server started in port ${chalk.yellow(env.PORT)}`);
});
