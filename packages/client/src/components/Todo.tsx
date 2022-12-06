import * as React from "react";
import { Link } from "react-router-dom";
import classes from "../classes";
import { Todo as TodoType } from "../services/todo";
import useUser from "../useUser";
import IconCheckbox from "./IconCheckbox";
import "./Todo.css";

const Todo: React.FC<{ todo: TodoType; onChangeDone: (done: boolean) => void }> = ({ todo, onChangeDone }) => {
  const rotation = React.useMemo(() => Math.random() * 4 - 2, [todo.done]);
  const user = useUser();

  return (
    <Link
      to={`/${todo.id}`}
      style={{ "--rotation": `${rotation}deg` } as any}
      className={classes("todo", { done: todo.done })}
      onClick={e => e.currentTarget instanceof HTMLElement && e.currentTarget.tagName === "LABEL" && e.preventDefault()}
    >
      {user.state === "logged-in" && (
        <IconCheckbox defaultChecked={todo.done} onChange={e => onChangeDone(e.currentTarget.checked)} />
      )}
      <div>{todo.body}</div>
    </Link>
  );
};

export default Todo;
