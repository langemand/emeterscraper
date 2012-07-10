// Electricity meter Scraper
var fs = require('fs'),
    https = require ('https'),
    mongo = require('mongoskin');

var options = {
  host: 'modstroem.dk',
  port: 443,
  path: '/privat/min-side/min-elaflaeser',
  method: 'GET'
};

var conn = mongo.db('mongodb://emeterreader:modstroem@staff.mongohq.com:10024/emeterimages');
var db = conn.collection('images');
var lastImage = null;
var lastAcquire = null;

function init() {
    var dublets=new Array();
    var icnt=0;
    var imageBefore=null;

    db.find({}, function(err, cursor) {
        if (err) {
            console.log("scraper.init: db.find got error: " + err);
        } else {
            cursor.each(function (err, item) {
                if (item ) {
                    // register dublets
                    if ( imageBefore && item.image.toString() == imageBefore.toString() ) {
                        dublets[icnt] = item.timestamp;
                        icnt++;
                    } else {
                        imageBefore = item.image;
                    }

                    // register newest
                    if ( item.timestamp > lastAcquire ) {
                    	lastImage = item.image;
                    	lastAcquire = item.timestamp;
                    }
                } else {
                    console.log("Scraper.init: Newest timestamp is from " + lastAcquire + ", " + icnt + " dublets found");
                    for (i=0; i<icnt; i++)
                    {
                         db.remove({timestamp: dublets[i]}, function(err, result) {
                             if (!err) console.log('Dublet deleted');
                         });
                    }
                }
            });
        }
    });
}

function scrape_https() {
    console.log("Scraping emeter html");
    var req = https.request(options, function (res) {
        if (res.statusCode !== 200) {
            console.log('Error when contacting modstroem.dk');
        } else {
            console.log("emeter html has been read");
            res.on('data', function(d) {
            });
        }
    });
    req.end();
    
    req.on('error', function(e) {
        console.error(e);
    });
}



function scrape_png() {
    console.log("Scraping emeter png");
    
    if (lastImage === null ) {
        init();
    }
    
    //var req=https.request(options, function (res) {
    var req=https.request({ host:'modstroem.dk', path:'/imagesource.aspx?idMetercam=ABC230E934&idGateway=974301783' }, function (res) {
        if (res.statusCode !== 200) {
            console.log('Error when contacting modstroem.dk');
        } else {
            console.log("emeter has been read");
            res.on('data', function(d) {
                if ( d.toString() != lastImage.toString() ) {
                   insertIfNew(d);
                }
            });
        }
    });
    req.end();
    
    req.on('error', function(e) {
        console.error(e);
    });
}

function insertIfNew( image ) {
    db.find({ "timestamp": { $gt: lastAcquire } }, function (err, cursor) {
        if (err) {
            console.log("scraper.insertIfNew: db.find got error: " + err);
        } else {
            cursor.each(function (err, item) {
                if (item ) {
                    console.log("Found timestamp > lastAquire (" + lastAcquire + ") in db: " + item.timestamp);
                    lastAcquire = item.timestamp;
                    lastImage = item.image;
                } else {
                    if ( image.toString() != lastImage.toString() ) {
                        var timestamp = Date.now();
                        console.log( "Image fetched from modstroem differ from lastImage, inserting in db with timestamp:"+timestamp);
                        var timestamp = Date.now();
                        console.log("Storing new image at " + timestamp);
                        db.insert( { timestamp: timestamp, image: image } );
                        lastAcquire = timestamp;
                        lastImage = image;
                    } else {
                        console.log("lastImage is the same at the one fetched from modstroem, not inserting");
                    }
                }
            });
        }
    });
}

function scrape() {
    scrape_png();
}

exports.scrape = scrape;
exports.init = init;
