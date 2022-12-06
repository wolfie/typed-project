import * as React from "react";
import Todo from "../components/Todo";
import { useTodoEdit, useTodos } from "../services/todo";
import "./TodosView.css";

const TodosView: React.FC = () => {
  const todosState = useTodos();
  const editTodoState = useTodoEdit();

  React.useEffect(() => {
    if (editTodoState.state !== "done" || todosState.state !== "done") return;

    const newTodo = editTodoState.data;
    todosState.override(oldTodos => oldTodos.map(t => (t.id === newTodo?.id ? newTodo : t)));
  }, [editTodoState.state]);

  const handleDoneChange = React.useCallback(
    (id: number, done: boolean) => {
      if (editTodoState.state === "loading") return;
      editTodoState.exec(id, { done });
    },
    [editTodoState]
  );

  if (todosState.state === "error") {
    return <div>Something weird happened</div>;
  }

  return (
    <section className="todos">
      {todosState.state === "loading" ? (
        "Loading..."
      ) : (
        <div className="todos-container">
          {todosState.data.map(todo => (
            <Todo key={todo.id} todo={todo} onChangeDone={done => handleDoneChange(todo.id, done)} />
          ))}
        </div>
      )}
    </section>
  );
};

export default TodosView;
