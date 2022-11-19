import t from "io-ts";

const getReadableError = (error: t.ValidationError) => {
  const actualValue = error.value;
  const actualValueIsUndefined = typeof actualValue === "undefined";

  const path = [
    "$root",
    error.context
      .slice(1)
      .map((c) => c.key)
      .join("."),
  ]
    .filter(Boolean)
    .join(".");

  const expectedType = error.context[error.context.length - 1].type.name;
  const base = { path, expectedType };
  return actualValueIsUndefined
    ? { actualValueIsUndefined, ...base }
    : { actualValue, ...base };
};

class TypeError extends Error {
  name = "TypeError";
  constructor(public readonly errors: t.Errors) {
    super(JSON.stringify(errors.map(getReadableError)));
  }
}

const decodeCurry =
  <T extends t.Any>(type: T) =>
  (input: unknown): t.TypeOf<T> => {
    const result = type.decode(input);
    if (result._tag === "Left") throw new TypeError(result.left);
    else return result.right;
  };

export function decode<T extends t.Any>(
  type: T
): (input: unknown) => t.TypeOf<T>;
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
