
var winston = require('winston');


var free = function(){};

free.prototype.log = function(){
    console.log("")
}

free.prototype.botAddFreeLicense = function(bots, botid, appIDs, callback){
    //working 304963
    // 227220, 382490, 252150 //151940, 71743, 21485 ]
    var app = [
        //543830, 133966
        //153186,  351940        //204300, 180949
        //429881,  407660 , 304930 
       
        350870,
        351020,351270,351540,359080,362970,366160,366440,370580,370590,370880,377560,378180,378910,379200,59373, 380760,381570,383860,384560,386310,388520,388780,389509,393360,393480, 
        351940,153186,92163, 61305, 129823, 61303, 61304, 94791, 
        346290, 59373, 59371, 59372
        ]
    //70699,
    //145578
    //147998 Savage Resurrection - Free
    //154080 Gem Wars: Attack of the Jiblets FREE
    //70277
    //61126
    //61048
    //60982
    //60938

    if (!isNaN(parseInt(appIDs))) {
        if(typeof appIDs === 'string') {
            appIDs = parseInt(appIDs)
        }
        bots[botid].bot.requestFreeLicense(parseInt(appIDs), function(err, grantedPackages, grantedAppIDs){
            //console.log(err)
            //console.log(grantedPackages)
            //console.log(grantedAppIDs)
            callback(err, grantedPackages,  grantedAppIDs)
        });

    }
}

module.exports = new free();

//var group = require('module_group.js')
//group.log()