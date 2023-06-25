import { APIKEY_polygon, APIKEY_finnhub } from './KEYSmodule.js';
//const EventEmitter = require('events');
import EventEmitter from 'events'
//const MyDates = require('./myDatesModule'); // date data for strings etc.
import MyDates from './myDatesModule.js';
//const WebSocket = require('ws');
import WebSocket from 'ws';

import logger from './SpyGlassLoggerModule.js';


export default class WebSocketScript extends EventEmitter { // uses .on
    polygonWS;
    finnhubWS;
    finnhubWSReady = false;
    polygonWSReady = false;

    OpenWebSockets = function () {
        logger.log("opening webSockets");

        //if (polygonWS.readyState == WebSocket.OPEN) { // CONNECTING OPEN CLOSING or CLOSED
        //    return false; // dont open twice
        //}
        this.OpenPolygonWS();
        this.OpenAndSubscribeFinnhubWS(); // subscribes to price data
    }

    //WsSetup = new Promise((resolve, reject) => {
    //    // do some operation async and when it completes call resolve or reject
    //    // a promise object has state "pending" or "fulfilled"
    //    this.OpenWebSockets();
    //    let timeOut = setTimeout(reject("WS Setup timed out"), 5000);
    //    while (!this.finnhubWSReady || !this.polygonWSReady) {

    //        // wait
    //    }
    //    clearTimeout(timeOut);
    //    resolve('Websockets opened here'); // made it through

    //    //reject('API setup failed');
    //    // if something wrong happens call "reject(error /*error object*/)"
    //});
    // runs as soon as created

    socketsOpened = false;
    WsSetup() {
        if (!this.socketsOpened) {
            logger.log("websockets");
            this.OpenWebSockets();
            this.socketsOpened = true;
        }
    }


