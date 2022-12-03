import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Todos from "./routes/Todos";
import Todo from "./routes/Todo";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Todos />} />
        <Route path="/:todoId/" element={<Todo />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
