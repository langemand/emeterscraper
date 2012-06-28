function route(handle, pathname, response, request) {
  var pathlevels = pathname.split("/");
  var toplevel = pathlevels[1];
  console.log("About to route a request for " + pathname + '(i.e. )' + toplevel + ')');
  if (typeof handle[pathname] === 'function') {
    handle[pathname](response);
  } else if (typeof handle[toplevel] === 'function') {
    handle[toplevel](response, request);
  } else {   
    console.log("No request handler found for " + pathname);
    response.writeHead(404, {"Content-Type": "text/html"});
    response.write("404 Not found");
    response.end();
  }
}

exports.route = route;