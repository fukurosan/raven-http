import { Server } from "./src/index";

const server = new Server();
server.setMiddleware((req, res) => true);
server.route("/", { GET: (req, res) => res.status(200).send("Hello World!") });
server.route("/id/:id", {
  GET: (req, res) => res.status(200).send(req.getParameters().id),
});
server.route("/query", {
  GET: (req, res) => res.status(200).json(req.getQuery()),
});
server.route("/redirect", {
  GET: (req, res) => res.redirect("/arrival"),
});
server.route("/arrival", {
  GET: (req, res) => res.status(200).text("You were redirected"),
});
server.route("/file/:filename", {
  GET: (req, res) =>
    res.status(200).sendStaticContent(__dirname + "/public/" + req.getParameters().filename),
});
server.route("*", {
  GET: (req, res) => res.status(200).send("Catch all!"),
});
server.start(3000);
