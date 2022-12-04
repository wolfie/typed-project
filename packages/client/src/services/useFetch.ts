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

type UseFetchLazy<ARGS extends any[]> =
  | { state: "loading" }
  | { exec: (...args: ARGS) => void; state: "init" }
  | { exec: (...args: ARGS) => void; state: "done" }
  | { exec: (...args: ARGS) => void; state: "error" };
export const useFetchLazy = <ARGS extends any[] = []>(
  url: string,
  initOptions?: Omit<RequestInit, "signal">,
  fetchConfigs?: (...args: ARGS) => Omit<RequestInit, "signal">
) => {
  const [state, setState] = React.useState<FetchState>("loading");
  const [error, setError] = React.useState<any>();
  const controllerRef = React.useRef<AbortController>();

  const exec = React.useCallback(
    (...args: ARGS) => {
      controllerRef.current?.abort();
      const controller = (controllerRef.current = new AbortController());
      const initOptions = fetchConfigs?.(...args);
      globalThis
        .fetch(url, {
          headers: { "Content-Type": "application/json; charset=utf-8", ...initOptions?.headers },
          ...initOptions,
          signal: controller.signal,
        })
        .then(async res => {
          if (res.status !== 200) {
            const errorText = await res.text();
            console.error(errorText);
            setState("error");
          } else {
            setState("done");
          }
        })
        .catch(e => {
          if (controller.signal.aborted) return;

          console.error(e);
          setState("error");
          setError(e);
        });
    },
    [url, JSON.stringify(initOptions)]
  );

  return React.useMemo<UseFetchLazy<ARGS>>(
    () => (state === "loading" ? { state } : state === "error" ? { state, error, exec } : { state, exec }),
    [state, exec]
  );
};

export default useFetch;
