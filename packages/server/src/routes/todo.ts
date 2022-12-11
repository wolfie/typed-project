import { route, router, Route, Response } from "typera-express";
import db from "../db";
import logger from "../logger";
import * as t from "io-ts";
import { Todo, TodoCreate, TodoUpdate } from "typed-project-common";
import {
  BadRequestBodyError,
  bodyParser,
  CaughtInternalServerError,
  DataOk,
  queryParser,
  ResponseOkData,
  ResponseOkEmpty,
} from "./util";

const log = logger("todo route");

const ResponseInternalServerError = (e: unknown) => {
  log(e);
  return Response.internalServerError({ message: "Internal Server Error" });
};

const getAllTodosRoute: Route<DataOk<Todo[]> | CaughtInternalServerError> = route
  .get("/")
  .handler(() => db.getAllTodos().then(ResponseOkData).catch(ResponseInternalServerError));

const postTodoRoute: Route<DataOk | BadRequestBodyError | CaughtInternalServerError> = route
  .post("/")
  .use(bodyParser(TodoCreate))
  .handler(ctx =>
    db.createTodo(ctx.body.authorId, ctx.body.body).then(ResponseOkEmpty).catch(ResponseInternalServerError)
  );

const deleteTodoRoute: Route<DataOk | BadRequestBodyError | CaughtInternalServerError> = route
  .delete("/")
  .use(queryParser({ done: t.literal("true") }))
  .handler(() => db.deleteDoneTodos().then(ResponseOkEmpty).catch(ResponseInternalServerError));

const getTodoRoute: Route<DataOk<Todo | undefined> | CaughtInternalServerError> = route
  .get("/:id(int)")
  .handler(ctx => db.getTodo(ctx.routeParams.id).then(ResponseOkData).catch(ResponseInternalServerError));

const patchTodoRoute: Route<DataOk<Todo | undefined> | BadRequestBodyError | CaughtInternalServerError> = route
  .patch("/:id(int)")
  .use(bodyParser(TodoUpdate))
  .handler(async ctx => {
    try {
      const { id } = ctx.routeParams;
      await db.updateTodo(id, ctx.body);
      return ResponseOkData(await db.getTodo(id));
    } catch (e) {
      return ResponseInternalServerError(e);
    }
  });

export default router(getAllTodosRoute, postTodoRoute, deleteTodoRoute, getTodoRoute, patchTodoRoute).handler();
