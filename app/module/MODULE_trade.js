//https://www.reddit.com/r/node/comments/30cy74/logging_strategy_for_nodejs_dependent_modules/?st=j8mhuwcc&sh=4dd0316f
var winston = require('winston');
var axios = require('axios')
var fs = require('fs')
var Trade = function(){};

Trade.prototype.log = function(){
    console.log("")
}

Trade.prototype.offloading = function(bots, botid){

    // Get our inventory 753 for Steam, 730 for CSGO, 2 for public items
    //https://dev.doctormckay.com/topic/332-identifying-steam-items/
    //https://www.reddit.com/r/SteamBot/comments/5he94k/psa_there_is_a_new_endpoint_for_fetching_user/?st=j94ynt9n&sh=6eabdb87
    //753, 2 working?
    bots[botid].offers.getInventoryContents(753, 6, true, function(err, inventory) {
        if (err) {
            winston.info(err);
            return;
        }

        if (inventory.length == 0) {
            // Inventory empty
            winston.info("CS:GO inventory is empty");
            return;
        }

        winston.info("Found " + inventory.length + "  items");

        //https://dev.doctormckay.com/topic/332-identifying-steam-items/
        //assetid"6293327425"classid:"163240275", instanceid"246376127", owner_actions,
        //ink"http://steamcommunity.com/my/gamecards/209080/"
        //tags "{"internal_name":"item_class_2","name":"Trading Card","category":"item_class","color":"","category_name":"Item Type"}"
        //type Guns of Icarus Online Trading Card"
        inventory.map(function(inv){
            //winston.info(inv)
            fs.appendFile('../message.txt', JSON.stringify(inv) +",", function (err) {
              if (err) throw err;

            });
        })

        /*
        // Create and send the offer "https://steamcommunity.com/tradeoffer/new/?partner=" + 12345678 + "&token=" + "xxxxxxxx"
        var offer = bots[botid].offers.createOffer("76561198113607607");
        offer.addMyItems(inventory);
        offer.setMessage("Here, have some gifts");
        offer.send(function(err, status) {
            if (err) {
                console.log(err);
                return;
            }

            if (status == 'pending') {
                // We need to confirm it
                console.log(`Offer #${offer.id} sent, but requires confirmation`);
                community.acceptConfirmationForObject("identitySecret", offer.id, function(err) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("Offer confirmed");
                    }
                });
            } else {
                console.log(`Offer #${offer.id} sent successfully`);
            }
        });
        */
    });

}

module.exports = new Trade();

//var group = require('module_group.js')
//group.log()