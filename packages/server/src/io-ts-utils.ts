import t from "io-ts";
import IotsError from "./IotsError";

const decodeCurry =
  <T extends t.Any>(type: T) =>
  (input: unknown): t.TypeOf<T> => {
    const result = type.decode(input);
    if (result._tag === "Left") throw new IotsError(result.left);
    else return result.right;
  };

export function decode<T extends t.Any>(type: T): (input: unknown) => t.TypeOf<T>;
export function decode<T extends t.Any>(type: T, input: unknown): t.TypeOf<T>;
export function decode(type: t.Any, input?: unknown) {
  if (typeof input === "undefined") return decodeCurry(type);
  else return decodeCurry(type)(input);
}

export const AxiosResponse = <T extends t.Any>(type: T) =>
  t.type({
    data: type,
    status: t.number,
    statusText: t.string,
    headers: t.UnknownRecord,
    config: t.UnknownRecord,
    request: t.unknown,
  });
