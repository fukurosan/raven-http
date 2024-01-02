import * as http from "http";
import { RavenRequest } from "./request";
import { RavenResponse } from "./response";
import { RavenEndpoint } from "./endpoint";
import { HandlerFunction, RequestMethods } from "./model";
import { getBodyBuffer } from "./utility/bodyparser";

type InternalRoutesMap = {
  [key in RequestMethods]: {
    endpoint: RavenEndpoint;
    handler: HandlerFunction;
  }[];
};

type UserProvidedRouteHandler = {
  [key in RequestMethods]?: HandlerFunction;
};

type Middleware = (request: RavenRequest, response: RavenResponse) => boolean;

export class HttpServer {
  private http: http.Server;
  private middleware: Middleware;
  private routes: InternalRoutesMap;

  constructor() {
    this.http = http.createServer(this.handler.bind(this));
    this.middleware = () => true;
    this.routes = {
      GET: [],
      POST: [],
      PUT: [],
      PATCH: [],
      DELETE: [],
    };
  }

  start(port: number) {
    this.http.listen(port, () => {
      console.log("Raven server is running on port " + port);
    });
  }

  private async handler(
    request: http.IncomingMessage,
    response: http.ServerResponse
  ) {
    const body = await getBodyBuffer(request);
    const ravenRequest = new RavenRequest(request, body);
    const ravenResponse = new RavenResponse(response);
    const methodSpecificRoutes = this.routes[ravenRequest.method];
    const match = methodSpecificRoutes.find((route) =>
      route.endpoint.evaluateUrlString(request.url!)
    );
    if (match) {
      ravenRequest.endpoint = match.endpoint;
      const proceed = this.middleware(ravenRequest, ravenResponse);
      if (!proceed) return;
      match.handler(ravenRequest, ravenResponse);
    }
  }

  route(url: string, handler: UserProvidedRouteHandler) {
    const methods: RequestMethods[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];
    methods.forEach((method) => {
      handler[method] &&
        this.routes[method].push({
          endpoint: new RavenEndpoint(url),
          handler: handler[method]!,
        });
    });
  }

  setMiddleware(middleware: Middleware) {
    this.middleware = middleware;
  }
}
