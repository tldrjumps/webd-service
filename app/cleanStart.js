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
var chromeinstance = chromedriver.start(args);

chromeinstance.stdout.on('data', function(data) {
    console.log(data.toString());
});

chromeinstance.stderr.on('data', function(data) {
    console.log(data.toString());
});

var webdriver_server = 'http://localhost:' + LOCAL_PORT + '/wd/hub' // chromedriver.exe serves at this port
var webdriver = require( 'selenium-webdriver')
var Http = require( 'selenium-webdriver/http');
var chrome = require('selenium-webdriver/chrome')


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


function chromeSetup(id, req, res){

    var options = new chrome.Options()

    options.setChromeBinaryPath(process.env.GOOGLE_CHROME_BIN);
    //options.options_["debuggerAddress"] = "127.0.0.1:6813";
    //options.addArguments('remote-debugging-port="9222"')

    options.addArguments(
        //'headless'
        // Use --disable-gpu to avoid an error from a missing Mesa library, as per
        // https://chromium.googlesource.com/chromium/src/+/lkgr/headless/README.md
        //'disable-gpu',
        //'disable-infobars', 'no-sandbox', 'allow-insecure-localhost',
        //'window-size=1280,720',
        //'--user-agent="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.50 Safari/537.36"'

        'disable-infobars', 'no-sandbox', 'allow-insecure-localhost',
        'headless',
        'disable-gpu',
        'remote-debugging-port=' + DEBUG_PORT,

        //,'remote-debugging-address=0.0.0.0'
        //enable multiple file download args?
        //chrome profile path for remember password.
        //drive existing profile?
    );

    var browser = new webdriver.Builder()
    .withCapabilities(webdriver.Capabilities.chrome())
    .setChromeOptions(options)
    .usingServer(webdriver_server)
    .build()
    browser.get("https://www.github.com")

}
setTimeout(function(){
    chromeSetup()
}, 1000)

var exampleProxy = proxy(options);

app.use('*', [middleware.logger], exampleProxy);

setTimeout(function() {
    app.listen(LISTEN_PORT, function () {
        console.log('REST API initialized on ' + LISTEN_PORT )
    })
}, 10); // 'Still cooking', give it time...



