var fs = require("fs"),
    mongo = require('mongoskin'),
    url = require("url");


var conn = mongo.db('mongodb://emeterreader:modstroem@staff.mongohq.com:10024/emeterimages');
var db = conn.collection('images');

function start(response) {
  console.log("Request handler 'start' was called.");

  var body = '<html>'+
    '<head>'+
    '<meta http-equiv="Content-Type" '+
    'content="text/html; charset=UTF-8" />'+
    '</head>'+
    '<body>'+
    'Scraping and storing e-meter readings from Modstroem.dk in the cloud<BR>'+
    '<A HREF=/list>Raw list of e-meter image timestamps</A>'+
    '<BR>'+
    '<A HREF=/latest.png>Latest e-meter image acquired</A>'+
    '<BR>'+
    //'<A HREF=/show>/show</A>'+
    '<form action="/upload" enctype="multipart/form-data" '+
    'method="post">'+
    '<input type="file" name="upload" multiple="multiple">'+
    '<input type="submit" value="Upload file" />'+
    '</form>'+
    '</body>'+
    '</html>';

    response.writeHead(200, {"Content-Type": "text/html"});
    response.write(body);
    response.end();
}

function show(response) {
  console.log("Request handler 'show' was called.");
  fs.readFile("/tmp/test.png", "binary", function(error, file) {
    if(error) {
      response.writeHead(500, {"Content-Type": "text/plain"});
      response.write(error + "\n");
      response.end();
    } else {
      response.writeHead(200, {"Content-Type": "image/png"});
      response.write(file, "binary");
      response.end();
    }
  });
}

function list(response) {
    var scale = '10%';
    var body2 = '';
    var body3 = '';
    var body = '<html>'+
    '<head>'+
    '<meta http-equiv="Content-Type" '+
    'content="text/html; charset=UTF-8" />'+
    '</head>'+
    '<body>'+
    'test<BR>';
    db.count(function(err,count) {
        if (err) {
            console.log("db.count got error: " + err);
        } else {    
            body2 = 'Fetched ' + count + ' images until now<BR>';
        }
    });
    db.find().sort({timestamp: -1}, function(err, cursor) {
        if (err) {
            console.log("requestHandler: db.find got error: " + err);
        } else {    
            cursor.each(function(err,item) {
                if (err) {
                    console.log("cursor.each got error: " + err);
                } else {    
                    if ( item ) {
                        if ( !item.timestamp ) {
                            console.log("Encountered null timestamp from db!");
                        }
                        if ( ! item.image ) { 
                            console.log("Encountered null image from db!");
                        }
                        var d = new Date(item.timestamp);
                        body3 = body3 + "<A HREF=/image/" + item.timestamp.toString() + ".png>" + "<img src=\"data:image/png;base64,"+ item.image.toString('base64') + "\" alt=\"embedded meter image\" height=\"" + scale + "\" width=\"" + scale + "\"> " + d.toUTCString() + "</A><BR>";
                    }
                    else
                    {
                        var body4 = body+
                        body2+
                        body3+
                        '</body>'+
                        '</html>';
                        response.writeHead(200, {"Content-Type": "text/html"});
                        response.write(body4);
                        response.end();
                    }
                }
            });
        }
    });
}    


function image(response, request) {
  console.log("Request handler 'image' was called.");
  var imageFilename = url.parse(request.url).pathname.split("/")[2];
  console.log("Image filename: " + imageFilename);
  var reqtime = Number( imageFilename.split(".")[0]);
  console.log("Unix time extracted from image file name: " + reqtime);
  db.findOne( { timestamp: reqtime }, function(error, item) {
    if(error || item === null ) {
      response.writeHead(500, {"Content-Type": "text/plain"});
      response.write(error + "\n");
      response.end();
    } else {
      if ( item ) {
          console.log("Found item with timestamp: " + item.timestamp);
          response.writeHead(200, {"Content-Type": "image/png"});
          response.write(new Buffer(item.image.toString('base64'),'base64'));
          response.end();
      } else {
          console.log("Item is null!");
      }
    }
  });
}




exports.start = start;
exports.image = image;
//exports.show = show;
//exports.latest = latest;
exports.list = list;
