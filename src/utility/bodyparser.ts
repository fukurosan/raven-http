import { IncomingMessage } from "http";
export const getBodyBuffer = (req: IncomingMessage): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const body: any[] = [];
    req.on("error", (error) => console.error(error));
    req.on("data", (chunk) => body.push(chunk));
    req.on("end", () => resolve(Buffer.concat(body)));
  });
};
