# nodehttpserver
[nodehttpserver](https://github.com/deandevl/NodeHttpServer) is a simple javascript module web server based solely on the Node.js `HTTP` module and inspired by [express.js](https://expressjs.com/).  It responds to the 4 major HTTP methods of GET, POST, PATCH, and DELETE.  This Node.js module defines an `HttpServer` class which takes a host string and port number which together define a host computer's listening network address.  The default is the IPv4 loopback address to the local host `127.0.0.1` and port `8080`.  HTTP requests that the server class responds to can be defined in multiple ways with a Uniform Resource Locator (i.e. url/path/endpoint) and its associated javascript defined function/handler. 

Public methods from `HttpServer` include:

- listen([string] message)	----	starts the listening for client requests with a string message logged to the console.
- static([string] directory)	----  defines the directory for publicly available file assets such as `.css`, `.js`, `.html`, image files.
- use([string] route='/', [function] middleware)	----  middleware that performs functions prior to responding that are optionally route specific can also be defined.
- get(), post(), patch(), delete()  ---- method functions with arguments for defining route [string] and handler [function].
- route([string] a_route)  ----  sets the current base route for the above 4 methods.
- add_content_type([string] ext, [string] content_type)  ---- adds an additional content type that the server responds with.  The server currently recognizes `.html, .jpg, .css,  .js, .png,  .ico,  .json,  .svg,  .svgz`.
- add_router([`Router`] router) ---- adds to the server the routes defined in the `Router` class.  See the `nodehttpserver.js` source for the definition of the `Router` class.

Along with the `HttpServer` class, there are HTTP helper methods for working with Node.js' request and response objects. 

Public global HTTP helper methods include `reply_response()`, `get_query_str()`, `get_query_obj()`, `find_obj()`, `send_404()`, `get_body()`, `set_cookies()`.

Demonstrations of `nodehttpserver` are provided in this repository. Be sure run **npm install**  in one to the two  demos directories.

In the `simple-hello-test` folder enter the following to start the server:

```
node startserver.js
```

In a browser, enter the following address to see the server's response:

```
localhost:8080/HelloWorld.html
```

A more advanced test is provided in the `advanced-test` folder.  Again, there is a `startserver.js` file to start the server.  Enter one of following addresses in a browser:

```
127.0.0.1:8080/overview.html  -------front page
127.0.0.1:8080/tour.html -------- displays a specific tour
127.0.0.1:8080/api/v1/tours ----to get a listing of the tours
```

Several routes are defined from this advanced server. They are easily tested by using [Postman](https://www.postman.com/).  To use Postman:

- Install Postman.
- Start Postman and import this repo's file `advanced-test\postman\Node-http-file.postman_collection.json` under Postman's file tab.  This will provide a collection of 7 url requests.
- Start the server as outlined above.
- Select one of the 7 requests and click the <u>Send</u> button.  Postman will display the server's response.

 Udemy's excellent course [Node.js, Express, MongoDB & More: The Complete Bootcamp 2021](https://www.udemy.com/course/nodejs-express-mongodb-bootcamp/) taught by [Jonas Schmedtmann](https://www.udemy.com/user/jonasschmedtmann/) is used in the advanced test where file I/O is used in the backend instead of a MongoDB database. 
