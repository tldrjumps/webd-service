global._mckay_statistics_opt_out = true;


/*
dataDirectory

Controls where the Steam server list and sentry files are written. If null, no data will be automatically stored.

Defaults to a platform-specific user data directory.

On OpenShift, this is $OPENSHIFT_DATA_DIR/node-steamuser
On Windows, this is %localappdata%\doctormckay\node-steamuser
On Mac, this is ~/Library/Application Support/node-steamuser
On Linux, this is $XDG_DATA_HOME/node-steamuser, or ~/.local/share/node-steamuser if $XDG_DATA_HOME isn't defined or is empty
*/

/* Get settings from the file */
var settings = {};
try {
    settings = require('./config/activateSettings.js');
} catch (err) {
    console.error('No settings file! (./config/activateSettings.js)');
    console.error('Read more: https://github.com/Aareksio/node-steam-card-farm#configuration');
    process.exit(1);
}

var EPurchaseResultDetail = require('./module/EPurchaseResultDetail');


var mongodb = require('mongodb')
var mongoDB = db().then( (db) => {
    console.log('initialize')
})

async function db() {
  if(mongoDB) return mongoDB;
  var url = settings.db.mg;
  var MongoClient = require('mongodb').MongoClient;
  var mongoDB = await mongodb.MongoClient.connect(url);
  return mongoDB
}

/* Set up logging */
var winston = require('winston');
var logger = require('./module/MODULE_LOGGER.js');   // to force the initialization code (above) to run once

var args1 = process.argv[2];
console.log("args: " + args1)

/* Load steam modules */
var SteamUser = require('steam-user');
var SteamTotp = require('steam-totp');
var SteamCommunity = require('steamcommunity');
var TradeOfferManager = require('steam-tradeoffer-manager');
var SteamID = require('steamid');
/*
//Check server time offset
var serverOffset = 0;
SteamTotp.getTimeOffset(function(offset, latency) {
    latenncy = Math.floor(latency / 1000);
    if (latency > 1) {
        winston.warn('High server latency detected!');
        serverOffset = offset + Math.floor(latency / 2);
    } else {
        serverOffset = offset;
    }
});
*/

/* Load file stream module to process poll data */
var fs = require('fs');



/* Read bots list */
var bots = {};
settings.bots.forEach(function(bot) {
    //console.log(bot)
    /* Make sure bot object is defined properly and it's active */
    if (bot.enabled && typeof bot.steamid === 'string' && typeof bot.username === 'string' && typeof bot.password === 'string') {
        /* Add bot to local list */
        bots[bot.steamid] = {
            name: bot.username, //bot.name || bot.steamid
            username: bot.username,
            password: bot.password,
            shared_secret: bot.shared_secret,
            identity_secret: bot.identity_secret,
            confirm_trades: bot.confirm_trades || false,
            idle: bot.idle || true,
            check_on_items: bot.check_on_items !== false,
            bot: new SteamUser({
                'promptSteamGuardCode': false,
                'enablePicsCache': true,
                "picsCacheAll": true,
        		"changelistUpdateInterval": 60000,
        		"saveAppTickets": true,
            }),

            community: new SteamCommunity(),
            offers: (!bot.trades ? null : new TradeOfferManager({
                steam: this.bot,
                domain: settings.domain,
                language: 'en',
                pollInterval: 20000,
                cancelTime: 450000
            })),
            active: false,
            idling: null,
            apps: {},
            offline: bot.offline || false,
            debug: bot.debug || false,
            maximumConcurrentGame: bot.maximumConcurrentGame || 1,
        };

    }

});

function processMessage(botid, senderid, message) {
    /* Check if message sender is one of bot admins */
    if (settings.botAdmins.indexOf(senderid.getSteamID64()) > -1) {
        winston.verbose('[' + bots[botid].name + '] Received message from bot admin: ' + message);
        if (message.substr(0, 4) === 'help') {
            var command = message.split(' ')[1].toLowerCase();
            var argument_1 = message.split(' ')[2]
            switch (command) {
                case 'me':
                    bots[botid].bot.chatMessage(senderid, 'What you want me to help?');
                    break;
                case 'free':
                case 'freeLicense':
                    var code = message.split(' ')[1];
                    FREELICENSE.botAddFreeLicense(bots, botid, code, function(err){

                    })

                    STEAM_ACTIVATE_KEY.botRedeemKey(bots, botid, code, function(err, botid, apps) {
                        if (err) {
                            bots[botid].bot.chatMessage(senderid, 'Couldn\'t activate the code, error code: ' + err);
                        } else {
                            bots[botid].bot.chatMessage(senderid, 'Redeemed code! New packets: ' + Object.keys(apps).map(function(index) {
                                    return apps[index];
                                }).join(', ') + '!');
                        }
                    });

                    break;
                case 'redeem':

                    function chatMsg(err, botid, apps) {
                        if (err) {
                            bots[botid].bot.chatMessage(senderid, 'Couldn\'t activate the code, error code: ' + err);
                        } else {
                            bots[botid].bot.chatMessage(senderid, 'Redeemed code! New packets: ' + Object.keys(apps).map(function(index) {
                                    return apps[index];
                                }).join(', ') + '!');
                        }
                    }
                    STEAM_ACTIVATE_KEY.botRedeemKey(bots, botid, argument_1, chatMsg);
                    break;
                case 'ping':
                    bots[botid].bot.chatMessage(senderid, 'Pong!');
                    break;
                default:
                    bots[botid].bot.chatMessage(senderid, 'Unknown command, try: !help');
            }
        }
    } else {
        winston.warn('[' + bots[botid].name + '] Received unauthorized message: ' + message);
    }
}

