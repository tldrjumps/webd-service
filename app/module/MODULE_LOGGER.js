
var winston = require('winston');
/*
var logger = new (Winston.Logger)({
    transports: [
        new (Winston.transports.Console)({
            colorize: true,
            level: settings.logger.console
        }),
        new (Winston.transports.File)({
            level: settings.logger.file,
            timestamp: true,
            filename: 'error.log',
            json: false
        })
    ]
});
*/

//var strftime = require('strftime');
winston.remove(winston.transports.Console);     // remove the default options
winston.add(winston.transports.Console, {       // and substitute these
    level: 'verbose',
    timestamp: true
    //json: true,
    //stringify: (obj) => JSON.stringify(obj)
  /*
  timestamp: function () { return strftime('%F %T.%L'); },
  formatter: function (options) { // Return string will be passed to winston.
    return options.timestamp() + ' ' + options.level.toUpperCase() + " " + options.message;
  }*/
});
winston.add(
            winston.transports.File, {
            level: "debug",
            timestamp: true,
            filename: 'error_MSteam.log',
            json: false
        }
);

