module.exports = {
    /* Domain, used for generating trade keys if needed */
    domain: 'window.design',

    /* Bot admin(s) */
    botAdmins: [
        '76561198115737155'
    ],

    /* Log levels */
    logger: {
        console: 'debug',
        file: 'error'
    },

    /* Bots */
    bots: [

        {
            enabled: true,
            trades: false,
            confirm_trades: false,
            idle: false,
            offline: false,
            check_on_items: false,
            name: 'Bot2',
            steamid: '76561198115737155',
            username: 'friendsharing',
            password: 'Friend777.',
            shared_secret: null,
            identity_secret:null,
            maximumConcurrentGame: 8,
        }

    ],

    /* Statistics */
    stats: true
};
