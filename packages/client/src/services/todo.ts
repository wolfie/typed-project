import env from "../env";
import * as t from "io-ts";
import useFetch from "./useFetch";

const Possible = <T extends t.Any>(Type: T) => t.union([Type, t.undefined]);

const Todo = t.type({ id: t.number, author: t.string, body: t.string });
export type Todo = t.TypeOf<typeof Todo>;
export const useTodo = (id: number) => useFetch(`${env.REACT_APP_TODO_SERVICE_URL}/${id}`, Possible(Todo));

const Todos = t.array(Todo);
export const useTodos = () => useFetch(env.REACT_APP_TODO_SERVICE_URL, Todos);
