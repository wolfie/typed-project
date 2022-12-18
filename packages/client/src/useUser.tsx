import * as React from "react";
import { LoginInfo, useLogin } from "./services/user";
import useLocalStorage from "./useLocalStorage";

type UseUser =
  | { state: "loading" }
  | { state: "logged-out"; login: (username: string, password: string) => void }
  | { state: "logged-in"; user: LoginInfo; logout: () => void };
const UserContext = React.createContext<UseUser>({
  state: "logged-out",
  login: () => {
    throw new Error("User context missing");
  },
});

export const UserProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  // ⚠️ DO NOT DO THIS IN AN ACTUAL APPLICATION, SUPER DANGEROUS ⚠️
  const [userFromLocalStorage, setUserFromLocalStorage, clearUserFromLocalStorage] = useLocalStorage(
    "login",
    LoginInfo
  );
  const loginState = useLogin();

  const value = React.useMemo<UseUser>(() => {
    const logout = () => {
      clearUserFromLocalStorage();
      loginState.state === "done" && loginState.override(undefined);
    };

    if (userFromLocalStorage.status === "done") {
      return { state: "logged-in", user: userFromLocalStorage.data, logout } satisfies UseUser;
    }

    return (
      loginState.state === "loading"
        ? { state: "loading" }
        : loginState.state === "done" && loginState.data
        ? { state: "logged-in", user: loginState.data, logout }
        : {
            state: "logged-out",
            login: (username, password) =>
              loginState.exec(username, password).then(value => value && setUserFromLocalStorage(value)),
          }
    ) satisfies UseUser;
  }, [loginState, userFromLocalStorage]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

const useUser = () => React.useContext(UserContext);
export default useUser;
