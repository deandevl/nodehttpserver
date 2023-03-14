/**
 * Created by Rick on 2021-11-14.
 */

const path = require('path');
const server = require('nodehttpserver');

const httpServer = new server.HttpServer();
// set a static directory for hosting .js, .css, .jpeg, .png and etc.
httpServer.static(path.join(__dirname, 'public'));

// start the server listening from the local host at port 8080
// Client should enter: localhost:8080/HelloWorld.html
httpServer.listen('Test');