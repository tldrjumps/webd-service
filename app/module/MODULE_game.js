//https://www.reddit.com/r/node/comments/30cy74/logging_strategy_for_nodejs_dependent_modules/?st=j8mhuwcc&sh=4dd0316f
var winston = require('winston');
var axios = require('axios')
/* Load request and cheerio to parse steam badges page */
var Cheerio = require('cheerio');

var settings = require('../config/activateSettings.js');

var savedThis;

var game = function(){
    savedThis = this;
};

game.prototype.log = function(){
    console.log("")
}

game.prototype.updateGames = function (bots, botid, callback) {
    if (!bots[botid].community.steamID) {
        if (typeof callback === 'function') {
            return callback('Not logged in!');
        }
        return;
    }

    var apps = {};

    loadBadges(bots, botid, 1, apps, function(err, apps) {
        /* Save the data */
        bots[botid].apps = apps;

        if (err) {
            return; // Handled already
        }

        /* Check if there's any game to idle */
        if (Object.keys(apps).length > 0) {
            /* Check if the bot is not idling the game already */
            winston.verbose('[' + bots[botid].name + '] Check Game change!');
            if (!bots[botid].idling || !apps.hasOwnProperty(bots[botid].idling)) {
                /* Get first element on the list and idle the game */
                /* [TODO: Add different algorithms] */
                winston.verbose('[' + bots[botid].name + '] Game changed!');
                //console.log(Object.keys(apps))

                savedThis.idleGame(bots, botid, Object.keys(apps));
            } else {
                winston.verbose('[' + bots[botid].name + '] Game not changed!');
            }
        } else {
            /* Stop idling if no cards left */
            winston.info('[' + bots[botid].name + '] No games to idle!');
            if (bots[botid].idling) {
                stopIdle(bots, botid);
                winston.debug('[' + bots[botid].name + '] Stopping idle, no games left.');
            }
        }

        if (typeof callback === 'function') {
            return callback(null);
        }
    });
}


game.prototype.idleGame = function (bots, botid, gameid) {

    /* Check if bot is excluded from idling */
    if (bots[botid].idle) {
        /* Check if gameid is number or not */
        /*
        if (!isNaN(parseInt(gameid, 10))) {
            gameid = parseInt(gameid, 10);
        }
       */
        if(gameid === 0) { // Something went wrong...
            winston.debug('[' + bots[botid].name + '] Requested to idle game id 0, trashing!');
            return;
        }

        //idleGameCount

        var gameids = []
        winston.debug( bots[botid].maximumConcurrentGame + " Maximum Game Run")
        var maximum = bots[botid].maximumConcurrentGame ;
        if(settings.upStream_maximumIdle != 0 && bots[botid].maximumConcurrentGame != undefined){
            maximum = (settings.upStream_maximumIdle < bots[botid].maximumConcurrentGame) ? settings.upStream_maximumIdle : maximum

            for(var i = 0; i < gameid.length; i++){
                if(i < maximum){
                    //gameids.push(parseInt(gameid[i], 10))
                    var obj = {}
                    obj.game_id = parseInt(gameid[i], 10)
                    gameids.push(obj)
                }
            }
        }else{
            var maximum = (settings.upStream_maximumIdle !=0) ? settings.upStream_maximumIdle : gameid.length
            gameids = gameid.slice(0, maximum);

        }

        var obj = {}
        obj.game_id = 397900
        //gameids.push(obj)

        //winston.info( "Played List: " + gameids)
        bots[botid].bot.gamesPlayed(gameids ,true);
        //bots[botid].bot.gamesPlayed(gameids);
        bots[botid].idling = gameids[0];
        winston.info('[' + bots[botid].name + '] Started idling: ' + JSON.stringify(gameids));

        return gameids;
    }
}

function stopIdle(bots, botid) {
    bots[botid].bot.gamesPlayed();
    bots[botid].idling = null;
    winston.verbose('[' + bots[botid].name + '] Stopped idling');
}

module.exports = new game();

//var group = require('module_group.js')
//group.log()

/* Bot functions */
function loadBadges(bots, botid, page, apps, callback, retry) {
    apps = apps || {};
    page = page || 1;
    retry = retry || 0;

    winston.debug('[' + bots[botid].name + '] Checking badges page ' + page + '...');

    /* Use steamcommunity module to access badges page */
    bots[botid].community.request('https://steamcommunity.com/my/badges/?p=' + page, function(err, response, body) {
        /* Check for invalid response */
        if (err || response.statusCode !== 200) {
            if (retry < 5) {
                winston.warn('[' + bots[botid].name + '] Error updating badges page: ' + (err || 'HTTP' + response.statusCode) + ', retrying...');
                setTimeout(function() {
                    loadBadges(bots, botid, page, apps, callback, retry + 1);
                }, (Math.random() * 10 + 5).toFixed(3) * 1000); // Give it time...
            } else {
                winston.warn('[' + bots[botid].name + '] Error updating badges page: ' + (err || 'HTTP' + response.statusCode) + ', aborting!');
            }
            if (typeof callback === 'function') {
                return callback((err || 'HTTP' + response.statusCode));
            } else {
                return;
            }
        }

        /* Do some parse magic */
        var $ = Cheerio.load(body);

        if ($('#loginForm').length) {
            winston.warn('[' + bots[botid].name + '] Cannot load badges page - not logged in! Requesting new session...');
            return bots[botid].bot.webLogOn();
        }

        winston.debug('[' + bots[botid].name + '] Badges page ' + page + ' loaded...');

        $('.badge_row').each(function () { // For each badge...
            var row = $(this);

            var overlay = row.find('.badge_row_overlay'); // Get it's inner content...
            if (!overlay) { // Well done!
                return;
            }

            var match = overlay.attr('href').match(/\/gamecards\/(\d+)/); // Get game appid...
            if (!match) { // Well done!
                return;
            }

            var appid = parseInt(match[1], 10);

            /* [TODO: Check when the packet was bought and don't idle it without permission] */

            var name = row.find('.badge_title');
            name.find('.badge_view_details').remove();
            name = name.text().replace(/\n/g, '').replace(/\r/g, '').replace(/\t/g, '').trim();

            var drops = row.find('.progress_info_bold').text().match(/(\d+) card drops? remaining/);
            if (!drops) { // Nothing to do here!
                return;
            }

            drops = parseInt(drops[1], 10);
            if (isNaN(drops) || drops === 0) { // Well done!
                winston.debug(appid + ': Can\'t parse cards!');
                return;
            }

            var playtime = row.find('.badge_title_stats').html().match(/(\d+\.\d+) hrs on record/);
            if (!playtime) {
                playtime = 0.0;
            } else {
                playtime = parseFloat(playtime[1], 10);
                if (isNaN(playtime)) { // Well done!
                    playtime = 0.0;
                }
            }

            apps[appid] = {
                name: name,
                drops: drops,
                playtime: playtime
            }
        });

        var pagelinks = $('.pageLinks').first();
        if (pagelinks.html() === null) {
            return callback(null, apps);
        }

        pagelinks.find('.pagebtn').each(function() {
            var button = $(this);
            if (button.text() === '>') {
                if (button.hasClass('disabled')) {
                    return callback(null, apps);
                } else {
                    return loadBadges(bots, botid, page + 1, apps, callback);
                }
            }
        });
    });
}