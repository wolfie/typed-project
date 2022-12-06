import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import TodosView from "./views/TodosView";
import TodoView from "./views/TodoView";
import { UserProvider } from "./useUser";
import Login from "./components/Login";

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
              <Route path="/" element={<TodosView />} />
              <Route path="/:todoId/" element={<TodoView />} />
            </Routes>
          </BrowserRouter>
        </div>
      </div>
    </UserProvider>
  </React.StrictMode>
);
