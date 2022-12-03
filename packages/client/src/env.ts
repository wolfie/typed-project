import * as t from "io-ts";
import { ioTsUtils } from "typed-project-common";

const Config = t.type({
  REACT_APP_TODO_SERVICE_URL: t.string,
});

export default ioTsUtils.decode(Config, process.env);
