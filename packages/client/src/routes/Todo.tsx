import * as React from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import * as t from "io-ts";
import * as tt from "io-ts-types";
import { ioTsUtils } from "typed-project-common";
import { Todo as TodoType, useTodo, useTodoEdit } from "../services/todo";

const ReadTodoBody: React.FC<{ todo: TodoType; onEdit: () => void }> = ({ todo, onEdit }) => (
  <>
    <ul>
      <li>Author: {todo.username}</li>
      <li>Body: {todo.body}</li>
      <li>Done: {todo.done ? "true" : "false"}</li>
    </ul>
    <button onClick={onEdit}>Edit</button>
  </>
);

const EditTodoBody: React.FC<{
  todo: TodoType;
  onSave: (todo: { body: string; done: boolean }) => void;
  onCancel: () => void;
}> = ({ todo, onSave, onCancel }) => {
  const bodyRef = React.useRef<HTMLInputElement>(null);
  const doneRef = React.useRef<HTMLInputElement>(null);
  return (
    <>
      <ul>
        <li>Author: {todo.username}</li>
        <li>
          Body: <input ref={bodyRef} type="text" defaultValue={todo.body} />
        </li>
        <li>
          Done: <input ref={doneRef} type="checkbox" defaultChecked={todo.done} />
        </li>
      </ul>
      <button
        onClick={() =>
          bodyRef.current && doneRef.current && onSave({ body: bodyRef.current.value, done: doneRef.current.checked })
        }
      >
        Save
      </button>
      <button onClick={onCancel}>Cancel</button>
    </>
  );
};

const Todo: React.FC<{ todoId: number }> = ({ todoId: id }) => {
  const todoState = useTodo(id);
  const todoEditState = useTodoEdit(id);
  const [params, setParams] = useSearchParams();
  const editing = params.get("edit") !== null;

  React.useEffect(() => {
    if (todoEditState.state !== "done") return;
    setParams(undefined, { preventScrollReset: true });
  }, [setParams, todoEditState.state]);

  if (todoState.state === "error") {
    return <div>Something weird happened</div>;
  }

  const effectiveTodo =
    todoEditState.state === "done" ? todoEditState.data : todoState.state === "done" ? todoState.data : undefined;

  return (
    <section>
      <Link to="/">Root</Link>
      <div>Todo {id}</div>
      {todoState.state === "loading" ? (
        <div>Loading</div>
      ) : !effectiveTodo ? (
        <div>Not found</div>
      ) : editing ? (
        <EditTodoBody
          todo={effectiveTodo}
          onSave={(todo: { body: string; done: boolean }) =>
            todoEditState.state !== "loading" && todoEditState.exec(todo)
          }
          onCancel={() => setParams(undefined, { preventScrollReset: true })}
        />
      ) : (
        <ReadTodoBody todo={effectiveTodo} onEdit={() => setParams({ edit: "" }, { preventScrollReset: true })} />
      )}
    </section>
  );
};

export default () => <Todo {...ioTsUtils.decode(t.type({ todoId: tt.IntFromString }), useParams())} />;
