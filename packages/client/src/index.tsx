import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Todos from "./routes/Todos";
import Todo from "./routes/Todo";
import { UserProvider } from "./useUser";
import Login from "./Login";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <React.StrictMode>
    <UserProvider>
      <Login />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Todos />} />
          <Route path="/:todoId/" element={<Todo />} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  </React.StrictMode>
);
