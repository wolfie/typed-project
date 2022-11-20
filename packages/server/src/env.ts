import dotenv from "dotenv";
import * as t from "io-ts";
import { decode } from "./io-ts-utils";
import * as tt from "io-ts-types";

dotenv.config();

type ConfigC = t.TypeOf<typeof Config>
const Config = t.partial({
  PORT: tt.IntFromString,
});

const DEFAULT_CONFIGS = {
  PORT: decode(tt.IntFromString, "8000"),
} satisfies Partial<ConfigC>;

type Config = ConfigC & typeof DEFAULT_CONFIGS;

const processEnv = decode(Config, process.env);

export default { ...DEFAULT_CONFIGS, ...processEnv };
