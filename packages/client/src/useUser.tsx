import * as React from "react";
import { useLogin } from "./services/user";

type UseUser =
  | { state: "loading" }
  | { state: "logged-out"; login: (username: string, password: string) => void }
  | { state: "logged-in"; user: { id: string; username: string }; logout: () => void };
const UserContext = React.createContext<UseUser>({
  state: "logged-out",
  login: () => {
    throw new Error("User context missing");
  },
});

export const UserProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const loginState = useLogin();

  const value = React.useMemo<UseUser>(
    () =>
      loginState.state === "loading"
        ? { state: "loading" }
        : loginState.state === "done" && loginState.data
        ? {
            state: "logged-in",
            user: loginState.data,
            logout: () => loginState.override(undefined),
          }
        : { state: "logged-out", login: loginState.exec },
    [loginState]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

const useUser = () => React.useContext(UserContext);
export default useUser;