//Previous Steam Action Function
var STEAMGROUP = require('./module/MODULE_group.js')
var STEAMAPP = require('./module/MODULE_app.js')
var FREELICENSE = require('./module/MODULE_freeLicense.js')
var STEAM_ACTIVATE_KEY = require('./module/MODULE_addLicense.js')
var STEAMTRADE = require('./module/MODULE_trade.js')
var STEAMGAME = require('./module/MODULE_game.js');

Object.keys(bots).forEach(function(botid) {

    if (bots.hasOwnProperty(botid)) {
        /* Login to steam */
        winston.info('[' + bots[botid].name + '] Logging in...');

        bots[botid].bot.logOn({
            accountName: bots[botid].username,
            password: bots[botid].password,
            twoFactorCode: (bots[botid].shared_secret ? SteamTotp.getAuthCode(bots[botid].shared_secret, serverOffset) : null)
        });

        bots[botid].bot.on('loggedOn', function(details) {
            winston.info('[' + bots[botid].name + '] Logged into Steam!');
            if (!bots[botid].offline) {
                bots[botid].bot.setPersona(SteamUser.Steam.EPersonaState.Online);
            }
            //bots[botid].idling = null;
            //bots[botid].bot.webLogOn();
        });

        bots[botid].bot.on('disconnected', function(details) {
            winston.info('[' + bots[botid].name + '] Disconnected from Steam! Reason: ' + details);
            bots[botid].active = false;
        });

        /* Handle errors */
        bots[botid].bot.on('error', function(e) {
            /* [TODO: Handle errors] */
            winston.error('[' + bots[botid].name + '] ' + e);
        });

        bots[botid].bot.on('steamGuard', function(domain, callback, lastCodeWrong) {
            if (lastCodeWrong) {
                winston.warn('[' + bots[botid].name + '] SteamGuard code invalid - make sure server time is correct and you supply `shared_secret` in config!');
                db().then( (db) => {
                    runningPre(db, bots[botid].username, callback)
                })

            } else {
                winston.warn('[' + bots[botid].name + '] SteamGuard required - use Mobile authenticator or disable SteamGuard!');
                setTimeout(function() {
                    db().then( (db) => {
                        runningPre(db, bots[botid].username, callback)
                    })
                }, 60 * 1000); // 'Still cooking', give it time...


            }
        });

        /* Get web session */
        bots[botid].bot.on('webSession', function (sessionID, cookies) {
            winston.info('[' + bots[botid].name + '] Got new web session');

            /* Initialize steamcommunity module by setting cookies */
            bots[botid].community.setCookies(cookies);

            /* Do the same with trade module */
            if (bots[botid].offers !== null) {
                bots[botid].offers.setCookies(cookies, function (err){
                    if (!err) {
                        winston.verbose('[' + bots[botid].name + '] Trade offer cookies set. API key: '+ bots[botid].offers.apiKey);
                    } else {
                        winston.error('[' + bots[botid].name + '] Unable to set trade offer cookies: ' + err);
                    }
                });
            }

            var cookieJSON = []
            for(var i = 0; i < cookies.length; i++){
                var cookieName = cookies[i].split("=")[0]
                var cookieValue = cookies[i].split("=")[1]
                //var cookieName = cookie.match(/(.+)=/)[1];
                cookieJSON.push({'name' : cookieName, 'value' : cookieValue, 'path' : "/", domain: "steamcommunity.com"})
                //cookieJSON.push({'name' : cookieName, 'value' : cookieValue, 'path' : "/", domain: "store.steampowered.com"})
            }
            fs.writeFile('./cookie_' + bots[botid].username +  '.pk1', JSON.stringify(cookieJSON) , function (err, data) {
                if (err) {
                    winston.verbose('[' + bots[botid].username + '] No polldata/' + bots[botid].username + '.json found.');
                }
            });

            //Initialize Hack
            winston.info("Bootstraping")
            bots[botid].active = true;

            if(args1 != undefined){
                FREELICENSE.botAddFreeLicense(bots,botid,args1,function(err, grantedPackages, grantedAppIDs){
                    console.log("" + err)
                    console.log(grantedPackages)
                    console.log(grantedAppIDs)
                })
            }
            restModule(bots, botid)

            winston.info("Running Task at Start")
            runAtLogin(bots, botid)

        });

        /* Chat Message Event*/
        bots[botid].bot.on('friendMessage', function(senderID, message) {
            processMessage(botid, senderID, message);
        });

        /* Check for limitations */
        /* [TODO: Disable bot if trade is impossible] */
        bots[botid].bot.on('accountLimitations', function (limited, communityBanned, locked, canInviteFriends) {
            if (limited) { winston.warn('[' + bots[botid].name + '] Account limited!'); }
            if (communityBanned){ winston.warn('[' + bots[botid].name + '] Account banned from Steam Community!'); }
            if (locked){ winston.error('[' + bots[botid].name + '] Account locked! Can\'t trade!'); }
            if (!canInviteFriends){ winston.warn('[' + bots[botid].name + '] Account can not add any friends!'); }
        });

        if (bots[botid].check_on_items) {
            bots[botid].bot.on('newItems', function(count) {
                /* Check for any card drops left */
                setTimeout(function() {
                    winston.debug('[' + bots[botid].name + '] Checking badges (new items)!');
                    STEAMGAME.updateGames(bots,botid);
                }, (Math.random() * 10 + 5).toFixed(3) * 1000); // Give it time, this event may be emitted right after logging in - it takes time for steam to create web session...
            });
        } else {
            /* Check every interval (9:30 - 10:30 min) */
            setInterval(function() {
                winston.debug('[' + bots[botid].name + '] Checking badges (interval)!');
                STEAMGAME.updateGames(bots,botid);
            }, (Math.random() * 60 + 570).toFixed(3) * 1000);

        }

        /* Notification Event Setup */
        if (bots[botid].offers !== null) {
            fs.readFile('polldata/' + bots[botid].username + '.json', function (err, data) {
                if (err) {
                    winston.verbose('[' + bots[botid].username + '] No polldata/' + bots[botid].username + '.json found.');
                } else {
                    winston.debug('[' + bots[botid].username + '] Found previous pool data.');
                    bots[botid].offers.pollData = JSON.parse(data);
                }
            });

            /* Save poll data for future use */
            bots[botid].offers.on('pollFailure', function (err) {
                winston.warn('[' + bots[botid].name + '] Poll data ' + err);
            });
            bots[botid].offers.on('pollData', function (pollData) {
                fs.writeFile('polldata/' + bots[botid].username + '.json', JSON.stringify(pollData), function (err, data) {
                    if (err) {
                        winston.verbose('[' + bots[botid].username + '] No polldata/' + bots[botid].username + '.json found.');
                    }
                });
            });
        }
    }
    //bots with botid will initiate all Event Handling
});

