import * as http from "http";
import { RequestMethods } from "./model";
import { RavenEndpoint } from "./endpoint";

export class RavenRequest {
  raw: http.IncomingMessage;
  headers: http.IncomingHttpHeaders;
  method: RequestMethods;
  url: string;
  private parameters: { [key: string]: string } | null;
  private query: { [key: string]: string } | null;
  private body: Buffer;
  private _endpoint: RavenEndpoint | null;
  constructor(request: http.IncomingMessage, body: Buffer) {
    this.raw = request;
    this.body = body;
    this.headers = request.headers;
    this.method = <RequestMethods>request.method!;
    this.url = request.url!;
    this.parameters = null;
    this.query = null;
    this._endpoint = null;
  }

  set endpoint(endpoint: RavenEndpoint) {
    this._endpoint = endpoint;
  }

  getParameters() {
    if (!this.parameters) {
      this.parameters = this._endpoint!.extractParameters(this.url);
    }
    return this.parameters;
  }

  getQuery() {
    if (!this.query) {
      this.query = {};
      new URL(`http://www.doesnotmatter.com${this.url}`).searchParams.forEach(
        (value, key) => (this.query![key] = value)
      );
    }
    return this.query;
  }

  getBody() {
    return this.body;
  }
}
