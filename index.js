// Stream tweets from a search phrase
// First time use, please see CHANGEME.config.js
//
// Usage:
//   $ npm start <search phrase>
//
// Example:
//   $ npm start cat
//
var request = require('request');
var Twitter = require('twitter');
var express = require('express');
var config = require('./config');
var querystring = require('querystring');
var app = express();

var cache = [];
var search_phrase = '';
if (process.argv.length > 2) {
  search_phrase = process.argv[2];
}

/*
For basic usage see https://www.npmjs.com/package/twitter
For tracking types in streaming see https://dev.twitter.com/streaming/overview/messages-types
*/
function twitter_stream (config, filter) {
  return new Promise( (resolve, reject) => {
    try {
      var twitter = new Twitter(config);
      var stream = twitter.stream('statuses/filter', { track: filter });

      stream.on('data', (event) => {
        if (cache.length > 1000000) { // Memory? What is that?
          return;
        }
        cache.push(event);
        console.log(querystring.unescape(event.text), '\n'); // Comment me if console is too noisy
      });

      stream.on('error', (error) => {
        throw error;
      });
      resolve(stream);
    } catch (error) {
      reject(error);
    }
  });
}

twitter_stream(config, search_phrase).catch(console.error);

// Respond with the stored tweets, and clear cache
app.get('/', function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(cache));
  cache = [];
});

var port = 5285;
app.listen(port, function () {
  console.log(`Streaming tweets from port ${port}. They come in arrays of objects in JSON. Enjoy.\n\n\n`);
});