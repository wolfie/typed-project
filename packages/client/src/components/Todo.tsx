import * as React from "react";
import { Link } from "react-router-dom";
import classes from "../classes";
import { Todo as TodoType } from "../services/todo";
import useUser from "../useUser";
import getFormValues from "./getFormValues";
import IconButton from "./IconButton";
import IconCheckbox from "./IconCheckbox";
import { Edit } from "./icons";
import "./Todo.css";
import * as t from "io-ts";

const Todo: React.FC<{
  todo: TodoType;
  open?: boolean;
  onUpdate: (updates: { body?: string; done?: boolean }) => Promise<void>;
}> = ({ todo, open, onUpdate }) => {
  const [editing, setEditing] = React.useState(false);
  const rotation = React.useMemo(() => Math.random() * 4 - 2, [todo.done]);
  const user = useUser();
  const formRef = React.useRef<HTMLFormElement>(null);

  React.useEffect(() => {
    if (!open) setEditing(false);
  }, [open]);

  const handleSubmit = React.useCallback<React.FormEventHandler<HTMLFormElement>>(
    e => {
      e.preventDefault();
      const updates = getFormValues(e, { body: t.string });
      onUpdate(updates).then(() => setEditing(false));
    },
    [onUpdate]
  );

  return (
    <Link
      to={open ? "/" : `/${todo.id}`}
      style={{ "--rotation": `${rotation}deg` } as any}
      className={classes("todo", { done: todo.done })}
      draggable={false}
      onClickCapture={e =>
        (user.state !== "logged-in" || editing) &&
        e.target instanceof HTMLElement &&
        e.target.tagName === "SPAN" &&
        e.preventDefault()
      }
      onClick={e => e.currentTarget instanceof HTMLElement && e.currentTarget.tagName === "LABEL" && e.preventDefault()}
    >
      <IconCheckbox
        disabled={editing || user.state !== "logged-in"}
        disabledTitle="Log in first"
        defaultChecked={todo.done}
        onChange={e => onUpdate({ done: e.currentTarget.checked })}
      />
      <form onSubmit={handleSubmit} ref={formRef}>
        <div className="body">
          <input
            name="body"
            onClick={e => open && editing && e.preventDefault()}
            defaultValue={todo.body}
            readOnly={!open || !editing}
          />
          {open && (
            <>
              <div>Author: {todo.username}</div>
              {open && editing ? (
                <div className="button-bar">
                  <button
                    type="submit"
                    onClick={e => {
                      e.preventDefault();
                      formRef.current?.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
                    }}
                  >
                    Submit
                  </button>
                  <button
                    type="button"
                    onClick={e => {
                      e.preventDefault();
                      setEditing(false);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              ) : !todo.done ? (
                <IconButton
                  disabled={user.state !== "logged-in"}
                  title={user.state !== "logged-in" ? "log in first" : undefined}
                  onClick={() => setEditing(true)}
                >
                  <Edit />
                </IconButton>
              ) : null}
            </>
          )}
        </div>
      </form>
    </Link>
  );
};

export default Todo;
