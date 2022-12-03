import * as React from "react";
import * as t from "io-ts";
import { ioTsUtils } from "typed-project-common";

type UseFetch<DATA> = { state: "loading" } | { state: "done"; data: DATA } | { state: "error" };
type FetchState = UseFetch<unknown>["state"];

const useFetch = <T extends t.Any>(url: string, ResponseType: T): UseFetch<t.TypeOf<T>> => {
  const [data, setData] = React.useState<t.TypeOf<T>>();
  const [state, setState] = React.useState<FetchState>("loading");
  const [error, setError] = React.useState<any>();

  React.useEffect(() => {
    const controller = new AbortController();
    fetch(url, { signal: controller.signal })
      .then(async res => {
        if (res.status !== 200) {
          const errorText = await res.text();
          console.error(errorText);
          setState("error");
        } else {
          return res
            .json()
            .then(res => res.data)
            .then(ioTsUtils.decode(ResponseType))
            .then(setData)
            .then(() => setState("done"));
        }
      })
      .catch(e => {
        if (controller.signal.aborted) return;

        console.error(e);
        setState("error");
        setError(e);
      });

    return () => controller.abort();
  }, [url, ResponseType.name]);

  const result = React.useMemo<UseFetch<t.TypeOf<T>>>(
    () => (state === "done" ? { state, data } : state === "error" ? { state, error } : { state }),
    [state]
  );

  return result;
};

export default useFetch;