var runAtLogin = function(bots, botid){

    setTimeout(function() {
        winston.debug('[' + bots[botid].name + '] Checking badges (new web session)!');
        STEAMGAME.updateGames(bots,botid); // Start idle
    }, (Math.random() * 10 + 5).toFixed(3) * 1000); // 'Still cooking', give it time...

    setTimeout(function() {
        function respond(err, count){
            //err = statusCode 9
            if(err){

            }else{

            }
        }


        //STEAMGROUP.getUserGroupList(settings.botUpstream).then(response => processedJSON(response, bots, botid, respond));
    }, (Math.random() * 10 + 5).toFixed(3) * 60000); // 'Still cooking', give it time...

    /*

    setTimeout(function() {
        db().then( (db) => {
            STEAMAPP.getOwnedAppsProductInfo(bots, botid, STEAMAPP.getOwnedApps(bots, botid),
            function(apps, packages, unknownApps, unknownPackages){
                winston.info(apps)
                updateMongo(db,bots[botid].username, JSON.stringify(apps))
            })

        })
    }, (Math.random() * 10 + 5).toFixed(3) * 10000); // 'Still cooking', give it time...

    */
    setTimeout(function() {
        //STEAMTRADE.offloading(bots, botid)

        var processe = function(response){
            winston.info(response.data.steamid)
        }

        //STEAMGROUP.convertVanity("friendsharing").then(response => processe(response));


    }, (Math.random() * 10 + 5).toFixed(3) * 1000); // 'Still cooking', give it time...



}

var toJoinGroup = function(groups){
    winston.error("Join Group")
    for(var i =0; i < groups.length; i++){
        winston.error(groups[i])
        STEAMGROUP.toJoinGroup(bots, botid, groups[i].gid);
    }
}

