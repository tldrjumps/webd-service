
const chromedriver = require('chromedriver');

var http = require('http'),
    httpProxy = require('http-proxy');
var proxy = new httpProxy.createProxyServer({
  target: {
    host: 'localhost',
    port: 9015
  }
});
var proxyServer = http.createServer(function (req, res) {
  proxy.web(req, res);
});

//
// Listen to the `upgrade` event and proxy the
// WebSocket requests as well.
//
proxyServer.on('upgrade', function (req, socket, head) {
  proxy.ws(req, socket, head);
});

proxyServer.listen(process.env.PORT);



const port = 9015;
const args = [
  '--url-base=wd/hub',
  `--port=${port}`
];
chromedriver.start(args);
console.log(port)
var webdriver_server = 'http://localhost:' + port + '/wd/hub', // chromedriver.exe serves at this port
chrome = require('selenium-webdriver/chrome'),
options = new chrome.Options(),
webdriver = require( 'selenium-webdriver'),
Http = require( 'selenium-webdriver/http');

options.setChromeBinaryPath(process.env.GOOGLE_CHROME_BIN);

options.addArguments(
    'headless',
    // Use --disable-gpu to avoid an error from a missing Mesa library, as per
    // https://chromium.googlesource.com/chromium/src/+/lkgr/headless/README.md
    'disable-gpu',
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