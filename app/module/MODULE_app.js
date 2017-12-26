
var winston = require('winston');
var axios = require('axios')
const cheerio = require('cheerio')
var SteamID = require('steamid');
//TODO: Get WebAPI from the library
var ACCESS_KEY = "18E3DD7FC066434F3012AF9C834F0D3F"

var app = function(){};

app.prototype.log = function(){
    console.log("")
}

//TODO: XML of Profile Games Tab Page
app.prototype.getOwnedGames = function(bots, botid){
    var url = "https://api.steampowered.com/IPlayerService/GetOwnedGames/v1"
    //TODO: move in steamID
    winston.info(bots[botid].bot.steamID)
    var sid = SteamID.fromIndividualAccountID(bots[botid].bot.steamID.accountid);
    winston.info(sid.getSteamID64())
    //winston.info(bots[botid].bot.myGroups)
    return axios.get(url + "/?key=" + ACCESS_KEY + "&steamid=" + sid.getSteamID64(), {
        headers: {
            //Cookie: "cookie1=value; cookie2=value; cookie3=value;"
        }
    })
}

app.prototype.getOwnedApps = function(bots, botid){
    return bots[botid].bot.getOwnedApps()
}

app.prototype.getOwnedPackages = function(bots, botid){
    return bots[botid].bot.getOwnedPackages()
}

app.prototype.getOwnedPackagesgetProductInfo = function(bots, botid, apps, packages, callback, type){
    return bots[botid].bot.getProductInfo(apps, packages, callback, type)
}

app.prototype.getOwnedAppsProductInfo = function(bots, botid, va, callback, type){

    bots[botid].bot.getProductInfo(va, [], callback)
}

app.prototype.getOwnedPackagesProductInfo = function(bots, botid, packages, callback, type){

    bots[botid].bot.getProductInfo([], packages, function(apps, packages, unknownApps, unknownPackages){
        return packages
    }//,type
    )

}




module.exports = new app();

//var group = require('module_group.js')
//group.log()