var processedJSON = function(response, bots, botid, callback){

    var toRemove = Object.keys(bots[botid].bot.myGroups)
    winston.info(toRemove)
    const toRemoveMap = toRemove.reduce(
      function(memo, item) {
        memo[item] = memo[item] || true;
        return memo;
      },
      {} // initialize an empty object
    );

    var groupList = response.data.response.groups

    var myArray = [];
    groupList.map(function(res, i, array){

        var sid = new SteamID();
        sid.universe = SteamID.Universe.PUBLIC;
        sid.type = SteamID.Type.CLAN;
        sid.accountid = parseInt(groupList[i].gid);
        myArray.push(sid.getSteamID64());
    })
    winston.info("NO" +  myArray)

    var filteredGroupList = myArray.filter(function (x) {
      return !toRemoveMap[x];
    });
    winston.info("Filtered" +  filteredGroupList)

    filteredGroupList.map(function(res, i, array){
        if(i < 2){
        winston.warn(res );

        STEAMGROUP.toJoinGroup(bots, botid, res);
        if((i + 1) == array.length ){
            callback(null, i + 1)
        }
        }

    })



}

const express = require('express')
const app = express();
function restModule(bots, botid){

    app.get('/:username/getOwnedGames', function (req, res) {
        var username = req.params.username;

        var processedJSON = function(response, fn, args){
            console.log(response.data.response)
            if(args != undefined){
                fn.send(response.data.response)
            }else{
                fn.send(response.data.response)
            }
            //res.send(response.data.response)
        }

        Object.keys(bots).forEach(function(botid) {
            if(bots[botid].username.toLowerCase() == username.toLowerCase()){
                winston.info(bots[botid].username + " found")

                STEAMAPP.getOwnedGames(bots, botid).then(response => processedJSON(response, res));

            }
        })
    })

    app.get('/ownedApps', function (req, res) {

        var z = STEAMAPP.getOwnedAppsProductInfo(bots, botid, STEAMAPP.getOwnedApps(bots, botid),
        function(apps, packages, unknownApps, unknownPackages){
            //winston.info(apps)
            res.send(apps)
        })
    })

    app.get('/redeem/:username/:key', function (req, res, next) {
        var username = req.params.username;
        var key = req.params.key;
        function httpMsg(err, details, apps){
            //err = statusCode 9
            apps['success'] = details
            winston.info(details)
            if(err){
                res.send(JSON.stringify(apps))
            }else{
                res.send(apps)
            }
        }
        Object.keys(bots).forEach(function(botid) {
            if(bots[botid].username.toLowerCase() == username.toLowerCase()){
                winston.info(bots[botid].username + " found")
                STEAM_ACTIVATE_KEY.botRedeemKey(bots,botid, key, httpMsg);

            }
        })

    })

    app.get('/test/:username', function (req, res, next) {
        var username = req.params.username;
        Object.keys(bots).forEach(function(botid) {
            if(bots[botid].username.toLowerCase() == username.toLowerCase()){
            winston.info( bots[botid].bot.myGroups)
            }
        })
    })


    app.get('/:username/group/sync', function (req, res, next) {
            //STEAMGROUP.toJoinGroup(bots, botid, "groupbuys");
            //Always sync the groups
        function respond(err, count){
            //err = statusCode 9
            if(err){
                res.send(count)
            }else{
                res.send("Group added: " + count)
            }
        }

        var username = req.params.username;

        Object.keys(bots).forEach(function(botid) {
            if(bots[botid].username == username){
                winston.info(bots[botid].username + " found")
                STEAMGROUP.getUserGroupList(settings.botUpstream)
                .then(response => processedJSON(response, bots, botid, respond));
            }
        })
    })

}

app.listen(3000, function () { console.log('Example app listening on port 3000!') })

function updateMongo(db, key, value){
    db.collection('profiles').findAndModify(
    {_id: key}, // query
    [['_id','asc']],  // sort order
    {$set: {applist: value}}, // replacement, replaces only the field "hi"
    {}, // options
    function(err, object) {
        if (err){
            console.warn(err.message);  // returns error if no matching object found
        }else{
            console.log(object);
        }
    });
}




function runningPre(db, username, callback){

    var options = {
      "limit": 1,
      "sort": "_id"
    }
    winston.info("find guardian for " + username)
    db.collection('guardian').find({_id: username.toLowerCase()}, options).toArray(function(err, docs) {
        if(err){
            winston.warn("error")
            callback("12345");
            process.exit(0)
        }
        winston.info(docs)
        docs.map(function (row, index, array) {
            winston.info(row)
            if((index +1) == array.length){
                callback(row.guard)
            }
        });
    });

}