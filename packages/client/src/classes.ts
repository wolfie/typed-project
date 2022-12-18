const isDefined = <T>(t: T | undefined): t is T => typeof t !== "undefined";

const classes = (...entries: (string | Record<string, boolean | undefined> | undefined)[]) =>
  entries
    .filter(isDefined)
    .map(e =>
      typeof e === "string"
        ? e
        : Object.entries(e)
            .filter(([_, active]) => active)
            .map(([classname]) => classname)
    )
    .join(" ");

export default classes;
