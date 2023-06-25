

// variables to build subscription strings
var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();
var yy = String(yyyy).substring(2);
const dateToday_ws = yy + mm + dd;
const dateToday_api = yyyy + "-" + mm + "-" + dd;

const dayStartStr = `${mm}/${dd}/${yyyy} 6:00:00`;
const dayStart = new Date(dayStartStr).getTime();

const dayOfTheWeek = new Date().toLocaleString('en-us', { weekday: 'long' }).toUpperCase();

let DiagnosticMode = false; 
if (dayOfTheWeek == "SATURDAY" || dayOfTheWeek == "SUNDAY" 
    || (Date.now() > dayStart + (7.5 * 60 * 60 * 1000))
) {
    //after trading hours
    DiagnosticMode = true;
}


var wsConsumerConnected = false;
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

// Diagnostic
let myHealthChecker = new HealthChecker();
myHealthChecker.isActive = true;

// Start Program Running
// load dependencies, JS files.
function ControllerSetup() {


    LogTime(`SETUP: STARTING APIS`);

    //ready to start
    console.log("-------------------------------------------------------------");
   

    StartServices();
} // end setup

function StartServices() {

    if (!googleReady) {
        if (!googleAwoken) {
            console.log(`Starting Google charts Api`);
            googleAwoken = true;
            googleAwake();
        }
        setTimeout(StartServices, 100); // check again after 1 second
        return;
    }
    if (!dataTablesInitialized) { // require google first to load DataTables
        //if (!googleAwoken) {
        //    console.log(`Starting Google charts Api`);
        //    googleAwoken = true;
        //    googleAwake();
        //}


        setTimeout(StartServices, 1000); // check again after 1 second
        return;
    }
    if (!wsConsumerConnected) { // require model first to load data into
        console.log("Consumer NOT connected");
        wsConsumerSetup();

        setTimeout(StartServices, 1000); // check again after 1 second
        return;
    }
    if (!dataTablesPopulated()) {
        console.log("dataTables NOT populated yet");
        RequestDataFromServer();
        setTimeout(StartServices, 1000); // check again after 1 second
        return;
    }

    console.log("All dependencies ready - starting program");
    ControllerStart();
}

// once everything is loaded runs ONCE:
ControllerStart = function () {
    ControllerRunning = true;

    LogTime(`START`);

    // retrieve first state of tables

    // 

    console.log("-------------------------------------------------------------");
    // start Updating 
    nextDrawTimeSecs = secondsRunning;
    ControllerTimer = setInterval(ControllerUpdate, controllerUpdateDelay);
}

function LogTime(dataStr) {
    var dateFormat = new Date(Date.now());
    var dateString = "" + dateFormat.getHours() + ":" + String(dateFormat.getMinutes()).padStart(2, '0') + ":" + String(dateFormat.getSeconds()).padStart(2, '0');


    secondsRunning = Math.floor((Date.now() - TimeStarted) * .001);
    sinceLastUpdate = Date.now() - lastUpdatedTimeStamp;
    lastUpdatedTimeStamp = Date.now();
    console.log(`${dataStr} | ${dateString} Time running: ${secondsRunning} Seconds | last update: ${sinceLastUpdate} ms ago
${myHealthChecker.reportFull(false)}`);
    
}

// Get Price of SPY every second
// either websocket or API
// use price of spy to update range
ControllerUpdate = function () {
    // EVERY SECOND
    LogTime(`UPDATE`);


    // EVERY 10 SECONDS
    if ((secondsRunning + 1) % 10 == 0) { // secondsRunning + 1 should make this run on the 9th and 19th second. Next second is when reporting occurs.

        //AutoScroll = false; // runs once

        // do 10 second health report
        myHealthChecker.isPerformingFullReport = true;
        // changes draw time to adjust to current speed of program
        drawTimeSecs = myHealthChecker.getAdjustedDrawTime();
        
    }

    // adding fake rows! REMOVE
    //myHealthChecker.addFakeRows(ImpactSPY_table, 25000);

    if ((secondsRunning > nextDrawTimeSecs)) {

        UpdateAllCharts();

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


/////////////////////////////////////////////////////////////////////////
// Diagnostic Controller Methods
/////////////////////////////////////////////////////////////////////////


// Start Program Running
// load dependencies, JS files.
function DiagnosticControllerSetup() {

    // for diagnostic purposes REMOVE
    currentSpyPrice = 400;



    LogTime(`SETUP`);
    if (!googleReady) {
        if (!googleAwoken) {
            console.log(`Starting Google charts Api`);
            googleAwoken = true;
            googleAwake();
        }
        setTimeout(DiagnosticControllerSetup, 100); // check again after 1 second
        return;
    }
    // commenting these out REMOVE
    if (!ApiReady) {

        console.log(`Starting financial Apis`);
        setTimeout(DiagnosticControllerSetup, 100); // check again after 1 second
        return;
    }
    if (!WebSocketReady) {
        OpenWebSockets();
        setTimeout(DiagnosticControllerSetup, 100); // check again after 1 second
        return;
    }
    if (currentSpyPrice == 0) {
        // webscoket should update currentSPyPrice
        setTimeout(DiagnosticControllerSetup, 100); // check again after 1 second
        return;
    }

    //ready to start
    console.log("-------------------------------------------------------------");
    console.log("All dependencies ready - starting program");
    DiagnosticControllerStart();
}

// once everything is loaded runs ONCE:
DiagnosticControllerStart = function () {
    ControllerRunning = true;

    LogTime(`START`);

    UpdateRange();

   

    console.log("-------------------------------------------------------------");
    // start Updating 
    nextDrawTimeSecs = secondsRunning;
    ControllerTimer = setInterval(DiagnosticControllerUpdate, controllerUpdateDelay);
}

function LogTime(dataStr) {
    var dateFormat = new Date(Date.now());
    var dateString = "" + dateFormat.getHours() + ":" + String(dateFormat.getMinutes()).padStart(2, '0') + ":" + String(dateFormat.getSeconds()).padStart(2, '0');


    secondsRunning = Math.floor((Date.now() - TimeStarted) * .001);
    sinceLastUpdate = Date.now() - lastUpdatedTimeStamp;
    lastUpdatedTimeStamp = Date.now();
    console.log(`${dataStr} | ${dateString} Time running: ${secondsRunning} Seconds | last update: ${sinceLastUpdate} ms ago
${myHealthChecker.reportFull(false)}`);

}


// Get Price of SPY every second
// either websocket or API
// use price of spy to update range
DiagnosticControllerUpdate = function () {
    // EVERY SECOND
    LogTime(`UPDATE`);

    // record current greeks for each Put and Call strike price,
    // Using range to decide which | Pull Using Polygon RESTFUL API

     
    DataFaker.RecordFakePrice("SPY");


    // EVERY 10 SECONDS
    if ((secondsRunning + 1) % 10 == 0) { // secondsRunning + 1 should make this run on the 9th and 19th second. Next second is when reporting occurs.

        //UpdateRange();

        // do 10 second health report
        myHealthChecker.isPerformingFullReport = true;
        // changes draw time to adjust to current speed of program
        drawTimeSecs = myHealthChecker.getAdjustedDrawTime();

    }

    if ((secondsRunning > nextDrawTimeSecs)) {

        UpdateChart();

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


