
var winston = require('winston');
var SteamUser = require('steam-user');

var register = function(){};

register.prototype.botRedeemKey = function(bots, botid, key, callback) {
    bots[botid].bot.redeemKey(key, function(result, details, apps) {

        if (details === SteamUser.EPurchaseResult.OK) {
            /*
            setTimeout(function() {
                updateGames(botid);
            }, (Math.random() * 10).toFixed(3) * 1000);
            */
            //info: Z8JCW-2WE2E-NJ0VC Redeem Result success: 1 0 {"77597":"The Deer"}
            // warn: VLCIC-7MHEL-GXKR8 Redeem Result: 2 15 {"77597":"The Deer"} // 2 3?
            winston.info(key + " Redeem Result success: " + result + " " + details + " " + JSON.stringify(apps))
            return callback(null, details, apps);
        }
        winston.warn(key + " Redeem Result: " + result + " " + details + " " + JSON.stringify(apps))

        //body.eresult, body.purchase_result_details, packageList
        return callback(details, botid, apps);
    });
}

module.exports = new register();
