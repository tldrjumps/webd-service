//https://www.reddit.com/r/node/comments/30cy74/logging_strategy_for_nodejs_dependent_modules/?st=j8mhuwcc&sh=4dd0316f
var winston = require('winston');
var axios = require('axios')
var ACCESS_KEY = "18E3DD7FC066434F3012AF9C834F0D3F"
var Group = function(){};

Group.prototype.log = function(){
    console.log("")
}

Group.prototype.convertVanity = function(base) {
    var url = 'http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key='

    return axios.get(url  + ACCESS_KEY + "&vanityurl=" + encodeURIComponent(base), {
        headers: {
            //Cookie: "cookie1=value; cookie2=value; cookie3=value;"
        }
    })

}


Group.prototype.getPlayerSummaries = function(base) {
    var url = 'https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v1/?key='

    return axios.get(url  + ACCESS_KEY + "&steamids=" + base, {
        headers: {
            //Cookie: "cookie1=value; cookie2=value; cookie3=value;"
        }
    })

}


Group.prototype.getUserGroupList = function(steamid){
    var url = "https://api.steampowered.com/ISteamUser/GetUserGroupList/v1"

    return axios.get(url + "/?key=" + ACCESS_KEY + "&steamid=" + steamid, {
        headers: {
            //Cookie: "cookie1=value; cookie2=value; cookie3=value;"
        }
    })

}


Group.prototype.toJoinGroup = function (bots, botid, groupIDinString){

    if (!isNaN(parseInt(groupIDinString))) {
        bots[botid].community.joinGroup(groupIDinString + "", function(err) {
            if (err) {
                winston.info('2.0 > ' + err + groupIDinString);
            }
            winston.info("2.2: " + groupIDinString)
        });

    }else{

        bots[botid].community.getSteamGroup(groupIDinString, function(err, group) {
            if (err) {
                winston.info('1.0 > ' + err);
            } else {
                group.join(function(err) {
                    if (err) {
                        winston.info('1.1 > ' + err);
                    }
                });
            }

            winston.info("1.2: " + JSON.stringify(group))
        });
    }

}


module.exports = new Group();

//var group = require('module_group.js')
//group.log()