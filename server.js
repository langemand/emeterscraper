// server.js file for emeterscraper

var scraper = require("./scraper");

var HOST = null; // localhost
var PORT = 12345; // process.env.PORT; // || process.env.VCAP_APP_PORT;

// when the daemon started
var starttime = (new Date()).getTime();

var forecast = null;
// forecast = scraper.scrape();
scraper.init();

// every 10 minutes poll for the image.
setInterval(function() {
    forecast = scraper.scrape();
}, 10 * 60 * 1000);

var http = require("http");
var url = require("url");

function start(route, handle) {
  function onRequest(request, response) {
    var pathname = url.parse(request.url).pathname;
    console.log("Request for " + pathname + " received.");
    route(handle, pathname, response, request);
  }

  http.createServer(onRequest).listen(Number(process.env.VCAP_APP_PORT || process.env.PORT || PORT));
  console.log("Server has started.");
}

exports.start = start;

