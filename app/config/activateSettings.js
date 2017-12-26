var ENV_VARIABLE = {}

var env = require('env-var');
//if (process.env.NODE_ENV !== 'production') {
    require('dotenv').load(); //specific path?
    //console.log(process.env)
    ENV_VARIABLE['MAX'] = parseInt(process.env.MAXIMUM_IDLE)
    ENV_VARIABLE['ENV_MONGODB'] = process.env.MONGODB
    ENV_VARIABLE['ENV_MONGODB_TLS'] = process.env.MONGODB_TLS
    ENV_VARIABLE['STEAM_ADMIN'] = ["76561198113607607","76561198113607607"]
    ENV_VARIABLE['STEAM_UPSTREAM'] = process.env.STEAM_UPSTREAM
    ENV_VARIABLE['STEAM_USER1'] =  process.env.STEAM_USER1
    ENV_VARIABLE['STEAM_PASSWORD1'] =  process.env.STEAM_PASSWORD1
    ENV_VARIABLE['STEAM_USER2'] =  process.env.STEAM_USER2
    ENV_VARIABLE['STEAM_PASSWORD2'] =  process.env.STEAM_PASSWORD2
    ENV_VARIABLE['STEAM_USER_ENABLE1'] = parseInt(process.env.STEAM_USER_ENABLE1)
    ENV_VARIABLE['STEAM_USER_ENABLE2'] = parseInt(process.env.STEAM_USER_ENABLE2)
//}

//verify bot.name, steamid and other usage
//MODULE_GAME for import
module.exports = {
    /* Domain, used for generating trade keys if needed */
    domain: 'window.design',
    db: {
        "mg": ENV_VARIABLE['ENV_MONGODB'] ,
        "auth": ENV_VARIABLE['ENV_MONGODB_TLS']
    },
    /* Bot admin(s) */
    botAdmins: ENV_VARIABLE['STEAM_ADMIN'],

    botUpstream: ENV_VARIABLE['STEAM_UPSTREAM'], //var copiedGroupAcc = "76561198113607607";
    upStream_maximumIdle: ENV_VARIABLE['MAX'] || 2,

    //MAXIMUM_IDLE
    /* Log levels */
    logger: {
        console: 'debug',
        file: 'error'
    },

    /* Bots */
    bots: [
        {
            enabled: ENV_VARIABLE['STEAM_USER_ENABLE1'] == 1,
            trades: false,
            confirm_trades: true, //is to confirm the trade offer and market https://github.com/DoctorMcKay/node-steamcommunity/wiki/Steam-Confirmation-Polling
            idle: true,
            offline: false,
            check_on_items: true,
            name: 'Chan',
            steamid: '23',
            username: ENV_VARIABLE['STEAM_USER1'],
            password: ENV_VARIABLE['STEAM_PASSWORD1'],
            shared_secret: null,
            identity_secret:null,
            maximumConcurrentGame: 8,
        },
        {
            enabled: ENV_VARIABLE['STEAM_USER_ENABLE2'] == 1,
            trades: false,
            confirm_trades: true,
            idle: true,
            offline: false,
            check_on_items: false,
            steamid: '76561198120250046',
            username: ENV_VARIABLE['STEAM_USER2'],
            password: ENV_VARIABLE['STEAM_PASSWORD2'],
            name: '2',
            shared_secret: null,
            identity_secret:null,
            maximumConcurrentGame: 8,
        }

    ],

    /* Statistics */
    stats: false
};
