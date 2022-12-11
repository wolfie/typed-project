import { route, Route, router } from "typera-express";
import { BadRequestQueryError, DataOk, queryParser, ResponseOkData } from "./util";
import * as t from "io-ts";
import { LoginResponse } from "typed-project-common";
import db from "../db";

const sleep = <FN extends () => any>(cb: FN, ms: number): Promise<Awaited<ReturnType<FN>>> =>
  new Promise(res => setTimeout(() => res(cb()), ms));

const getAuth: Route<DataOk<LoginResponse> | BadRequestQueryError> = route
  .get("/")
  .use(queryParser({ username: t.string, password: t.string }))
  .handler(ctx => sleep(() => db.checkIfUserExists(ctx.query.username, ctx.query.password).then(ResponseOkData), 1000));

export default router(getAuth).handler();
