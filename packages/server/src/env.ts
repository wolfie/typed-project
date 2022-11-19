import dotenv from "dotenv";
import * as z from "zod";

dotenv.config();

const Config = z.object({
  PORT: z
    .string()
    .default("8000")
    .transform((str) => parseInt(str)),
});

const processEnv = Config.parse(process.env);

export default processEnv;
