import { route, router, Route, Response, Parser, RequestHandler } from "typera-express";
import db, { getAllTodos, Todo, updateTodoBody } from "../db";
import logger from "../logger";
import SecureError from "../SecureError";
import * as t from "io-ts";
import { getReadableError } from "../IotsError";

const log = logger("todo route");

type CaughtInternalServerError = Response.InternalServerError<{ message: string }>;

const bodyParser = <T extends t.Any>(type: T) =>
  Parser.bodyP(type, e =>
    Response.badRequest({
      message: "Bad request",
      error: e.map(getReadableError),
    })
  );

const getAllTodosRoute: Route<Response.Ok<Todo[]> | CaughtInternalServerError> = route.get("/").handler(async () => {
  try {
    return Response.ok<Todo[]>(await db.then(db => getAllTodos(db)));
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

export default router(getAllTodosRoute, patchTodoRoute).handler();
