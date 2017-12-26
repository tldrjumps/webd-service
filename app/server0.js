var http = require('http');
var express = require('express');
var proxy = require('http-proxy-middleware');
var bcrypt = require('bcrypt')
const LISTEN_PORT = process.env.PORT || 5001;
const LOCAL_PORT = 9015;
const DEBUG_PORT = 9222;

var temp_ACCESS_RIGHT = false


var winston = require('winston');
var logger = require('./module/MODULE_LOGGER.js');   // to force the initialization code (above) to run once


/* Get settings from the file */
var settings = {};
try {
    settings = require('./config/activateSettings.js');
} catch (err) {
    console.error('No settings file! (./config/activateSettings.js)');
    console.error('Read more: https://github.com/Aareksio/node-steam-card-farm#configuration');
    process.exit(1);
}

function authDB(db, username, sec, callback){
    var options = {
      "limit": 1,
      "sort": "_id"
    }
    winston.info("find guardian for " + username)
    db.collection('apicheck').findOne({username: username}, function(err, document) {
        if(err){
            return callback(err);
        }
        bcrypt.compare(sec, document.secret, function (err, result) {

            if (result === true) {
              return callback(null, result);
            } else {
              return callback(err);
            }
          })
    });


}

var app = express();

// proxy middleware options
var options = {
        target: 'http://localhost:' + LOCAL_PORT, // target host
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
  requireAuthentication: function(req, res, next){

      if(req.headers.authorization != undefined){
        console.log("Authorized")
        //var auth = new Buffer(req.headers.authorization.split(' ')[1], 'base64');
        var auth = req.headers['authorization'];
        //proxyReq.removeHeader("authorization")
        //proxy.web(req, res);
        var tmp = auth.split(' ');   // Split on a space, the original auth looks like  "Basic Y2hhcmxlczoxMjM0NQ==" and we need the 2nd part

        var buf = new Buffer(tmp[1], 'base64'); // create a buffer and tell it the data coming in is base64
        var plain_auth = buf.toString();        // read it back out as a string

        var creds = plain_auth.split(':');      // split on a ':'
        var username = creds[0];
        var password = creds[1];

        db2().then( (db) => {
            authDB(db, username, password, function(err, document){

                if(err){
                    res.setHeader("Content-Type", "text/html");
                    res.write("<p>In Pending</p>");
                    res.end();
                }

                if(document == true){
                    next();
                }else{
                    //res.statusCode = 403;   // or alternatively just reject them altogether with a 403 Forbidden
                    //res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');
                    res.setHeader("Content-Type", "text/html");
                    res.write("<p>Hello World</p>");
                    res.end();
                }

            })
        })


      }else{

        console.log("UnAuthorized")
        //next();
        //401  // or alternatively just reject them altogether with a 403 Forbidden
        res.statusCode = 401;  
        res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');
        res.setHeader("Content-Type", "text/html");
        res.write("<p>Hello World</p>");
        res.end();
      }

  },
  requireAuth: function(req, res, next){
          //console.log("Authorized")
        //var auth = new Buffer(req.headers.authorization.split(' ')[1], 'base64');
        var auth = req.headers['authorization'];
        //proxyReq.removeHeader("authorization")
        //proxy.web(req, res);
        console.log(auth)
        var tmp = auth.split(' ');   // Split on a space, the original auth looks like  "Basic Y2hhcmxlczoxMjM0NQ==" and we need the 2nd part

        var buf = new Buffer(tmp[1], 'base64'); // create a buffer and tell it the data coming in is base64
        var plain_auth = buf.toString();        // read it back out as a string

        var creds = plain_auth.split(':');      // split on a ':'
        var username = creds[0];
        var password = creds[1];

        if(password == "password"){
            next()
        }

  },
  logger: function(req, res, next){
     console.log('Original request hit : '+req.originalUrl);
     next();
  },
  access: function(req, res, next){
    console.log('Original request hit : '+req.originalUrl);
    if(temp_ACCESS_RIGHT) next();
  }
}
var devToolsOptions = {
    target: 'http://localhost:' + "9222", // target host
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

//Start Steam App here?
// create the proxy (without context)
var exampleProxy = proxy(options);
var devToolsProxy = proxy(devToolsOptions)
app.use('/wd', [middleware.logger, middleware.requireAuthentication], exampleProxy);
//app.use('/wb', [middleware.requireAuth,middleware.logger], exampleProxy);
//app.use('/wb', middleware.requireAuth,middleware.logger);
app.use('/startChrome', middleware.logger, middleware.requireAuthentication);
//app.use('/devtools', [middleware.logger], devToolsProxy);


//Add Route in timeout / dynamic?
app.get('/wb/:id',  middleware.logger, middleware.requireAuthentication, function (req, res) {
    var id = parseInt(req.params.id);
    if(id == 0){
        temp_ACCESS_RIGHT = false;
    }else{
        temp_ACCESS_RIGHT = true;
    }
    res.send("Set " + temp_ACCESS_RIGHT)
})

app.get('/ping', function (req, res) {

    res.send("reach")
})


setTimeout(function() {
    app.listen(LISTEN_PORT, function () {
        console.log('REST API initialized on ' + LISTEN_PORT )
    })
}, 10); // 'Still cooking', give it time...



var MicroSteam = require('./MicroSteam.js')
MicroSteam.init()
app.use('/steam', [middleware.logger,middleware.requireAuthentication], MicroSteam.router)

var mongodb = require('mongodb')
async function db2() {
    if(mongoDB) return mongoDB;

    var url = settings.db.auth;
    var MongoClient = require('mongodb').MongoClient;
    var mongoDB = await mongodb.MongoClient.connect(url);
    return mongoDB
}

const chromedriver = require('chromedriver');

const args = [
  '--url-base=wd/hub',
  `--port=${LOCAL_PORT}`
];
chromedriver.start(args);

var webdriver_server = 'http://localhost:' + LOCAL_PORT + '/wd/hub' // chromedriver.exe serves at this port
var webdriver = require( 'selenium-webdriver')
var Http = require( 'selenium-webdriver/http');
var chrome = require('selenium-webdriver/chrome')


function chromeSetup(id, req, res){

    var options = new chrome.Options()

    options.setChromeBinaryPath(process.env.GOOGLE_CHROME_BIN);

    options.addArguments(
        // Use --disable-gpu to avoid an error from a missing Mesa library, as per
        // https://chromium.googlesource.com/chromium/src/+/lkgr/headless/README.md
        //'disable-infobars', 'no-sandbox', 'allow-insecure-localhost',
        //'headless',
        //'remote-debugging-port=' + DEBUG_PORT,
        //'disable-gpu',
        'window-size=1280,720',
        '--user-agent="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.50 Safari/537.36"'
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
    //res.send("startdebug")


    db2().then( (db) => {
        getObjectToCollection(db, 'cookies', {_id: id}, function(err, doc){

            browser.manage().deleteAllCookies();

            var cookies = JSON.parse(doc.cookie)
            var steamid = doc._id

            browser.getSession().then(function(results){
                var sessionObject = { }
                sessionObject.sessionID = results.id_
                sessionObject.cookies = cookies
                sessionObject.steamid = steamid
                res.send(sessionObject)
            })


        })
    })
}


//Protect this API over Auth/Proxy
app.get('/startChrome/:id', function (req, res) {
    var id = parseInt(req.params.id);
    var steamID = settings.bots[0].username
    if(!isNaN(id)){
        if(id == 2){
            steamID = settings.bots[1].username
        }else{
            steamID =  settings.bots[0].username
        }
        console.log(steamID + id)
        chromeSetup(steamID, req, res)
    }
})

function getObjectToCollection(db, collection, obj, callback){

        winston.info( obj + " get from " + collection)

        var options = {
            "limit": 1,
            "sort": "_id"
        }
        db.collection(collection).findOne({_id: obj._id}, function(err, document) {

          if(err){
            winston.info(err)
            //throw err
            return callback(err);
          }
          //winston.info(document)
          if(document == null || document == undefined){
            return callback(new Error("Not Found"));
          }
          callback(null, document)
          //winston.info("End of")
        });

}

function delay(t) {
    return new Promise(function(resolve) {
        setTimeout(resolve, t)
    });
  }


//app.use('*', [middleware.logger, middleware.access], devToolsProxy);



