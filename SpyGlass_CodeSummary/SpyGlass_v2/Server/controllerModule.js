// a node.js app
import MyDates from './myDatesModule.js';
//const MyDates = require('./myDatesModule'); // date data for strings etc.
import WebSocketScript from './webSocketScriptModule.js';
//const WebSocketScript = require('./webSocketScriptModule');
const webSocketScript = new WebSocketScript();
import RestfulAPIScript from './RestfulAPIScriptModule.js';
//const RestfulAPIScript = require('./RestfulAPIScriptModule');
const restfulAPIScript = new RestfulAPIScript();
import Model from './modelModule.js';
//const Model = require('./modelModule');
global.model = new Model(webSocketScript, restfulAPIScript);
//const DataFaker = require('./dataFakerModule');
import DataFaker from './dataFakerModule.js';
const dataFaker = new DataFaker(global.model);
//const HealthChecker = require('./healthCheckerModule');
import HealthChecker from './healthCheckerModule.js';
global.healthChecker = new HealthChecker(global.model);


import logger from './SpyGlassLoggerModule.js';

global.DiagnosticMode = false; // set this to true to NOT connect to webSocket
if (MyDates.dayOfTheWeek == "SATURDAY" || MyDates.dayOfTheWeek == "SUNDAY"
    || (Date.now() > MyDates.dayStart + (6.5 * 60 * 60 * 1000))
) {
    //after trading hours
    global.DiagnosticMode = true;
}

var openedWebSockets = false;
var WebSocketReady = false;
//var radius = 1; // the range to check in either direction
var ApiReady = false;
var googleAwoken = false;
var googleReady = false;
var dyGraphReady = false;

var ControllerRunning = false;
var ControllerTimer;
var TimeStarted = Date.now();
var lastUpdatedTimeStamp = Date.now();
var secondsRunning = 0;
const controllerUpdateDelay = 1000;
// allows variable drawing delay if program is lagging
let drawTimeSecs = 1;
let nextDrawTimeSecs = 1;

// Reporting
global.ConsoleTradesCache = "";
global.ConsoleQuotesCache = "";

// Diagnostic
healthChecker.isActive = true;

// Start Program Running
// load dependencies, JS files.
function ControllerSetup() {


    if (global.DiagnosticMode) {
        logger.warn("After Hours - Entering Diagnostic Mode");

        LogTime(`DIAGNOSTIC MODE SETUP: STARTING SERVICES`);

    } else {
        LogTime(`SETUP: STARTING APIS`);
    }



    StartServices();
} // end setup

function StartServices() {
    logger.log("start services ()");
    if (!restfulAPIScript.ApiReady) {
        restfulAPIScript.ApiSetup();
        setTimeout(StartServices, 1000); // check again after 1 second
        return;
    }
    if (!global.DiagnosticMode) {
        if (!webSocketScript.finnhubWSReady || !webSocketScript.polygonWSReady) {
            webSocketScript.WsSetup();
            setTimeout(StartServices, 1000); // check again after 1 second
            return;
        }
    } else {
        // for diagnostic purposes
        model.GetTicker("SPY").currentPrice = 400;
        model.GetTicker("SPY").rangePrice = 400;

        //model.GetTicker("SPXW").currentPrice = 4005;
        //model.GetTicker("SPXW").rangePrice = 4005;
    }
    if (!global.model.gotStartingPriceForAllTickers()) {

        // Record SPX price with API - only need if using SPX
        //restfulAPIScript.GetPriceApi("SPX");

        // using this to get price instead in single call:
        //global.model.RecordCurrentGreeksApiForAllTickers();

        setTimeout(StartServices, 1000); // check again after 1 second
        return;
    }


    //ready to start
    logger.log("--------------------------------All dependencies ready - starting program-----------------------------");
    ControllerStart();
}

// once everything is loaded runs ONCE:
const ControllerStart = function(){
    ControllerRunning = true;

    LogTime(`START`);

    if (!global.DiagnosticMode) {

        // update range AND Subscribe to necessary websockets using range
        global.model.UpdateRangeForAllTickers();

    }
    //TEST ITEMS HERE
    //RecordCurrentGreeksApiForOptions("SPY");


    // record last Quote for each put and call strike price,
    // just the bid and ask price.

    // record last Trade for each put and call strike price
    // just the price and size
    // THis data is for bar charts

    // as trades come in, also update impact chart
    // with TimeStamp, Impact.

    logger.log("-----------------------------START UPDATING--------------------------------");
    // start Updating 
    let UpdateFunction = global.DiagnosticMode ? DiagnosticControllerUpdate : ControllerUpdate;
    ControllerTimer = setInterval(UpdateFunction, controllerUpdateDelay);
}

