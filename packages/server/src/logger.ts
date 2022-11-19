import chalk from "chalk";

const logger =
  (context: string) =>
  (...msgs: unknown[]) =>
    console.log(chalk.whiteBright(chalk.bold(`[${context}]`)), ...msgs);

export default logger;
