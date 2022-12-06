import * as React from "react";
import useUser from "./useUser";

const Login: React.FC = () => {
  const user = useUser();
  const userRef = React.useRef<HTMLInputElement>(null);
  const passRef = React.useRef<HTMLInputElement>(null);

  if (user.state === "logged-in") {
    return (
      <ul>
        <li>Username: {user.username}</li>
        <li>
          <button onClick={user.logout}>Logout</button>
        </li>
      </ul>
    );
  } else {
    return (
      <form
        onSubmit={e => {
          e.preventDefault();
          user.state !== "loading" && user.login(userRef.current?.value ?? "", passRef.current?.value ?? "");
        }}
      >
        <ul
          style={{
            pointerEvents: user.state === "loading" ? "none" : undefined,
            opacity: user.state === "loading" ? 0.5 : undefined,
            cursor: user.state === "loading" ? "wait" : undefined,
          }}
        >
          <li>
            Username: <input ref={userRef} />
          </li>
          <li>
            Password: <input ref={passRef} type="password" />
          </li>
          <button type="submit">Login</button>
        </ul>
      </form>
    );
  }
};

export default Login;