    OpenPolygonWS= function () {

        /////////////////////////////////////////////////
        // Polygon Websocket for trades, quotes, delta
        this.polygonWS = new WebSocket('wss://socket.polygon.io/options');
        //let myPolygonWS = this.polygonWS;

        // Connection Opened:
        this.polygonWS.onopen = function () {
            logger.log('Polygon Connected! Authorizing...');
            this.polygonWS.send(`{"action":"auth","params":"${APIKEY_polygon}"}`);
            // // subscribe to all NEEDED options
            //SubscribeToEverything();
            //SubScribeToSPY();

            logger.log("polygon open and ready");

            this.polygonWSReady = true;
        }.bind(this);

        // Each message:
        this.polygonWS.onmessage = (messageEvent) => {
            let data = JSON.parse(messageEvent.data);
            //logger.log(data);
            //logger.log(messageEvent);
            data.map((msg) => {
                if (msg.ev === 'status') {
                    return logger.log(`PolygonWS Status Update: ${msg.message}`);
                }
                else if (msg.ev === 'Q') {

                    //logger.log(`symbol: ${msg.sym}`);

                    global.healthChecker.recordTimeSpentOn('q', true);


                    let symbolLength = 3;

                    if (/^[A-Za-z]*$/.test(msg.sym.substring(5, 6))) {
                        // char at index 5 is a letter, symbol is at least 4 digits
                        symbolLength++;
                        logger.log
                    }

                    let symbol = msg.sym.substring(2, symbolLength + 2);

                    //logger.log("quote in. SYmbol: " + msg.sym)
                    // SPY 34567890 1 234567
                    let timeStamp = msg.t;
                    let bidPrice = msg.bp;
                    let askPrice = msg.ap;
                    let contract = msg.sym.substring(symbolLength + 8, symbolLength + 9); // returns P or C, for put or call
                    let strike = parseInt(msg.sym.substring(symbolLength + 9, symbolLength + 14), 10); // should return an integer

                    // Don't write the quotes since we don't use it and shouldn't fill up this string
                   // global.ConsoleQuotesCache += ` contract: ${contract} strike: ${strike} bidPrice: ${bidPrice} askPrice: ${askPrice} timeStamp: ${timeStamp}\n`;

                    //logger.log(`symbol: ${symbol} contract: ${contract} strike: ${strike} bidPrice: ${bidPrice} askPrice: ${askPrice} timeStamp: ${timeStamp}\n`);

                    ///////////////////
                    // moving control to model instead
                    this.emit('newQuote', {
                        symbol: symbol,
                        timeStamp: timeStamp,
                        bidPrice: bidPrice,
                        askPrice: askPrice,
                        contract: contract,
                        strike: strike
                    }); // EventEMitter method

                    //// overwrites last point
                    //global.model.QuoteByStrikeSPY.getLast(contract)[strike] = new QuoteDataPoint(timeStamp, bidPrice, askPrice);

                    ////////////////


                    //logger.log("recorded Quote bidPrice is " + QuoteByStrikeSPY.getLast(contract)[strike].bidPrice)

                    global.healthChecker.recordTimeSpentOn('q', false);
                    // quotes
                }
                else if (msg.ev === 'T') {

                    global.healthChecker.recordTimeSpentOn('t', true);
                    //logger.log("Trade in. SYmbol: " + msg.sym)

                    let symbolLength = 3;

                    if (/^[A-Za-z]*$/.test(msg.sym.substring(5, 6))) {
                        // char at index 5 is a letter, symbol is at least 4 digits
                        symbolLength++;
                    }

                    //logger.log(`sym length:${symbolLength}`);

                    let symbol = msg.sym.substring(2, symbolLength + 2);
                    // complete sym for reference: O:SPY230410C00404000 or O:SPXW230410C04050000
                    let timeStamp = msg.t;
                    let price = msg.p;

                    

                    let size = msg.s;
                    let contract = msg.sym.substring(symbolLength + 8, symbolLength + 9); // returns P or C, for put or call
                    let strike = parseInt(msg.sym.substring(symbolLength + 9, symbolLength + 14), 10); // should return an integer
                    

                    if (strike < 200) {
                        logger.log(`symbol: ${symbol} complete: ${msg.sym} contract: ${contract} strike: ${strike} price: ${price} size: ${size}`);
                        throw new Error("trade strike is below 200, something is wrong with data");
                    }

                    let ticker = global.model.GetTicker(symbol);
                    let filterOptionPrice = ticker.filterOptionPrice;

                    if (price <= filterOptionPrice) {
                        global.ConsoleTradesCache += ` symbol: ${symbol} contract: ${contract} strike: ${strike} price: ${price} size: ${size} | price too low, Skipping \n`;
                        return;
                    } 

                    global.ConsoleTradesCache += ` symbol: ${symbol} contract: ${contract} strike: ${strike} price: ${price} size: ${size}`;

                    //logger.log(` Trade | contract: ${contract} strike: ${strike} price: ${price} size: ${size}`);


                    /////////////////

                    // moving control to model instead
                    this.emit('newTrade', {
                        symbol: symbol,
                        timeStamp: timeStamp,
                        price: price,
                        size: size,
                        contract: contract,
                        strike: strike
                    }); // EventEMitter method

                    // overwrites last point - moving to model for beter encapsulation
                    /*global.model.TradeByStrikeSPY.getLast(contract)[strike] = new TradeDataPoint(timeStamp, price, size);*/

                    //global.model.GetTicker(CalculateImpact(timeStamp, contract, strike, 'SPY');
                    //////////////////////

                    //logger.log("recorded trade price is " + TradeByStrikeSPY.getLast(contract)[strike].price);
                    // for trade
                    global.healthChecker.recordTimeSpentOn('t', false);

                } // end else if
                //logger.log('Tick:', msg)
            })  // end data.map()

            //logger.log("force Closing polygonws");
            ////this.polygonWS.close();

        } // end onMessage

        // ERROR HANDLING
        this.polygonWS.onerror = function (error) {
            logger.error('polygonWS error: ', error);
        }

        this.polygonWS.onclose = (message) => {
        logger.error('Spyglass Error: polygonWS closed | message: ', message);
            //setTimeout(function () { this.OpenPolygonWS }, 5000);
            logger.log()
        }

        //this.polygonWS.onclose = function (message) {
        //    logger.error('Spyglass Error: polygonWS closed | message: ', message);
        //    setTimeout(this.OpenPolygonWS, 3000);
        //}.bind(this)

    }

    timeSpyLastRecorded = 0; // this var should be in the model
    lastTimeStampRecorded = 0;

