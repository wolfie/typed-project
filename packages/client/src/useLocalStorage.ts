import * as t from "io-ts";
import * as React from "react";
import { IotsError, ioTsUtils } from "typed-project-common";

type LocalStorageValue<T = unknown> =
  | { status: "empty" }
  | { status: "error"; error: IotsError.IoTsError | SyntaxError }
  | { status: "done"; data: T };

type UseLocalStorage<T extends t.Any> = [
  value: LocalStorageValue<t.TypeOf<T>>,
  set: (val: t.TypeOf<T>) => void,
  remove: () => void
];
const useLocalStorage = <T extends t.Any>(key: string, t: T): UseLocalStorage<T> => {
  const [data, setData] = React.useState<t.TypeOf<T> | null>(window.localStorage.getItem(key));

  const write = React.useCallback((data: t.TypeOf<T>) => {
    setData(data);
    window.localStorage.setItem(key, JSON.stringify(data));
  }, []);

  const remove = React.useCallback(() => {
    setData(null);
    window.localStorage.removeItem(key);
  }, []);

  const value = React.useMemo<UseLocalStorage<T>>(() => {
    if (!data) return [{ status: "empty" }, write, remove] satisfies UseLocalStorage<T>;

    try {
      return [
        { status: "done", data: ioTsUtils.decode(t, JSON.parse(data)) },
        write,
        remove,
      ] satisfies UseLocalStorage<T>;
    } catch (error) {
      if (error instanceof IotsError.IoTsError || error instanceof SyntaxError) {
        return [{ status: "error", error }, write, remove] satisfies UseLocalStorage<T>;
      } else {
        throw error;
      }
    }
  }, [data]);

  return value;
};

export default useLocalStorage;
