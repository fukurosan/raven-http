# Raven HTTP

Example of a nodejs http server with some basic abstractions built without dependencies.

I made this just for fun one afternoon, so take it for what it is!

A few things that the server can do:

```javascript
import { Server } from "./src/index";

//Instantiate a new server instance
const server = new Server();

/**
 * Configure middleware that will execute for all requests recived
 * Return true if execution should continue to the regular handler
 * Return false if nothing else should happen
 * The req and res objects are abstractions of the native request and response objects.
 */
server.setMiddleware((req, res) => true);

/**
 * Use route(url, { endpointType: fn }) to configure endpoint handlers
 * 
 * Respond to the request using the res object. The following abstractions are available:
 * 
 * status(number) -> Set the status code for the response
 * headers(headers: {[key: string]: value}) -> Configure any headers for the response
 * send(payload) -> Send a response with a given payload
 * redirect(url) -> Send a redirect response to a given url
 * json(jsonObject) -> Send a json object as a response
 * blob(buffer) -> Send a blob (buffer) as a response
 * text(string) -> Send a text string as a response
 * sendStaticContent(fileUrl) -> Send a file from the filesystem as a response
 * 
 * Access res.raw to get the raw nodejs response object
 */
server.route("/", { GET: (req, res) => res.status(200).send("Hello World!") });

/**
 * Configure parameters by providing a :param in the url
 * 
 * Use the req object to access request information:
 * 
 * getParameters() -> Access a json object with any configured raven url parameters
 * getQuery() -> Access a json object with all url search parameters
 * getBody() -> Access the body of the request (if applicable)
 * 
 * .headers -> Access the raw headers
 * .method -> Access the current http method
 * .url -> Access the endpoint URL in string form
 */
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
    res
      .status(200)
      .sendStaticContent(__dirname + "/public/" + req.getParameters().filename),
});

//Use * as a wildcard route
server.route("*", {
  GET: (req, res) => res.status(200).send("Catch all!"),
});

//Start the server using start() and pass in a port number
server.start(3000);
```
