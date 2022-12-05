import env from "../env";
import * as t from "io-ts";
import useFetch, { useFetchLazy } from "./useFetch";

const Possible = <T extends t.Any>(Type: T) => t.union([Type, t.undefined]);

const Todo = t.type({ id: t.number, username: t.string, body: t.string, done: t.boolean });
export type Todo = t.TypeOf<typeof Todo>;
export const useTodo = (id: number) => useFetch(`${env.REACT_APP_TODO_SERVICE_URL}/${id}`, Possible(Todo));

export const useTodoEditWithId = (id: number) =>
  useFetchLazy(
    { method: "PATCH", url: `${env.REACT_APP_TODO_SERVICE_URL}/${id}` },
    (body: { body?: string; done?: boolean }) => ({ body: JSON.stringify(body) }),
    Possible(Todo)
  );

export const useTodoEdit = () =>
  useFetchLazy(
    { method: "PATCH" },
    (id: number, body: { body?: string; done?: boolean }) => ({
      url: `${env.REACT_APP_TODO_SERVICE_URL}/${id}`,
      body: JSON.stringify(body),
    }),
    Possible(Todo)
  );

const Todos = t.array(Todo);
export const useTodos = () => useFetch(env.REACT_APP_TODO_SERVICE_URL, Todos);
