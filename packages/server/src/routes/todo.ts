import { route, router, Route, Response, Parser } from "typera-express";
import db, { getAllTodos, getTodo, Todo, updateTodoBody } from "../db";
import logger from "../logger";
import SecureError from "../SecureError";
import * as t from "io-ts";
import { IotsError } from "typed-project-common";

const log = logger("todo route");

type CaughtInternalServerError = Response.InternalServerError<{ message: string }>;

const bodyParser = <T extends t.Any>(type: T) =>
  Parser.bodyP(type, e =>
    Response.badRequest({
      message: "Bad request",
      error: e.map(IotsError.getReadableError),
    })
  );

// this is needed, since just returning `undefined` will cause problems with encoders/decoders
type Data<T> = { data: T };
const ResponseOkData = <T>(data: T) => Response.ok({ data });

const getAllTodosRoute: Route<Response.Ok<Data<Todo[]>> | CaughtInternalServerError> = route
  .get("/")
  .handler(async () => {
    try {
      const todos = await db.then(db => getAllTodos(db));
      return ResponseOkData(todos);
    } catch (e) {
      log(e);
      return Response.internalServerError({
        message: `Internal Server Error${e instanceof SecureError ? `: ${e.publicError}` : ""}`,
      });
    }
  });

const getTodoRoute: Route<Response.Ok<Data<Todo | undefined>> | CaughtInternalServerError> = route
  .get("/:id(int)")
  .handler(async ctx => {
    try {
      const todo = await db.then(db => getTodo(db, ctx.routeParams.id));
      return ResponseOkData(todo);
    } catch (e) {
      log(e);
      return Response.internalServerError({
        message: `Internal Server Error${e instanceof SecureError ? `: ${e.publicError}` : ""}`,
      });
    }
  });

const patchTodoRoute: Route<
  Response.Ok<void> | Response.BadRequest<{ message: string; error: any[] }> | CaughtInternalServerError
> = route
  .patch("/:id(int)")
  .use(bodyParser(t.type({ body: t.string })))
  .handler(async ctx => {
    try {
      await db.then(db => updateTodoBody(db, { body: ctx.body.body, id: ctx.routeParams.id }));
      return Response.ok();
    } catch (e) {
      log(e);
      return Response.internalServerError({
        message: `Internal Server Error${e instanceof SecureError ? `: ${e.publicError}` : ""}`,
      });
    }
  });

export default router(getAllTodosRoute, getTodoRoute, patchTodoRoute).handler();
