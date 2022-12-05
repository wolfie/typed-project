import * as t from "io-ts";

/** this is needed, since just returning `undefined` will cause problems with encoders/decoders */
export type DataWrappedResponse<T> = { data: T };

/** this is needed, since just returning `undefined` will cause problems with encoders/decoders */
export const DataWrappedResponse = <T extends t.Any>(data: T) => t.type({ data });