    OpenAndSubscribeFinnhubWS() {

        if (this.finnhubWSReady) return;

        logger.log("opening finnhub");
        /////////////////////////////////////////////////
        // finnhub.io socket for free SPY price
        this.finnhubWS = new WebSocket('wss://ws.finnhub.io?token=' + APIKEY_finnhub);

        //if (finnhubWS.readyState !== WebSocket.OPEN) { // CONNECTING OPEN CLOSING or CLOSED
        //    return; // dont open twice
        //}

        // Connection opened -> Subscribe
        this.finnhubWS.addEventListener('open', function (event) {
            logger.log("FinnhubWS open");
            this.finnhubWS.send(JSON.stringify({ 'type': 'subscribe', 'symbol': 'SPY' }));
            logger.log("FinnhubWS subscribing");
            logger.log("finnhub open and ready");

            this.finnhubWSReady = true;
            //this.finnhubWS.send(JSON.stringify({'type':'subscribe', 'symbol': 'IC MARKETS:1'}))
        }.bind(this)
        );

        // copied from above
        this.finnhubWS.onmessage = (messageEvent) => {


            if (Date.now() - 999 < this.timeSpyLastRecorded) {
                return; // don't need multiple spy per second
            }
            let data = JSON.parse(messageEvent.data); //this worked once!
            //logger.log(data); // see entire object, formatted
            //logger.log(messageEvent);
            if (data.type == `trade`) { // could also be ping
                let tradeData = data.data[0];
                // record price of SPY
                let price = (Math.floor(100 * tradeData.p) / 100);
                // logger.log('FInnhub Tick: ', price);
                // let finnhubTime =  tradeData.t;
                // logger.log('FInnhub Time: ', finnhubTime);
                // logger.log('Date.now() Time: ', Date.now());

                let timeStamp = tradeData.t; // convert nanoseconds to milliseconds

                if (this.lastTimeStampRecorded > timeStamp) { // data sent was backwards

                    return; // don't record data points that are in the past. looks bad in graph
                }

                //logger.log(`finnhub recording Price: ${price}`);
                this.timeSpyLastRecorded = Date.now();
                this.lastTimeStampRecorded = timeStamp;

                // replacing with emitter function. Could also access model directly, since it is now global variable.
                this.emit('newTickerPrice', {
                    symbol: 'SPY',
                    timeStamp: timeStamp,
                    price: price
                }); // EventEMitter method
            }
        } // onMessage

        this.finnhubWS.onclose = (messageEvent) => {
            logger.error(`SpyGlass ERROR: finnhubWS was closed: `, messageEvent);
            logger.log("Reopening finnhubWS in 10 seconds");
            setTimeout(() => { this.OpenAndSubscribeFinnhubWS() },10000); // try and resubscribe
            this.finnhubWSReady = false;
        }

        this.finnhubWS.onerror = (messageEvent) => {
            logger.error(`finnhubWS Error: `, messageEvent.data);
        }



        // Unsubscribe function
        var unsubscribe = function (symbol) {
            this.finnhubWS.send(JSON.stringify({ 'type': 'unsubscribe', 'symbol': symbol }))
        }
    }


    // subscribes AND unsubscribes to websockets
    SubScribeToTicker(ticker) {
        const radius = ticker.radius;
        const symbol = ticker.sym_polygon;
        const rangePrice = ticker.rangePrice;
        const intervalStep = ticker.intervalStep;

        logger.log

        if (this.polygonWS.readyState !== this.polygonWS.OPEN) {
            logger.log('socket not open, but trying to subscribe. trying again in a few seconds...');
            setTimeout

        }

        logger.log(`subscribe to ticker: ${symbol} rangePrice ${rangePrice} radius ${radius}`);

        let subscriptions = ticker.subscriptions;

        //currentSpyPrice = 400;
        var newSubscriptions = new Array(); // will contain ALL current subscriptions needed
        //var subscriptions = new Array();
        const suffixDigits = `000`;
        const marketMax = Math.floor(rangePrice + radius); // the highest I want to subscribe to
        const marketMin = Math.floor(rangePrice - radius);
        var contract = [`C`, `P`]; // call, put
        var type = [`Q`, `T`]; // quote, trade

        // Add ALL necessary subscriptions to Array 
        for (let strike = marketMin; strike < marketMax; strike += intervalStep) {
            var formattedNumber = ("00000" + strike).slice(-5); // should get last 5 digits
            for (let cp = 0; cp < contract.length; cp++) {
                for (let tq = 0; tq < type.length; tq++) {
                    let subscrString = type[tq] + `.O:` + symbol + MyDates.dateToday_ws + contract[cp] + formattedNumber + suffixDigits;
                    newSubscriptions.push(subscrString);
                }
            }
        }

        //    let myPolygonWS = this.polygonWS;

        // subscribe to them
        for (let i = 0; i < newSubscriptions.length; i++) {
            if (!subscriptions.includes(newSubscriptions[i])) {
                let subscribeRequest = `{"action":"subscribe","params":"` + newSubscriptions[i] + `"}`;
                this.polygonWS.send(subscribeRequest);
            }
        }

        // unsubscribe to wrong ones
        for (let i = 0; i < subscriptions.length; i++) {
            if (!newSubscriptions.includes(subscriptions[i])) {
                // not in list to be added, unsubscribe
                let unsubscribeRequest = `{"action":"unsubscribe","params":"` + subscriptions[i] + `"}`;
                //logger.log(subscribeRequest);
                this.polygonWS.send(unsubscribeRequest);
            }
        }

        subscriptions = newSubscriptions;
        //logger.log("Subscriptions:" + subscriptions.map(i => i).join('\n ') );
        logger.log(`total subscriptions to ` + symbol + `: ` + subscriptions.length);
    } // end updateSubscriptions();



} // end ws class



