import { route, Route, Parser, Response, router } from "typera-express";
import { DataOk, ResponseOkData } from "./util";
import * as t from "io-ts";
import { BadRequest } from "typera-express/response";
import { Middleware } from "typera-express/middleware";
import { IotsError, LoginResponse } from "typed-project-common";
import db from "../db";

type BadRequestQueryError = BadRequest<{ message: string; error: any }>;
const queryParser = <T extends t.Any>(type: T): Middleware<{ query: t.TypeOf<T> }, BadRequestQueryError> =>
  Parser.queryP(type, e =>
    Response.badRequest({
      message: "Bad request",
      error: e.map(IotsError.getReadableError),
    })
  );

const sleep = <FN extends () => any>(cb: FN, ms: number): Promise<Awaited<ReturnType<FN>>> =>
  new Promise(res => setTimeout(() => res(cb()), ms));

const getAuth: Route<DataOk<LoginResponse> | BadRequestQueryError> = route
  .get("/")
  .use(queryParser(t.type({ username: t.string, password: t.string })))
  .handler(ctx => sleep(() => db.checkIfUserExists(ctx.query.username, ctx.query.password).then(ResponseOkData), 1000));

export default router(getAuth).handler();
