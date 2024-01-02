import * as http from "http";
import * as fs from "fs";

type MIME_TYPES = {
  html: "text/html";
  css: "text/css";
  js: "text/javascript";
  jpg: "image/jpeg";
  png: "image/png";
  ico: "image/x-icon";
  json: "application/json";
};

type ValidExtension = keyof MIME_TYPES;

export class RavenResponse {
  raw: http.ServerResponse;
  private statusNumber: number;
  private headersMap: { [key: string]: string };
  private MIME_TYPES: MIME_TYPES = {
    html: "text/html",
    css: "text/css",
    js: "text/javascript",
    jpg: "image/jpeg",
    png: "image/png",
    ico: "image/x-icon",
    json: "application/json",
  };

  constructor(response: http.ServerResponse) {
    this.raw = response;
    this.statusNumber = 200;
    this.headersMap = {};
  }

  status(status: number) {
    this.statusNumber = status;
    return this;
  }

  headers(headersMap: { [key: string]: string }) {
    this.headersMap = headersMap;
    return this;
  }

  send(payload: any) {
    Object.keys(this.headersMap).forEach((key) =>
      this.raw.setHeader(key, this.headersMap[key])
    );
    this.raw.writeHead(this.statusNumber);
    this.raw.end(payload);
  }

  redirect(url: string) {
    this.headersMap.Location = url;
    this.statusNumber = 307;
    this.send(null);
  }

  json(payload: { [key: string]: any }) {
    this.headersMap["Content-Type"] = "application/json";
    this.send(JSON.stringify(payload));
  }

  blob(payload: Buffer) {
    this.headersMap["Content-Type"] = "application/octet-stream";
    this.send(payload);
  }

  text(payload: string | number) {
    this.headersMap["Content-Type"] = "text/plain";
    this.send(payload);
  }

  private getContentType(url: string): string {
    const defaultContentType = "application/octet-stream";
    const extension: ValidExtension | undefined = <ValidExtension | undefined>(
      url.split(".").at(-1)
    );
    if (!extension) return defaultContentType;
    const contentType = this.MIME_TYPES[extension];
    return contentType ? contentType : defaultContentType;
  }

  sendStaticContent(fileUrl: string) {
    this.headersMap["Content-Type"] = this.getContentType(fileUrl);
    fs.readFile(fileUrl, (error, data) => {
      if (!error) {
        this.send(data);
      } else {
        this.status(404).send(null);
      }
    });
  }
}
