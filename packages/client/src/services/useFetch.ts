import * as React from "react";
import * as t from "io-ts";
import { ioTsUtils } from "typed-project-common";

type UseFetch<DATA> = { state: "loading" } | { state: "done"; data: DATA } | { state: "error" };

const useFetch = <T extends t.Any>(url: string, ResponseType: T): UseFetch<t.TypeOf<T>> => {
  const [data, setData] = React.useState<t.TypeOf<T>>();
  const [state, setState] = React.useState<UseFetch<any>["state"]>("loading");
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

type UseFetchLazy<ARGS extends any[], T> =
  | { state: "loading" }
  | { exec: (...args: ARGS) => void; state: "init" }
  | { exec: (...args: ARGS) => void; state: "error" }
  | { exec: (...args: ARGS) => void; state: "done"; data: T };
export const useFetchLazy = <ARGS extends any[] = [], T extends t.Any = t.UnknownType>(
  url: string,
  initOptions?: Omit<RequestInit, "signal">,
  fetchConfigs?: (...args: ARGS) => Omit<RequestInit, "signal">,
  ResponseType?: T
) => {
  const [data, setData] = React.useState<t.TypeOf<T>>();
  const [state, setState] = React.useState<UseFetchLazy<any, any>["state"]>("init");
  const [error, setError] = React.useState<any>();
  const controllerRef = React.useRef<AbortController>();

  const exec = React.useCallback(
    (...args: ARGS) => {
      controllerRef.current?.abort();
      const controller = (controllerRef.current = new AbortController());
      const execOptions = fetchConfigs?.(...args);

      const fetchOptions: RequestInit = {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          ...initOptions?.headers,
          ...execOptions?.headers,
        },
        ...initOptions,
        ...execOptions,
        signal: controller.signal,
      };

      setState("loading");
      globalThis
        .fetch(url, fetchOptions)
        .then(async res => {
          if (res.status !== 200) {
            const errorText = await res.text();
            console.error(errorText);
            setState("error");
          } else {
            return res
              .json()
              .then(res => res.data)
              .then(ioTsUtils.decode(ResponseType ?? t.unknown))
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
    },
    [url, JSON.stringify(initOptions)]
  );

  return React.useMemo<UseFetchLazy<ARGS, t.TypeOf<T>>>(
    () =>
      state === "loading"
        ? { state }
        : state === "error"
        ? { state, error, exec }
        : state === "done"
        ? { state, exec, data }
        : { state, exec },
    [state, exec]
  );
};

export default useFetch;