function LogTime(dataStr) {
    var dateFormat = new Date(Date.now());
    var dateString = "" + dateFormat.getHours() + ":" + String(dateFormat.getMinutes()).padStart(2, '0') + ":" + String(dateFormat.getSeconds()).padStart(2, '0');


    secondsRunning = Math.floor((Date.now() - TimeStarted) * .001);
    let minutesRunning = Math.floor(secondsRunning / 60);
    let hoursRunning = Math.floor(minutesRunning / 60);
    let timeRunningString = `${hoursRunning} hr ${minutesRunning % 60} min ${secondsRunning % 60} sec`;
    let sinceLastUpdate = Date.now() - lastUpdatedTimeStamp;
    lastUpdatedTimeStamp = Date.now();
    logger.log(`---------- ${dataStr} | ${dateString} Time running: ${timeRunningString} | last update: ${sinceLastUpdate} ms ago
${healthChecker.reportFull(false)}`);

}

function LogTradesAndClear() {
    if (!ConsoleTradesCache == "") {
        logger.log("TRADES \n" + ConsoleTradesCache);
    } else {
        logger.log("NO TRADES THIS SECOND \n");
    }
    ConsoleTradesCache = "";
}

function LogQuotesAndClear() {
   // logger.log("QUOTES \n" + ConsoleQuotesCache);
    ConsoleQuotesCache = "";
}


// Get Price of SPY every second
// either websocket or API
// use price of spy to update range
const ControllerUpdate = function () {
    // EVERY SECOND
    LogTradesAndClear();
    //LogQuotesAndClear(); // not using now
    LogTime(`UPDATE`);

   // MANUAL API CALLS:
    // greeks
    global.model.RecordCurrentGreeksApiForAllTickers();

    // Record SPX price with API
    //restfulAPIScript.GetPriceApi("SPX");

    // Record Bars to CSV
    global.model.RecordBarsForAllTickers();

    // Record Eta data points
    global.model.RecordEtaDataPointsForAllTickers();

    // EVERY 10 SECONDS
    //if ((secondsRunning + 1) % 10 == 0) { // secondsRunning + 1 should make this run on the 9th and 19th second. Next second is when reporting occurs.

    //    //AutoScroll = false; // runs once
    //    global.model.UpdateRangeForAllTickers();

    //    // do 10 second health report
    //   // healthChecker.isPerformingFullReport = true;

    //}

    var dateFormat = new Date(Date.now());

    // EVERY 60 SECONDS
    if (dateFormat.getSeconds() % 60 == 0) { // checks if we're at 0 seconds

        global.model.UpdateRangeForAllTickers();

        // EVERY 5 MINS
        if (dateFormat.getMinutes() % 5 == 0) {
            logger.log(`0 seconds | Resetting Vibe charts to Zero`);
            global.model.ResetVibeForAllTickers();

            // EVERY 20 MINS
            if (dateFormat.getMinutes() % 20 == 0) {
                logger.log(`20 minutes mark | Resetting Eta charts to Zero`);
                global.model.ResetEtaForAllTickers();
            }
        }
    }




    // EXIT CLAUSE
    //ControllerRunning = false;//force controller to run only once
    if (!ControllerRunning) {
        clearInterval(ControllerTimer);
        // ending steps here
    }

}

function SetupFailed() {
    logger.log(`Setup Failed -- Safely Exiting Program`);
}


/////////////////////////////////////////////////////////////////////////
// Diagnostic Controller Methods
/////////////////////////////////////////////////////////////////////////





// Get Price of SPY every second
// either websocket or API
// use price of spy to update range
function DiagnosticControllerUpdate(){
    // EVERY SECOND
    LogTime(`UPDATE`);

    // record current greeks for each Put and Call strike price,
    // Using range to decide which | Pull Using Polygon RESTFUL API

    // MANUAL API CALLS:
    // greeks
    global.model.RecordCurrentGreeksApiForAllTickers();

    dataFaker.RecordFakePrice("SPY");

    // Record SPX price with API
    //restfulAPIScript.GetPriceApi("SPX");


    // EVERY 10 SECONDS
    if ((secondsRunning + 1) % 10 == 0) { // secondsRunning + 1 should make this run on the 9th and 19th second. Next second is when reporting occurs.

        //UpdateRange();

        // do 10 second health report
        healthChecker.isPerformingFullReport = true;
        // changes draw time to adjust to current speed of program
        drawTimeSecs = healthChecker.getAdjustedDrawTime();

    }

    // update subscriptions if range has changed
    //ChangeSubscriptions();

    // EXIT CLAUSE - REMOVE
    //ControllerRunning = false;//force controller to run only once
    if (!ControllerRunning) {
        clearInterval(ControllerTimer);
        // ending steps here
    }

}

// Start of Program
ControllerSetup();