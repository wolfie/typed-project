import * as React from "react";
import Todo from "../components/Todo";
import NewTodo from "../components/NewTodo";
import { useTodoEdit, useTodos } from "../services/todo";
import "./TodosView.css";
import useUser from "../useUser";

const TodosView: React.FC = () => {
  const todosState = useTodos();
  const editTodoState = useTodoEdit();
  const user = useUser();

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

  const handleOnAdd = React.useCallback(() => {
    console.log("refetch");
    todosState.state !== "loading" && todosState.refetch();
  }, [todosState]);

  if (todosState.state === "error") {
    return <div>Something weird happened</div>;
  }

  return (
    <section className="todos">
      {todosState.state === "loading" ? (
        "Loading..."
      ) : (
        <>
          {todosState.data.map(todo => (
            <Todo key={todo.id} todo={todo} onChangeDone={done => handleDoneChange(todo.id, done)} />
          ))}
          {user.state === "logged-in" ? <NewTodo onAdd={handleOnAdd} /> : "Log in to create new"}
        </>
      )}
    </section>
  );
};

export default TodosView;
