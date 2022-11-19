import { route, router, Route, Response } from "typera-express";
import "./db";

const root: Route<Response.Ok<{ works: boolean }>> = route
  .get("/")
  .handler(() => Response.ok({ works: true }));

export default router(root).handler();
