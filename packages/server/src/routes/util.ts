import { DataWrappedResponse } from "typed-project-common";
import { Response } from "typera-express";

export type CaughtInternalServerError = Response.InternalServerError<{ message: string }>;

export type DataOk<T> = Response.Ok<DataWrappedResponse<T>>;
export const ResponseOkData = <T>(data: T) => Response.ok({ data });
