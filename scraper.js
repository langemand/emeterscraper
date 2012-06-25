// Electricity meters Scraper
var fs = require('fs'),
    https = require ('https');

var options = {
  host: 'modstroem.dk',
  port: 443,
  path: '/privat/min-side/min-elaflaeser',
  method: 'GET'
};

function scrape_https() {
    console.log("Scraping emeter html");
    var req = https.request(options, function (res) {
    //request({ uri:'https://modstroem.dk/imagesource.aspx?idMetercam=ABC230E934&idGateway=974301783' }, function (error, response, body) {
        if (res.statusCode !== 200) {
            console.log('Error when contacting modstroem.dk');
        } else {
            console.log("emeter has been read");
            res.on('data', function(d) {
                fs.writeFile('latest.html', d);
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
    //var req=https.request(options, function (res) {
    var req=https.request({ host:'modstroem.dk', path:'/imagesource.aspx?idMetercam=ABC230E934&idGateway=974301783' }, function (res) {
        if (res.statusCode !== 200) {
            console.log('Error when contacting modstroem.dk');
        } else {
            console.log("emeter has been read");
            res.on('data', function(d) {
                fs.writeFile('latest.png', d);
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
