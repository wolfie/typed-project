import { DataWrappedResponse, IotsError } from "typed-project-common";
import { Parser, Response } from "typera-express";
import { BadRequest } from "typera-express/response";
import * as t from "io-ts";
import { Middleware } from "typera-express/middleware";

export type CaughtInternalServerError = Response.InternalServerError<{ message: string }>;

export type DataOk<T = unknown> = Response.Ok<DataWrappedResponse<T>>;
export const ResponseOkData = <T>(data: T) => Response.ok({ data });

export const ResponseOkEmpty = (): Response.Ok<DataWrappedResponse<undefined>> => Response.ok({ data: undefined });

export type BadRequestQueryError = BadRequest<{ message: string; error: any }>;
export const queryParser = <P extends t.Props>(
  props: P
): Middleware<{ query: t.TypeOf<t.TypeC<P>> }, BadRequestQueryError> =>
  Parser.queryP(t.type(props), e =>
    Response.badRequest({
      message: "Bad request",
      error: e.map(IotsError.getReadableError),
    })
  );

export type BadRequestBodyError = BadRequest<{ message: string; error: any }>;
export const bodyParser = <T extends t.Any>(type: T): Middleware<{ body: t.TypeOf<T> }, BadRequestBodyError> =>
  Parser.bodyP(type, e =>
    Response.badRequest({
      message: "Bad request",
      error: e.map(IotsError.getReadableError),
    })
  );
