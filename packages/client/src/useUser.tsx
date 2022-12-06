import * as React from "react";
import { useLogin } from "./services/user";

type UseUser =
  | { state: "loading" }
  | { state: "logged-out"; login: (username: string, password: string) => void }
  | { state: "logged-in"; username: string | undefined; logout: () => void };
const UserContext = React.createContext<UseUser>({
  state: "logged-out",
  login: () => {
    throw new Error("User context missing");
  },
});

export const UserProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const loginState = useLogin();
  const [state, setState] = React.useState<UseUser["state"]>("logged-out");

  React.useEffect(() => {
    if (loginState.state === "loading") {
      setState("loading");
    } else if (loginState.state === "done") {
      setState(loginState.data ? "logged-in" : "logged-out");
    }
  }, [loginState]);

  const value = React.useMemo<UseUser>(
    () =>
      state === "loading"
        ? { state }
        : state === "logged-in"
        ? { state, username: loginState.state === "done" ? loginState.data : "", logout: () => setState("logged-out") }
        : { state, login: loginState.state !== "loading" ? loginState.exec : () => undefined },
    [state, loginState]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

const useUser = () => React.useContext(UserContext);
export default useUser;
