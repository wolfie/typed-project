import * as React from "react";
import Todo from "./components/Todo";
import NewTodo from "./components/NewTodo";
import { useDeleteDone, useTodoEdit, useTodos } from "./services/todo";
import "./TodosView.css";
import useUser from "./useUser";
import { Delete } from "./components/icons";
import { ioTsUtils } from "typed-project-common";
import { useParams } from "react-router-dom";
import * as t from "io-ts";
import * as tt from "io-ts-types";
import IconButton from "./components/IconButton";

const TodosView: React.FC<{ todoId?: number }> = ({ todoId }) => {
  const todosState = useTodos();
  const editTodoState = useTodoEdit();
  const deleteDoneState = useDeleteDone();
  const user = useUser();

  React.useEffect(() => {
    if (editTodoState.state !== "done" || todosState.state !== "done") return;

    const newTodo = editTodoState.data;
    todosState.override(oldTodos => oldTodos.map(t => (t.id === newTodo?.id ? newTodo : t)));
  }, [editTodoState.state]);

  const handleChangesFor = React.useCallback(
    (todoId: number) => async (updates: { body?: string; done?: boolean }) => {
      if (editTodoState.state === "loading") return;
      await editTodoState.exec(todoId, updates);
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
          <div className="delete">
            <IconButton
              title={user.state === "logged-in" ? "Delete all done" : "Log in first"}
              disabled={user.state !== "logged-in"}
              onClick={() =>
                todosState.data.some(todo => todo.done) &&
                deleteDoneState.state !== "loading" &&
                deleteDoneState.exec().then(todosState.refetch)
              }
            >
              <Delete />
            </IconButton>
          </div>
          {todosState.data.map(todo => (
            <Todo key={todo.id} todo={todo} open={todo.id === todoId} onUpdate={handleChangesFor(todo.id)} />
          ))}
          {user.state === "logged-in" ? <NewTodo onAdd={handleOnAdd} /> : "Log in to create new"}
        </>
      )}
    </section>
  );
};

export default () => <TodosView {...ioTsUtils.decode(t.partial({ todoId: tt.IntFromString }), useParams())} />;
