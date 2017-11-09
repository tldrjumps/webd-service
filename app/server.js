
const chromedriver = require('chromedriver');

var http = require('http');
// include dependencies
var express = require('express');
var proxy = require('http-proxy-middleware');

const LOCAL_PORT = 9015;
const LISTEN_PORT = process.env.PORT;

const args = [
  '--url-base=wd/hub',
  `--port=${LOCAL_PORT}`
];
chromedriver.start(args);
console.log(LOCAL_PORT)
var webdriver_server = 'http://localhost:' + LOCAL_PORT + '/wd/hub', // chromedriver.exe serves at this port
chrome = require('selenium-webdriver/chrome'),
options = new chrome.Options(),
webdriver = require( 'selenium-webdriver'),
Http = require( 'selenium-webdriver/http');

options.setChromeBinaryPath(process.env.GOOGLE_CHROME_BIN);

options.addArguments(
    'headless',
    // Use --disable-gpu to avoid an error from a missing Mesa library, as per
    // https://chromium.googlesource.com/chromium/src/+/lkgr/headless/README.md
    //'disable-gpu',
    'disable-infobars', 'no-sandbox', 'allow-insecure-localhost',
    'window-size=1280,720',
    '--user-agent="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.50 Safari/537.36"'
    //enable multiple file download args?
    //chrome profile path for remember password.
    //drive existing profile?
);


var browser = new webdriver.Builder()
  .withCapabilities(webdriver.Capabilities.chrome())
  .setChromeOptions(options)
  .usingServer(webdriver_server)
  .build()

/*
if( 'undefined' != typeof saved_session_id && saved_session_id!= ""){
  console.log("Going to attach to existing session  of id: " + saved_session_id);
  client = new Http.HttpClient( webdriver_server );
  executor = new Http.Executor( client);
  browser = webdriver.WebDriver.attachToSession( executor, saved_session_id);
}
*/
// set the window inner size to 800 x 600

browser.get('http://www.google.com');



// proxy middleware options
var options = {
        target: 'http://localhost:' + LOCAL_PORT, // target host
        changeOrigin: true,               // needed for virtual hosted sites
        ws: true,                         // proxy websockets
        pathRewrite: {
            '^/api/old-path' : '/api/new-path',     // rewrite path
            '^/api/remove/path' : '/path'           // remove base path
        },
        router: {
            // when request.headers.host == 'dev.localhost:3000',
            // override target 'http://www.example.org' to 'http://localhost:8000'
            //'dev.localhost:3000' : 'http://localhost:8000'
        },
        onProxyReq:  function(proxyReq, req, res) {
          if(req.headers.authorization != undefined){
            var auth = new Buffer(req.headers.authorization.split(' ')[1], 'base64');
            console.log(auth)
            proxyReq.removeHeader("authorization")
            //proxy.web(req, res);
            }
        }
    };

// create the proxy (without context)
var exampleProxy = proxy(options);

// mount `exampleProxy` in web server
var app = express();
    app.get('/ownedApps', function (req, res) {
      console.log("reach")
      res.send("reach")
    })
    app.use('/', exampleProxy);

    app.listen(LISTEN_PORT);