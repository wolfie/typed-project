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
      <div className="main">
        <div>
          <Login />
          <header>
            <img src={`${process.env.PUBLIC_URL}/logo.png`} alt="logo" />
            <h1>Typed Todo</h1>
          </header>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Todos />} />
              <Route path="/:todoId/" element={<Todo />} />
            </Routes>
          </BrowserRouter>
        </div>
      </div>
    </UserProvider>
  </React.StrictMode>
);
