import { RavenRequest } from "./request";
import { RavenResponse } from "./response";

export type RequestMethods = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export type HandlerFunction = (req: RavenRequest, res: RavenResponse) => any;
