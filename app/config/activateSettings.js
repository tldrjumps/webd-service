var ENV_VARIABLE = {}

var env = require('env-var');
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').load(); //specific path?
    ENV_VARIABLE['MAX'] = env.get('MAXIMUM_IDLE').required().asInt()
    ENV_VARIABLE['ENV_MONGODB'] = env.get('MONGODB').required().asString()
    ENV_VARIABLE['STEAM_ADMIN'] = env.get('STEAM_ADMIN').required().asArray();
    ENV_VARIABLE['STEAM_UPSTREAM'] =env.get('STEAM_UPSTREAM').required().asArray();
    ENV_VARIABLE['STEAM_USER1'] = env.get('STEAM_USER1').required().asString()
    ENV_VARIABLE['STEAM_PASSWORD1'] = env.get('STEAM_PASSWORD1').required().asString()
    ENV_VARIABLE['STEAM_USER2'] = env.get('STEAM_USER2').required().asString()
    ENV_VARIABLE['STEAM_PASSWORD2'] = env.get('STEAM_PASSWORD2').required().asString()
    ENV_VARIABLE['STEAM_USER_ENABLE1'] = env.get('STEAM_USER_ENABLE1').required().asBool()
    ENV_VARIABLE['STEAM_USER_ENABLE2'] = env.get('STEAM_USER_ENABLE2').required().asBool()
}

//verify bot.name, steamid and other usage
//MODULE_GAME for import
module.exports = {
    /* Domain, used for generating trade keys if needed */
    domain: 'window.design',
    db: {
        "mg": ENV_VARIABLE['ENV_MONGODB'] ,
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
            enabled: ENV_VARIABLE['STEAM_USER_ENABLE1'],
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
            enabled: ENV_VARIABLE['STEAM_USER_ENABLE2'],
            trades: false,
            confirm_trades: true,
            idle: true,
            offline: false,
            check_on_items: true,
            steamid: '76561198120250046',
            username: ENV_VARIABLE['STEAM_USER2'],
            password: ENV_VARIABLE['STEAM_PASSWORD2'],
            name: this.username,
            shared_secret: null,
            identity_secret:null,
            maximumConcurrentGame: 8,
        }

    ],

    /* Statistics */
    stats: false
};
