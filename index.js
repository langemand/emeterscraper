var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");

var handle = {};
handle["/"] = requestHandlers.start;
handle["/start"] = requestHandlers.start;
handle["/show"] = requestHandlers.show;
handle["/latest.png"] = requestHandlers.latest;
handle["/list"] = requestHandlers.list;
handle["image"] = requestHandlers.image;

server.start(router.route, handle);