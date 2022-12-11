import * as React from "react";
import * as t from "io-ts";
import { DataWrappedResponse, ioTsUtils } from "typed-project-common";

type Override<T> = T | ((old: T) => T);
type UseFetch<DATA> =
  | { state: "loading" }
  | { state: "done"; data: DATA; override: (arg: Override<DATA>) => void; refetch: () => void }
  | { state: "error"; refetch: () => void };

const useFetch = <T extends t.Any>(url: string, ResponseType: T): UseFetch<t.TypeOf<T>> => {
  const [data, setData] = React.useState<t.TypeOf<T>>();
  const [state, setState] = React.useState<UseFetch<any>["state"]>("loading");
  const [error, setError] = React.useState<any>();
  const [refetchSymbol, setRefetchSymbol] = React.useState(Symbol());

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
            .then(ioTsUtils.decode(DataWrappedResponse(ResponseType)))
            .then(res => setData(res.data))
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
  }, [url, ResponseType.name, refetchSymbol]);

  const refetch = React.useCallback(() => setRefetchSymbol(Symbol()), []);

  const result = React.useMemo<UseFetch<t.TypeOf<T>>>(
    () =>
      state === "done"
        ? {
            state,
            data,
            refetch,
            override: setData,
          }
        : state === "error"
        ? {
            state,
            error,
            refetch,
          }
        : { state },
    [state, data]
  );

  return result;
};

export const NO_REQUEST = Symbol();

type UseFetchLazy<ARGS extends any[], T> =
  | { state: "loading" }
  | { exec: (...args: ARGS) => Promise<T>; state: "init" }
  | { exec: (...args: ARGS) => Promise<T>; state: "error" }
  | { exec: (...args: ARGS) => Promise<T>; state: "done"; data: T; override: (newValue: T) => void };
export const useFetchLazy = <ARGS extends any[] = [], T extends t.Any = t.UnknownType>(
  initOptions?: Omit<RequestInit, "signal" | "body"> & { url?: string; body?: any },
  fetchConfigs?: (
    ...args: ARGS
  ) => typeof NO_REQUEST | (Omit<RequestInit, "signal" | "body"> & { url?: string; body?: any }),
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

      if (execOptions === NO_REQUEST) return Promise.resolve(data);

      const url = execOptions?.url ?? initOptions?.url;

      if (!url) throw new Error("No URL given");

      const fetchOptions: RequestInit = {
        headers: {
          ...initOptions?.headers,
          ...execOptions?.headers,
          "Content-Type": "application/json; charset=utf-8",
        },
        ...initOptions,
        ...execOptions,
        body: execOptions?.body ? JSON.stringify(execOptions.body) : undefined,
        signal: controller.signal,
      };

      setState("loading");
      const promise = new Promise<T>((resolve, reject) => {
        globalThis
          .fetch(url, fetchOptions)
          .then(async res => {
            if (res.status !== 200) {
              const errorText = await res.text();
              console.error(errorText);
              setState("error");
              reject(new Error(errorText));
            } else {
              const json = await res.json();
              const data = ResponseType && ioTsUtils.decode(DataWrappedResponse(ResponseType), json).data;
              setData(oldData => {
                const finalData = data ?? oldData;
                try {
                  return finalData;
                } finally {
                  resolve(finalData!);
                }
              });
              setState("done");
            }
          })
          .catch(e => {
            if (controller.signal.aborted) return;

            console.error(e);
            setState("error");
            setError(e);
            reject(e);
          });
      });
      return promise;
    },
    [JSON.stringify(initOptions)]
  );

  return React.useMemo<UseFetchLazy<ARGS, t.TypeOf<T>>>(
    () =>
      state === "loading"
        ? { state }
        : state === "error"
        ? { state, error, exec }
        : state === "done"
        ? { state, exec, data, override: setData }
        : { state, exec },
    [state, exec, data]
  );
};

export default useFetch;
