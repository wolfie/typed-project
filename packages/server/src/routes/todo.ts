import { route, router, Route, Response, Parser } from "typera-express";
import db, { getAllTodos, getTodo, TodoRead, updateTodo } from "../db";
import logger from "../logger";
import SecureError from "../SecureError";
import * as t from "io-ts";
import { IotsError } from "typed-project-common";
import { Middleware } from "typera-express/middleware";
import { BadRequest } from "typera-express/response";

const log = logger("todo route");

type CaughtInternalServerError = Response.InternalServerError<{ message: string }>;

const bodyParser = <T extends t.Any>(
  type: T
): Middleware<{ body: t.TypeOf<T> }, BadRequest<{ message: string; error: any }>> =>
  Parser.bodyP(type, e =>
    Response.badRequest({
      message: "Bad request",
      error: e.map(IotsError.getReadableError),
    })
  );

// this is needed, since just returning `undefined` will cause problems with encoders/decoders
type Data<T> = { data: T };
const ResponseOkData = <T>(data: T) => Response.ok({ data });

const ResponseInternalServerError = (e: unknown) => {
  log(e);
  return Response.internalServerError({
    message: `Internal Server Error${e instanceof SecureError ? `: ${e.publicError}` : ""}`,
  });
};

const getAllTodosRoute: Route<Response.Ok<Data<TodoRead[]>> | CaughtInternalServerError> = route
  .get("/")
  .handler(() => db.then(getAllTodos()).then(ResponseOkData).catch(ResponseInternalServerError));

const getTodoRoute: Route<Response.Ok<Data<TodoRead | undefined>> | CaughtInternalServerError> = route
  .get("/:id(int)")
  .handler(ctx => db.then(getTodo(ctx.routeParams.id)).then(ResponseOkData).catch(ResponseInternalServerError));

const patchTodoRoute: Route<
  | Response.Ok<Data<TodoRead | undefined>>
  | Response.BadRequest<{ message: string; error: any[] }>
  | CaughtInternalServerError
> = route
  .patch("/:id(int)")
  .use(bodyParser(t.partial({ body: t.string, done: t.boolean })))
  .handler(async ctx => {
    try {
      const { id } = ctx.routeParams;
      await db.then(updateTodo(id, ctx.body));
      return ResponseOkData(await db.then(getTodo(id)));
    } catch (e) {
      log(e);
      return Response.internalServerError({
        message: `Internal Server Error${e instanceof SecureError ? `: ${e.publicError}` : ""}`,
      });
    }
  });

export default router(getAllTodosRoute, getTodoRoute, patchTodoRoute).handler();
