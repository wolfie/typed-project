import * as React from "react";
import useUser from "../useUser";
import "./Login.css";
import classes from "../classes";

const Login: React.FC = () => {
  const user = useUser();
  const userRef = React.useRef<HTMLInputElement>(null);
  const passRef = React.useRef<HTMLInputElement>(null);

  if (user.state === "logged-in") {
    return (
      <div className="login-box">
        <div>Username: {user.username}</div>
        <div>
          <button onClick={user.logout}>Logout</button>
        </div>
      </div>
    );
  } else {
    return (
      <form
        onSubmit={e => {
          e.preventDefault();
          user.state !== "loading" && user.login(userRef.current?.value ?? "", passRef.current?.value ?? "");
        }}
      >
        <div className={classes("login-box", { loading: user.state === "loading" })}>
          <div>
            Username: <input ref={userRef} disabled={user.state === "loading"} placeholder="user" />
          </div>
          <div>
            Password: <input ref={passRef} disabled={user.state === "loading"} placeholder="user" type="password" />
          </div>
          <div>
            <button disabled={user.state === "loading"} type="submit">
              Login
            </button>
          </div>
        </div>
      </form>
    );
  }
};

export default Login;
