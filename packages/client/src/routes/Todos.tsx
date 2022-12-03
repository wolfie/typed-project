import * as React from "react";
import { Link } from "react-router-dom";
import { useTodos } from "../services/todo";

const Index: React.FC = () => {
  const todosState = useTodos();

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
            <Link to={`/${todo.id}/`}>Todo {todo.id}</Link>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default Index;
