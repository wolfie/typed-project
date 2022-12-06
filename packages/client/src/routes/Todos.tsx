import * as React from "react";
import { Link } from "react-router-dom";
import { useTodoEdit, useTodos } from "../services/todo";

const Index: React.FC = () => {
  const todosState = useTodos();
  const editTodoState = useTodoEdit();

  React.useEffect(() => {
    if (editTodoState.state !== "done" || todosState.state !== "done") return;

    const newTodo = editTodoState.data;
    todosState.override(oldTodos => oldTodos.map(t => (t.id === newTodo?.id ? newTodo : t)));
  }, [editTodoState.state]);

  if (todosState.state === "error") {
    return <div>Something weird happened</div>;
  }

  return todosState.state === "loading" ? (
    <div>Loading...</div>
  ) : (
    <section>
      <div>Index</div>
      <ul>
        {todosState.data.map(todo => (
          <li key={todo.id}>
            <input
              disabled={editTodoState.state === "loading"}
              type="checkbox"
              defaultChecked={todo.done}
              onChange={e =>
                editTodoState.state !== "loading" && editTodoState.exec(todo.id, { done: e.currentTarget.checked })
              }
            />
            <Link
              to={`/${todo.id}/`}
              style={{
                textDecoration: todo.done ? "line-through" : undefined,
                opacity: todo.done ? 0.5 : undefined,
              }}
            >
              Todo {todo.id}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default Index;
