var http = require('http');
var express = require('express');
var proxy = require('http-proxy-middleware');
var bcrypt = require('bcrypt')
var axios = require('axios')

var winston = require('winston');
var logger = require('./module/MODULE_LOGGER.js');   // to force the initialization code (above) to run once
const LOCAL_PORT = 9015;

var settings = {};
try {
    settings = require('./config/activateSettings.js');
} catch (err) {
    console.error('No settings file! (./config/activateSettings.js)');
    console.error('Read more: https://github.com/Aareksio/node-steam-card-farm#configuration');
    process.exit(1);
}

function authDB(db, username, sec, callback){
    var options = {
      "limit": 1,
      "sort": "_id"
    }
    winston.info("find guardian for " + username)
    db.collection('apicheck').findOne({username: username}, function(err, document) {
        if(err){
            return callback(err);
        }
        bcrypt.compare(sec, document.secret, function (err, result) {

            if (result === true) {
              return callback(null, result);
            } else {
              return callback(err);
            }
          })
    });


}


var mongodb = require('mongodb')

async function db2() {
    if(mongoDB) return mongoDB;
  
    var url = settings.db.auth
  
    var MongoClient = require('mongodb').MongoClient;
    var mongoDB = await mongodb.MongoClient.connect(url);
    return mongoDB
}

var webdriver_server = 'http://localhost:' + LOCAL_PORT + '/wd/hub';

var chrome = require('selenium-webdriver/chrome')
var options = new chrome.Options()
var webdriver = require( 'selenium-webdriver')
var Http = require( 'selenium-webdriver/http');
const {By, until} = require('selenium-webdriver');
function chromeSetup(id){

    var saved_session_id = id
    if( 'undefined' != typeof saved_session_id && saved_session_id!= ""){
      console.log("Going to attach to existing session  of id: " + saved_session_id);
      client = new Http.HttpClient( webdriver_server );
      executor = new Http.Executor( client);
      browser = webdriver.WebDriver.attachToSession( executor, saved_session_id);
    }

    //document.querySelector('.game_nominate_nonomination').click()
    //category2
    //btn_green_white_innerfade btn_medium newmodal_buttons


    var list = [
        
        "https://store.steampowered.com/app/570/Dota_2/",
        "https://store.steampowered.com/app/204300/Awesomenauts__the_2D_moba/",
        "https://store.steampowered.com/app/524220/NieRAutomata/",
        "https://store.steampowered.com/app/284160/BeamNGdrive/",
        "https://store.steampowered.com/app/457140/Oxygen_Not_Included/",
        "https://store.steampowered.com/app/582160/Assassins_Creed_Origins/",
        "https://store.steampowered.com/app/435150/Divinity_Original_Sin_2/",
        "https://store.steampowered.com/app/504050/Planet_Nomads/",
        "https://store.steampowered.com/app/322330/Dont_Starve_Together/",
        "https://store.steampowered.com/app/242860/Verdun/",
        "https://store.steampowered.com/app/730/CounterStrike_Global_Offensive/",
        "https://store.steampowered.com/app/429660/Tales_of_Berseria/",
        "https://store.steampowered.com/app/413150/Stardew_Valley/"
    ]
    
    for(var i = 0 ; i < list.length;i++){
        (function(i) {
            browser.get(list[i])
            //btnv6_lightblue_blue 
            if(i == 12){

                browser.findElement(By.css('.game_nominate_nonomination')).then(function (elem) {
                    elem.click()
                    browser.wait(function(){
                        return delay(3000).then(function(){
                          return true;
                        })
                    }, 4000);
                    browser.findElement(By.id('category' + (i + 1))).click();
                    browser.findElement(By.id('category13_writein')).sendKeys("Category");

                    //driver.findElement(By.name('q')).sendKeys('webdriver', Key.RETURN);

                    browser.findElement(By.css('.btn_green_white_innerfade')).click();
        
                    browser.wait(function(){
                        return delay(2000).then(function(){
                          return true;
                        })
                    }, 3000);
        
            
                }).catch(function(ex) {
                  
    
    
                });
            }else{


                browser.findElement(By.css('.game_nominate_nonomination')).then(function (elem) {
                    elem.click()
                    browser.wait(function(){
                        return delay(3000).then(function(){
                          return true;
                        })
                    }, 4000);
                    browser.findElement(By.id('category' + (i + 1))).click();
                    
                    browser.findElement(By.css('.btn_green_white_innerfade')).click();
        
                    browser.wait(function(){
                        return delay(2000).then(function(){
                          return true;
                        })
                    }, 3000);
        
            
                }).catch(function(ex) {
                  
    
    
    
                });
            }



        })(i);
    }
    
    
} 


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



var getUrl = function(id){
    var url = "http://localhost:5001/startChrome/" + id
    //winston.info(bots[botid].bot.myGroups)
    return axios.get(url, {
        headers: {
            //Cookie: "cookie1=value; cookie2=value; cookie3=value;"
        }
    })
}

var processing = function(response, res){
    console.log(response.data)
    var id = response.data
    /*
    var webdriver_server = 'http://localhost:' + LOCAL_PORT + '/wd/hub', // chromedriver.exe serves at this port
    //var webdriver_server = "https://webd-service.herokuapp.com/wd/hub"
    
    chrome = require('selenium-webdriver/chrome'),
    options = new chrome.Options(),
    webdriver = require( 'selenium-webdriver'),
    Http = require( 'selenium-webdriver/http');
    //options.setChromeBinaryPath(your_chrome_binary_path);
    
    var saved_session_id = id
    if( 'undefined' != typeof saved_session_id && saved_session_id!= ""){
      console.log("Going to attach to existing session  of id: " + saved_session_id);
      client = new Http.HttpClient( webdriver_server );
      executor = new Http.Executor( client);
      browser = webdriver.WebDriver.attachToSession( executor, saved_session_id);
    }
    
    // set the window inner size to 800 x 600
    
    browser.get('http://www.yahoo.com');
    */
    setTimeout(function(){

        chromeSetup(response.data)
    }, 15000)
    
    
}

var myargv = process.argv.slice(2)
console.log(myargv)
getUrl(myargv[0]).then(response => processing(response, ""));


