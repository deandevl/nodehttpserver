/**
 * Created by Rick on 2021-08-29.
 */
'use strict';

const fs = require('fs');
const {
  reply_response,
  get_body,
  get_query_str,
  get_query_obj,
  find_object,
  global_error_emitter} = require('../nodehttpserver.js');

// function for checking/getting tour id's from a querystring
// returns tour _id number contained in the querystring
const get_tour_id = (res,queryString) => {
  // if querystring is undefined then send the client an error message
  if(queryString === undefined) {
    const err = {
      statusCode: 400,
      message: 'The querystring must assign the _id of a specific tour.'
    };
    global_error_emitter.emit('error', res, err);
    return undefined;
  }else {
    // create the query object
    const queryObj = get_query_obj(queryString);
    // check if _id has been assigned
    if(queryObj['_id'] === undefined) {
      // if _id has not been assigned send the client an error message
      const err = {
        statusCode: 400,
        message: 'The tour _id has not been assigned.'
      };
      global_error_emitter.emit('error', res, err);
      return undefined;
    }else {
      return queryObj['_id'];
    }
  }
};

// handler that get all the tours
exports.getAllTours = async (req, res) => {
  try {
    // read the json based tours file
    const tours = JSON.parse(
      fs.readFileSync(`${__dirname}/../data/tours.json`));

    // check if querystring is in the request
    const queryString = get_query_str(req);

    // if querystring is undefined then send client all the tours
    let content;
    if(queryString === undefined){
      content = JSON.stringify(
        {
          requestTime: req.requestTime,  // from our middleware
          status: 'success',
          results: tours.length,
          data: {
            tours: tours
          }
        }
      );
    }else {
      // create the query object
      const queryObj = get_query_obj(queryString);
      if (queryString.indexOf('fields') === -1) {
        // find the tour with specified json object conditions
        const found_tours = find_object(tours, queryObj);

        // reply to the client with json formatted response of tour found
        content = JSON.stringify(
          {
            requestTime: req.requestTime,  // from our middleware
            status: 'success',
            results: found_tours.length,
            data: {
              tours: found_tours
            }
          }
        );
      }else {
        const fields = queryString.split('=')[1].split(',');
        // we are specifying fields to return
        const new_tours = tours.map(tour => {
          const obj = {};
          for(const field of fields){
            obj[field] = tour[field];
          }
          return obj;
        });
        content = JSON.stringify(
          {
            requestTime: req.requestTime,  // from our middleware
            status: 'success',
            results: new_tours.length,
            data: {
              tours: new_tours
            }
          }
        );
      }
    }
    // reply to the client with json formatted response
    await reply_response(res, 200, content, 'application/json');
  }catch(err){
    // if an error, respond to the client with the nature of the error
    const content = {
      statusCode: 400,
      message: err.message,
      stack: err.stack
    };
    global_error_emitter.emit('error', res, content);
  }
};

exports.createTour = async (req, res) => {
  try {
    // the new tour was sent in the body of req in json form
    const newTour = await get_body(req);
    // read the current set of tours
    const tours = JSON.parse(
      fs.readFileSync(`${__dirname}/../data/tours.json`));
    // push the new tour into tours
    tours.push(newTour);
    // save the current set of tours
    fs.writeFileSync(`${__dirname}/../data/tours.json`, JSON.stringify(tours));
    // reply to the client echoing the new tour
    const content = JSON.stringify(
      {
        requestTime: req.requestTime,  // from our middleware
        status: 'success',
        data: {
          tour: newTour
        }
      }
    );
    await reply_response(res, 201, content, 'application/json');
  }catch(err){
    const content = {
      statusCode: 400,
      message: err.message,
      stack: err.stack
    };
    global_error_emitter.emit('error', res, content);
  }
};

exports.updateTour = async (req, res) => {
  try {
    // get the querystring
    const queryString = get_query_str(req);
    // check if there is a tour
    const tour_id = get_tour_id(res, queryString);
    if(tour_id !== undefined){
      // read in the tours and find the tour with specified _id
      const tours = JSON.parse(
        fs.readFileSync(`${__dirname}/../data/tours.json`));
      const tour = find_object(tours, {'_id': tour_id})[0];
      // check if the tour was found
      if(tour === undefined){
        // send the client an error message
        const content = {
          statusCode: 400,
          message: `Could not locate the tour with _id ${tour_id}`
        };
        global_error_emitter.emit('error', res, content);
      }else {
        // get the req body with the tour's updates
        const body = await get_body(req);
        // assign client's tour values to found_tour
        //Object.keys(body).every(key => {tour[key] = body[key]});
        for (const key of Object.keys(body)) {
          tour[key] = body[key];
        }
        // save tours with the updated tour
        fs.writeFileSync(`${__dirname}/../data/tours.json`, JSON.stringify(tours));
        // reply to the client
        const content = JSON.stringify(
          {
            requestTime: req.requestTime,  // from our middleware
            status: 'success',
            data: {
              tour: tour
            }
          }
        );
        await reply_response(res, 200, content, 'application/json');
      }
    }
  }catch(err){
    const content = {
      statusCode: 400,
      message: err.message,
      stack: err.stack
    };
    global_error_emitter.emit('error', res, content);
  }
};

exports.deleteTour = async (req, res) => {
  try {
    // get the querystring
    const queryString = get_query_str(req);
    // check if there is a tour
    const tour_id = get_tour_id(res, queryString);
    if(tour_id !== undefined){
      const tours = JSON.parse(
        fs.readFileSync(`${__dirname}/../data/tours.json`));
      let idx = 0;
      let found_id = false;
      for(const tour of tours){
        if(tour._id === tour_id) {
          tours.splice(idx,1);
          found_id = true;
        }
        idx++;
      }
      if(!found_id){
        const content = {
          statusCode: 400,
          message: `Could not locate tour id ${tour_id}`
        };
        global_error_emitter.emit('error', res, content);
      }else {
        // save tours with the updated tour
        fs.writeFileSync(`${__dirname}/../data/tours.json`, JSON.stringify(tours));
        // reply to the client
        const content = JSON.stringify(
          {
            requestTime: req.requestTime,  // from our middleware
            status: 'success',
            results: tours.length,
            data: {
              tours: tours
            }
          }
        );
        await reply_response(res, 200, content, 'application/json');
      }
    }
  }catch(err){
    const content = {
      statusCode: 400,
      message: err.message,
      stack: err.stack
    };
    global_error_emitter.emit('error', res, content);
  }
};