/**
 * Created by Rick on 2021-08-29.
 */
'use strict';

// third party modules
const morgan = require('morgan');

const {HttpServer, Router}  = require('nodehttpserver');
const {getAllTours, createTour, updateTour, deleteTour} = require('./controllers/toursController');
const path = require('path');

const httpServer = new HttpServer();

// defining routes/endpoints and their associated handlers defined in
//   controllers/tourController.js
// direct way of defining routes/endpoints and their handlers
httpServer.get({route:'/api/v1/tours/overview', handler: getAllTours});
httpServer.get({route:'/api/v1/tours', handler: getAllTours});

// defining routes using .route function of HttpServer
httpServer
  .route('/api/v1/tours')
  .post({handler: createTour})
  .patch({handler: updateTour});

// defining routes using Router class
const router = new Router();
router
  .set_route('/api/v1/tours')
  .delete(deleteTour);
httpServer.add_router(router);

// define server middleware with the use() function
// use() takes an optionally route string and a required function
//   with arguments for the server's request and response objects
// if the route is unspecified, then the server will perform the
//   function for all routes
// Note: the function must be in the form of a Promise to
//   be await-ed by the server

// this middleware function sets the current date in the request object
httpServer.use({middleware: (req, res) => {
    return new Promise((resolve, reject) => {
      req.requestTime = new Date().toISOString();
      resolve();
    });
  }});

// third party middleware for all routes
// log the request method, path with querystring, status, and time of execution
//   to the console
// usually used during development of the application
const logger = (req, res) => {
  return new Promise((resolve, reject) => {
    morgan('dev')(req, res, () =>{});
    resolve();
  });
};
httpServer.use({middleware: logger});

// set a static directory for hosting .js, .css, .jpeg, .png and etc.
httpServer.static(path.join(__dirname, 'public'));

// start the server listening from the local host at port 8080
httpServer.listen('Tours');
