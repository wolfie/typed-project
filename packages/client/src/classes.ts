const classes = (...entries: (string | Record<string, boolean | undefined>)[]) =>
  entries
    .map(e =>
      typeof e === "string"
        ? e
        : Object.entries(e)
            .filter(([_, active]) => active)
            .map(([classname]) => classname)
    )
    .join(" ");

export default classes;
