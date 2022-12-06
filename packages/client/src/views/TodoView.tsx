import * as React from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import * as t from "io-ts";
import * as tt from "io-ts-types";
import { ioTsUtils } from "typed-project-common";
import { Todo as TodoType, useTodo, useTodoEditWithId } from "../services/todo";
import useUser from "../useUser";

const ReadTodoBody: React.FC<{ todo: TodoType; onEdit: () => void }> = ({ todo, onEdit }) => {
  const user = useUser();
  return (
    <>
      <ul>
        <li>Author: {todo.username}</li>
        <li>Body: {todo.body}</li>
        <li>Done: {todo.done ? "true" : "false"}</li>
      </ul>
      {user.state === "logged-in" ? <button onClick={onEdit}>Edit</button> : "Log in to edit todo"}
    </>
  );
};

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

const TodoView: React.FC<{ todoId: number }> = ({ todoId: id }) => {
  const todoState = useTodo(id);
  const todoEditState = useTodoEditWithId(id);
  const [params, setParams] = useSearchParams();
  const editing = params.get("edit") !== null;
  const user = useUser();

  React.useEffect(() => {
    if (todoEditState.state !== "done") return;
    todoState.state === "done" && todoState.override(todoEditState.data);
    setParams(undefined, { preventScrollReset: true });
  }, [setParams, todoEditState.state]);

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
      ) : editing && user.state === "logged-in" ? (
        <EditTodoBody
          todo={todoState.data}
          onSave={(todo: { body: string; done: boolean }) =>
            todoEditState.state !== "loading" && todoEditState.exec(todo)
          }
          onCancel={() => setParams(undefined, { preventScrollReset: true })}
        />
      ) : (
        <ReadTodoBody todo={todoState.data} onEdit={() => setParams({ edit: "" }, { preventScrollReset: true })} />
      )}
    </section>
  );
};

export default () => <TodoView {...ioTsUtils.decode(t.type({ todoId: tt.IntFromString }), useParams())} />;