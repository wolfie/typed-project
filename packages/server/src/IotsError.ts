import type * as t from "io-ts";

class IotsError extends Error {
  name = "TypeError";
  constructor(public readonly errors: t.Errors) {
    super(JSON.stringify(errors.map(getReadableError)));
  }
}

export const getReadableError = (error: t.ValidationError) => {
  const actualValue = error.value;
  const actualValueIsUndefined = typeof actualValue === "undefined";

  const path = [
    "$root",
    error.context
      .slice(1)
      .map(c => c.key)
      .join("."),
  ]
    .filter(Boolean)
    .join(".");

  const expectedType = error.context[error.context.length - 1].type.name;
  const base = { path, expectedType };
  return actualValueIsUndefined ? { actualValueIsUndefined, ...base } : { actualValue, ...base };
};

export default IotsError;
