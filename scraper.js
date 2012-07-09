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

var conn = null;
var db = null;

var lastImage = null;
var lastAcquire = null;

function init() {
    conn = mongo.db('mongodb://emeterreader:modstroem@staff.mongohq.com:10024/emeterimages');
    db = conn.collection('images');    
    db.find({}, function(err, cursor) {
        if (err) {
            console.log("scraper.init: db.find got error: " + err);
        } else {
            cursor.each(function (err, item) {
                if (item ) {
                    if ( item.timestamp > lastAcquire ) {
                    	lastImage = item.image;
                    	lastAcquire = item.timestamp;
                    }
                } else {
                    console.log("Scraper.init: Newest timestamp is from " + lastAcquire);
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
                if ( d != lastImage ) {
                    var timestamp = Date.now();
                    console.log("Storing new image at " + timestamp);
                    db.insert( { timestamp: timestamp, image: d } );
                    fs.writeFile('latest.png', d);
                    lastImage = d;
                    lastAcquire = timestamp;
                }
            });
        }
    });
    req.end();
    
    req.on('error', function(e) {
        console.error(e);
    });
}

function scrape() {
    scrape_png();
}

exports.scrape = scrape;
exports.init = init;