var subscriptions = new Array();

var allWsSubscriptions = new Array();

function SubscribeToEverything() {
    //  ws.send(`{"action":"subscribe","params":"T.SPX"}`); // no response
    // ws.send(`{"action":"subscribe","params":"T.O*"}`); // no response
    // ws.send(`{"action":"subscribe","params":"T.O.*"}`); // response
    //ws.send(`{"action":"subscribe","params":"T.O:*"}`); // no response
    // ws.send(`{"action":"subscribe","params":"T.*"}`); // GOOD
    // ws.send(`{"action":"subscribe","params":"T*"}`);
    //ws.send(`{"action":"subscribe","params":"Q.O:SPY230217C00405000"}`); // GOOD
    this.polygonWS.send(`{"action":"subscribe","params":"T.O:SPY230217C00405000"}`); // GOOD
    this.polygonWS.send(`{"action":"subscribe","params":"Q.O:SPY230217C00405000"}`); // GOOD
    // ws.send(`{"action":"subscribe","params":"Q.O:SPXW230217P04075000"}`); GOOD
    // ws.send(`{"action":"subscribe","params":"O.*"}`);
    // ws.send(`{"action":"subscribe","params":"AM.*"}`);
    // ws.send(`{"action":"subscribe","params":"A.*"}`);
    // ws.send(`{"action":"subscribe","params":"T.O:SPX230221C04100000"}`);
    // ws.send(`{"action":"subscribe","params":"Z.*"}`);

    setTimeout(() => {
        this.polygonWS.send(`{"action":"unsubscribe","params":"T.*,
  Q.O:SPY230217C00405000, T.O:SPY230217C00405000"}`);
    }, 5000);

}

function SubScribeToSPX() {
    var totalSubscriptions = 0;
    const ticker = `SPXW`;
    const suffixDigits = `000`;
    const marketMax = 5000; // the highest I want to subscribe to
    const marketMin = 1000;
    var call_put_token;
    // all CALLS
    for (let i = marketMin; i < marketMax; i += 5) {
        var formattedNumber = ("00000" + i).slice(-5); // should get last 5 digits

        call_put_token = `C`;
        //var subscribeRequest = `{"action":"subscribe","params":"T.*"}`;
        var subscribeRequest = `{"action":"subscribe","params":"T.O:` + ticker + MyDates.dateToday_ws + call_put_token + formattedNumber + suffixDigits + `"}`;
        // send request string
        this.polygonWS.send(subscribeRequest);
        totalSubscriptions++;
    };

    // all PUTS
    for (let i = marketMin; i < marketMax; i += 5) {
        var formattedNumber = ("00000" + i).slice(-5); // should get last 5 digits

        call_put_token = `P`;
        var subscribeRequest = `{"action":"subscribe","params":"T.O:` + ticker + MyDates.dateToday_ws + call_put_token + formattedNumber + suffixDigits + `"}`;
        // send request string
        this.polygonWS.send(subscribeRequest);
        totalSubscriptions++;
    };
    logger.log(`total subscriptions: ` + totalSubscriptions);
}



