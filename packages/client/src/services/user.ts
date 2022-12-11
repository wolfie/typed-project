import env from "../env";
import { useFetchLazy } from "./useFetch";
import * as t from "io-ts";

export const useLogin = () =>
  useFetchLazy(
    { method: "GET" },
    (username: string, password: string) => ({
      url: `${env.REACT_APP_AUTH_SERVICE_URL}?${new URLSearchParams({ username, password })}`,
    }),
    t.union([t.undefined, t.type({ username: t.string, id: t.string })])
  );
