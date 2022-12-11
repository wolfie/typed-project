import { route, router, Route, Response, Parser } from "typera-express";
import db from "../db";
import logger from "../logger";
import * as t from "io-ts";
import { IotsError, Todo, TodoCreate, TodoUpdate } from "typed-project-common";
import { Middleware } from "typera-express/middleware";
import { BadRequest } from "typera-express/response";
import { CaughtInternalServerError, DataOk, ResponseOkData, ResponseOkEmpty } from "./util";

const log = logger("todo route");

type BadRequestBodyError = BadRequest<{ message: string; error: any }>;
const bodyParser = <T extends t.Any>(type: T): Middleware<{ body: t.TypeOf<T> }, BadRequestBodyError> =>
  Parser.bodyP(type, e =>
    Response.badRequest({
      message: "Bad request",
      error: e.map(IotsError.getReadableError),
    })
  );

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

export default router(getAllTodosRoute, postTodoRoute, getTodoRoute, patchTodoRoute).handler();
