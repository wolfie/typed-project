import * as React from "react";
import classes from "../classes";
import "./NewTodo.css";
import * as t from "io-ts";
import getFormValues from "./getFormValues";
import useUser from "../useUser";
import { useTodoNew } from "../services/todo";

const NewTodo: React.FC<{ onAdd: () => void }> = ({ onAdd }) => {
  const [open, setOpen] = React.useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);
  const user = useUser();
  const createTodo = useTodoNew(user.state === "logged-in" ? user.user.id : undefined);

  const handleSubmit = React.useCallback<React.FormEventHandler>(
    e => {
      e.preventDefault();
      const { todo: body } = getFormValues(e, { todo: t.string });
      body &&
        createTodo.state !== "loading" &&
        createTodo.exec(body).then(() => {
          formRef.current?.reset();
          setOpen(false);
          onAdd();
        });
    },
    [createTodo, onAdd]
  );

  return (
    <div className={classes("new-todo", { open })}>
      <form onSubmit={handleSubmit}>
        <textarea
          disabled={createTodo.state === "loading"}
          name="todo"
          onFocus={() => setOpen(true)}
          placeholder="new todo"
        />
        <div className="buttons">
          <button disabled={createTodo.state === "loading"} type="submit">
            Save
          </button>
          <button type="button" onClick={() => setOpen(false)}>
            Close
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewTodo;
