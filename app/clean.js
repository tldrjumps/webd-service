var http = require('http');
var express = require('express');
var proxy = require('http-proxy-middleware');

const LISTEN_PORT = process.env.PORT || 5001;
const LOCAL_PORT = 9015;
const DEBUG_PORT = 9222;
const chromedriver = require('chromedriver');

var temp_ACCESS_RIGHT = false

const args = [
  '--url-base=wd/hub',
  `--port=${LOCAL_PORT}`
];

var app = express();

// proxy middleware options
var options = {
        target: 'http://localhost:' + DEBUG_PORT, // target host
        changeOrigin: true,               // needed for virtual hosted sites
        ws: true,                         // proxy websockets
        pathRewrite: {
            //'^/api/old-path' : '/api/new-path',     // rewrite path
            //'^/api/remove/path' : '/path'           // remove base path
        },
        router: {
            // when request.headers.host == 'dev.localhost:3000',
            // override target 'http://www.example.org' to 'http://localhost:8000'
            //'dev.localhost:3000' : 'http://localhost:8000'
        },
        onProxyReq:  function(proxyReq, req, res) {
          //console.log("Autorization" + req.headers.authorization)
        },
        logLevel: 'silent'
    };

var middleware = {
  logger: function(req, res, next){
     console.log('Original request hit : '+req.originalUrl);
     next();
  },
  access: function(req, res, next){
    console.log('Original request hit : '+req.originalUrl);
    if(temp_ACCESS_RIGHT) next();
  }
}


var exampleProxy = proxy(options);

app.use('*', [middleware.logger], exampleProxy);

setTimeout(function() {
    app.listen(LISTEN_PORT, function () {
        console.log('REST API initialized on ' + LISTEN_PORT )
    })
}, 10); // 'Still cooking', give it time...



