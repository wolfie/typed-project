import env from "./env";
import express from "express";
import chalk from "chalk";
import routes from "./routes/todo";
import logger from "./logger";
import bodyParser from "body-parser";
import cors from "cors";

const log = logger("express");

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use("/todo", routes);
app.use((_req, res) => res.status(404).json({ message: "Not Found" }));

app.listen(env.PORT, () => {
  log(`Server started in port ${chalk.yellow(env.PORT)}`);
});
