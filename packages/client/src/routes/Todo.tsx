import * as React from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import * as t from "io-ts";
import * as tt from "io-ts-types";
import { ioTsUtils } from "typed-project-common";
import { Todo as TodoType, useTodo } from "../services/todo";

const ReadTodoBody: React.FC<{ todo: TodoType; onEdit: () => void }> = ({ todo, onEdit }) => (
  <>
    <ul>
      <li>Author: {todo.author}</li>
      <li>Body: {todo.body}</li>
    </ul>
    <button onClick={onEdit}>Edit</button>
  </>
);

const EditTodoBody: React.FC<{ todo: TodoType; onSave: (todo: TodoType) => void; onCancel: () => void }> = ({
  todo,
  onSave,
  onCancel,
}) => {
  return (
    <>
      <ul>
        <li>Author: {todo.author}</li>
        <li>Body: {todo.body}</li>
      </ul>
      <button onClick={() => onSave(todo)}>Save</button>
      <button onClick={onCancel}>Cancel</button>
    </>
  );
};

const Todo: React.FC<{ todoId: number }> = ({ todoId: id }) => {
  const todoState = useTodo(id);
  const [params, setParams] = useSearchParams();
  const editing = params.get("edit") !== null;

  const handleOnEdit = React.useCallback(() => setParams({ edit: "" }, { preventScrollReset: true }), [setParams]);
  const handleOnSave = React.useCallback(() => setParams(undefined, { preventScrollReset: true }), [setParams]);
  const handleOnCancel = React.useCallback(() => setParams(undefined, { preventScrollReset: true }), [setParams]);

  if (todoState.state === "error") {
    return <div>Something weird happened</div>;
  }

  return (
    <section>
      <Link to="/">Root</Link>
      <div>Todo {id}</div>
      {todoState.state === "loading" ? (
        <div>Loading</div>
      ) : !todoState.data ? (
        <div>Not found</div>
      ) : editing ? (
        <EditTodoBody todo={todoState.data} onSave={handleOnSave} onCancel={handleOnCancel} />
      ) : (
        <ReadTodoBody todo={todoState.data} onEdit={handleOnEdit} />
      )}
    </section>
  );
};

export default () => <Todo {...ioTsUtils.decode(t.type({ todoId: tt.IntFromString }), useParams())} />;
