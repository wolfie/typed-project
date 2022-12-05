import * as t from "io-ts";
import * as tt from "io-ts-types";

export type Todo = t.TypeOf<typeof Todo>;
export const Todo = t.type({
  id: t.number,
  username: t.string,
  body: t.string,
  done: tt.BooleanFromNumber,
});

export type TodoUpdate = t.TypeOf<typeof TodoUpdate>;
export const TodoUpdate = t.partial({ body: t.string, done: t.boolean });
