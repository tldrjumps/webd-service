var http = require('http');
var express = require('express');
var proxy = require('http-proxy-middleware');
var bcrypt = require('bcrypt')
var axios = require('axios')
var fs = require('fs')
var winston = require('winston');
var logger = require('./module/MODULE_LOGGER.js');   // to force the initialization code (above) to run once
const LOCAL_PORT = 9015;
const SELENIUM_PORT = 9015;
var settings = {};
try {
    settings = require('./config/activateSettings.js');
} catch (err) {
    console.error('No settings file! (./config/activateSettings.js)');
    console.error('Read more: https://github.com/Aareksio/node-steam-card-farm#configuration');
    process.exit(1);
}


const chromedriver = require('chromedriver');

const args = [
  '--url-base=wd/hub',
  `--port=${LOCAL_PORT}`
];
chromedriver.start(args);
var webdriver_server = 'http://localhost:' + SELENIUM_PORT + '/wd/hub';

var chrome = require('selenium-webdriver/chrome')
var options = new chrome.Options()
var webdriver = require( 'selenium-webdriver')
var Http = require( 'selenium-webdriver/http');
const {By, until} = require('selenium-webdriver');


var parentHandle;
var handlesDone
function chromeSetup(response){
    //asiastation beenthroughs
    var names = "beenthoughs"
    options.setChromeBinaryPath(process.env.GOOGLE_CHROME_BIN);
    options.addArguments("user-data-dir=c:/tmp/" + names);
    /*
    options.addArguments(
        //'headless',
        // Use --disable-gpu to avoid an error from a missing Mesa library, as per
        // https://chromium.googlesource.com/chromium/src/+/lkgr/headless/README.md
        //'disable-gpu',
        //'--user-data-dir="c:/tmp/youthedeveloper"',
        'disable-infobars', 'no-sandbox', 'allow-insecure-localhost',
        'window-size=1280,720',
        '--user-agent="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.50 Safari/537.36"'
        //enable multiple file download args?
        //chrome profile path for remember password.
        //drive existing profile?
    );
    */
    var driver = new webdriver.Builder()
    .withCapabilities(webdriver.Capabilities.chrome())
    .setChromeOptions(options)
    .usingServer(webdriver_server)
    .build()

    driver.get("https://www.humblebundle.com/store/company-of-heroes-2")   
    
    driver.wait(function(){
        return delay(10000).then(function(){
            return true;
        })
    }, 15000);
    //price-button js-nav-item-content
    //store-free-payment-button
    //driver.findElement(By.css('.js-buy-button')).click()
    //driver.findElement(By.css('.js-dismiss-button')).click()
    //driver.executeScript("document.body.style.zoom = '0.4'")
        
    driver.findElement(By.css('.js-dismiss-button')).click().catch(function(){})    


    driver.wait(function(){
        return delay(5000).then(function(){
            return true;
        })
    }, 5000);

    driver.findElement(By.css('.js-price-button')).click()
    driver.wait(function(){
        return delay(2000).then(function(){
            return true;
        })
    }, 2000);

    //driver.findElement(By.css('.in-cart')).click()
    var script1 = `document.querySelector('.in-cart').click()`
    
    driver.executeScript(script1).then(function(){
        console.log(script1)
    })


    driver.wait(function(){
        return delay(5000).then(function(){
            return true;
        })
    }, 5000);
    //wait
    var script1 = `document.querySelector('.store-free-payment-button').click()`
    
    driver.executeScript(script1).then(function(){
        console.log(script1)
    })

    driver.wait(function(){
        return delay(20000).then(function(){
            return true;
        })
    }, 23000);

    driver.wait(until.urlContains("receipt"), 30000);    
    //driver.wait(until.elementLocated(By.css('.receipt-redirect  a:first-child')), 30000);    


    //Wait Url
    driver.findElement(By.css('.receipt-redirect  a:first-child'))
    .then(function(elem){

        elem.click().then(function(){
            //wait until window getCurrentUrl change / popup getWindowHandles
            driver.wait(until.urlContains("email"), 30000);  



        })
        
    }).then(function(){

        driver.findElements(By.css('a[href*="https://www.humblebundle.com/?key"]'))
        .then(function(found){
            found[0].click()
            console.log('Element found? %s', !!found.length)
        });
    })


    driver.wait(function(){
        return delay(15000).then(function(){
            return true;
        })
    }, 16000);

    var unredeem = '.sr-unredeemed-button-text'
    driver.findElement(By.css(unredeem))
    .then(function(elem){
        var script3 = `document.querySelector('${unredeem}').click()`
        var unredeem2= '.steam-redeem-button'
        driver.executeScript(script3).then(function(){
            //return driver.wait(function() {
            driver.wait(until.elementLocated(By.css(unredeem2)), 10000)    
                //return driver.findElement(By.css(unredeem2));
            //}, 15000)
            .then(function(){

                var script4 = `document.querySelector('${unredeem2}').click()`
                driver.executeScript(script4)
                .then(function(elem){
                    //elem.click()
                    driver.wait(until.elementLocated(By.css('#purchase_confirm_ssa input')), 30000)    
                    .then(function(){ 
                        driver.findElement(By.css("#purchase_confirm_ssa input")).click()
                        .then(function(elem){
                            driver.findElement(By.css("#register_btn")).click()
                
                        })
                        //document.querySelector('#purchase_confirm_ssa input').click()
                        //register_btn
                    })


                })    
            })    
        
        })
        
    })

    



    ///emailhelper?uid=X6373V1Y0JN00&uidverify=f84b7849acb5b6e2014354696704f53cf29c02e5f21f5ceb5d6c1a74cc30daa7
    //https://www.humblebundle.com/receipt?uidverify=f84b7849acb5b6e2014354696704f53cf29c02e5f21f5ceb5d6c1a74cc30daa7&s=thanks&uid=X6373V1Y0JN00
    //https://stackoverflow.com/questions/1520429/is-there-a-css-selector-for-elements-containing-certain-text
    //https://stackoverflow.com/questions/37098405/javascript-queryselector-find-div-by-innertext


} 
/*
<div class="sr-key">
    <div class="sr-key-heading">
      <span>Company of Heroes 2 <span class="js-admin-edit" data-entity-kind="tpkd" data-machine-name="companyofheroes2_freegame_steam"></span></span>
  
    </div>
    <div class="sr-key-content-region"><div>
  <div class="sr-unredeemed">
    <div class="sr-unredeemed-button
                sr-unredeemed-steam-button
                js-sr-unredeemed-steam-button
                ">
      <i class="sr-unredeemed-button-steam-icon
                hb hb-steam"></i>
      <span class="sr-unredeemed-button-text">Reveal your Steam™ key</span>
    </div>


  </div>
  <div class="custom-instruction">
    
  </div>
</div></div>
  </div>

*/

//3DTXQ0Y-9NXEP-Y6ZI7


function getObjectToCollection(db, collection, obj, callback){
    
        winston.info( obj + " get from " + collection)

        var options = {
            "limit": 1,
            "sort": "_id"
        }
        db.collection(collection).findOne({_id: obj._id}, function(err, document) {

          if(err){
            winston.info(err)
            //throw err
            return callback(err);
          }
          winston.info(document)
          if(document == null || document == undefined){
            return callback(new Error("Not Found"));
          }
          callback(null, document)
          winston.info("End of")
        });
    
}

function delay(t) {
    return new Promise(function(resolve) { 
        setTimeout(resolve, t)
    });
  }


chromeSetup()