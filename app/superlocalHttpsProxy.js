var http = require('http')
const https = require('https')
const httpProxy = require('http-proxy')



//http://localhost:5000/steam/free/meteorsnows/225805



var args1 = process.argv[2];
console.log("args: " + args1)

var host = null

if(args1 != undefined){
  host = args1 + ".herokuapp.com"
}else{
  host = "cloud-services.herokuapp.com"
}

var authentication = "steam_trad:TldrTestSteam1"
//var authentication = "steam_trad:password"

var proxy = httpProxy.createProxyServer({
  target: 'https://' + host,
  agent: https.globalAgent,
  headers: {
    host: host
  }
})

var createProxy = function(host){
  return httpProxy.createProxyServer({
    target: 'https://' + host,
    agent: https.globalAgent,
    headers: {
      host: host
    }
  })
}



var proxyServer = http.createServer(function (req, res) {
  if(req.headers.authorization != undefined){
    var auth = new Buffer(req.headers.authorization.split(' ')[1], 'base64');
    console.log(auth)
    proxy.web(req, res);
  }else{
    var userPass = new Buffer(authentication, "ascii")
    userPass = userPass.toString("base64")
    console.log(userPass)
    req.headers.authorization = "Basic "  + userPass

    console.log( req.url)

    var definedPath = "/wdd"
    var url = req.url;
    if(url.indexOf(definedPath) == 0){
      var secondPath = url.split("/")[2]

      console.log(url.replace("/wdd/" + secondPath, "/"))
      req.path = req.url = url.replace("/wdd/" + secondPath, "/")
      
      var host = getMultiHost(secondPath)
      console.log(host + req.path) 
      var proxy2 = createProxy(host)
      proxy2.web(req, res);

    }else{
      proxy.web(req, res);
    }

    //var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;

    /*
    if(){

    }else{
      proxy.web(req, res);
    }
    */
    
  }

});


//http://localhost:5000/wdd/2playerlove/steam/play/2playerlove/440
function getMultiHost (type) {

  var host = {
    //areas-webd
    '2playerlove': 'twoplayerlove.herokuapp.com',
    'acesforces': 'twoplayerlove.herokuapp.com',
    'followyoursheart': 'cloud-services.herokuapp.com',
    'steamypassion': 'cloud-services.herokuapp.com',
    'endlesslyloves': 'net-neutrality.herokuapp.com',
    'effectura': 'net-neutrality.herokuapp.com',
    'youthedeveloper':'beenhere.herokuapp.com',
    'tldrjump':'beenhere.herokuapp.com',
    'endlesslyloves':'hbsteam.herokuapp.com',
    'endlesslyphoto':'hbsteam.herokuapp.com',
    'meteorsnows':'project-dynamic.herokuapp.com',
    'provenapps':'project-dynamic.herokuapp.com',
    //remove ping d
    'asiastation':'areas-webd.herokuapp.com',
    'edwardchanjw':'areas-webd.herokuapp.com',
     //
    'journeywatcher':'serene-dawn-20565.herokuapp.com',
    'jwstudio':'serene-dawn-20565.herokuapp.com',
    //tldrjump
    'journeywatcher':'webd-service.herokuapp.com',
    'jwstudio':'serene-dawn-20565.herokuapp.com',





    'default': 'Default item'
  };
  return host[type] || host['default'];
}



//
// Listen to the `upgrade` event and proxy the
// WebSocket requests as well.
//
proxyServer.on('upgrade', function (req, socket, head) {
  proxy.ws(req, socket, head);
});


proxyServer.listen(5000)