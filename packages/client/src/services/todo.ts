import env from "../env";
import * as t from "io-ts";
import useFetch, { NO_REQUEST, useFetchLazy } from "./useFetch";
import { TodoUpdate } from "typed-project-common";

const Possible = <T extends t.Any>(Type: T) => t.union([Type, t.undefined]);

const Todo = t.type({ id: t.number, username: t.string, body: t.string, done: t.boolean });
export type Todo = t.TypeOf<typeof Todo>;
export const useTodo = (id: number) => useFetch(`${env.REACT_APP_TODO_SERVICE_URL}/${id}`, Possible(Todo));

export const useTodoEditWithId = (id: number) =>
  useFetchLazy(
    { method: "PATCH", url: `${env.REACT_APP_TODO_SERVICE_URL}/${id}` },
    (body: TodoUpdate) => ({ body }),
    Possible(Todo)
  );

export const useTodoEdit = () =>
  useFetchLazy(
    { method: "PATCH" },
    (id: number, body: TodoUpdate) => ({ url: `${env.REACT_APP_TODO_SERVICE_URL}/${id}`, body }),
    Possible(Todo)
  );

const Todos = t.array(Todo);
export const useTodos = () => useFetch(env.REACT_APP_TODO_SERVICE_URL, Todos);

export const useTodoNew = (authorId: string | undefined) =>
  useFetchLazy(
    { method: "POST" },
    (body: string) => (authorId ? { url: `${env.REACT_APP_TODO_SERVICE_URL}`, body: { authorId, body } } : NO_REQUEST),
    t.void
  );

export const useDeleteDone = () =>
  useFetchLazy({ method: "DELETE", url: `${env.REACT_APP_TODO_SERVICE_URL}?done=true` });
