import * as t from "io-ts";
import IoTsError from "./IoTsError";

const decodeCurry =
  <T extends t.Any>(type: T) =>
    (input: unknown): t.TypeOf<T> => {
      const result = type.decode(input);
      if (result._tag === "Left") throw new IoTsError(result.left);
      else return result.right;
    };


export function decodeIfNotUndefined<T extends t.Any>(type: T): (input: unknown) => t.TypeOf<T> |  undefined;
export function decodeIfNotUndefined<T extends t.Any>(type: T, input: unknown): t.TypeOf<T> |  undefined;
export function decodeIfNotUndefined(...args: [t.Any, unknown?]) {
  if (args.length === 1) return (input: unknown) => typeof input !== 'undefined' ? decodeCurry(args[0])(input) : input
  else if (typeof args[1] === 'undefined') return undefined
  else decodeCurry(args[0])(args[1])
}

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
