import * as t from "io-ts";

export const LoginResponse = t.union([t.undefined, t.type({ username: t.string, id: t.string })], "LoginResponse");
export type LoginResponse = t.TypeOf<typeof LoginResponse>;
