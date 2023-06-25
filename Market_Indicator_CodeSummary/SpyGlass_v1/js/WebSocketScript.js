
var polygonWS;
var finnhubWS;

var allWsSubscriptions = new Array();

function SubscribeToEverything() {
    //  ws.send(`{"action":"subscribe","params":"T.SPX"}`); // no response
    // ws.send(`{"action":"subscribe","params":"T.O*"}`); // no response
    // ws.send(`{"action":"subscribe","params":"T.O.*"}`); // response
    //ws.send(`{"action":"subscribe","params":"T.O:*"}`); // no response
    // ws.send(`{"action":"subscribe","params":"T.*"}`); // GOOD
    // ws.send(`{"action":"subscribe","params":"T*"}`);
    //ws.send(`{"action":"subscribe","params":"Q.O:SPY230217C00405000"}`); // GOOD
    polygonWS.send(`{"action":"subscribe","params":"T.O:SPY230217C00405000"}`); // GOOD
    polygonWS.send(`{"action":"subscribe","params":"Q.O:SPY230217C00405000"}`); // GOOD
    // ws.send(`{"action":"subscribe","params":"Q.O:SPXW230217P04075000"}`); GOOD
    // ws.send(`{"action":"subscribe","params":"O.*"}`);
    // ws.send(`{"action":"subscribe","params":"AM.*"}`);
    // ws.send(`{"action":"subscribe","params":"A.*"}`);
    // ws.send(`{"action":"subscribe","params":"T.O:SPX230221C04100000"}`);
    // ws.send(`{"action":"subscribe","params":"Z.*"}`);

    setTimeout(() => {
        polygonWS.send(`{"action":"unsubscribe","params":"T.*,
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
        var subscribeRequest = `{"action":"subscribe","params":"T.O:` + ticker + dateToday_ws + call_put_token + formattedNumber + suffixDigits + `"}`;
        // send request string
        polygonWS.send(subscribeRequest);
        totalSubscriptions++;
    };

    // all PUTS
    for (let i = marketMin; i < marketMax; i += 5) {
        var formattedNumber = ("00000" + i).slice(-5); // should get last 5 digits

        call_put_token = `P`;
        var subscribeRequest = `{"action":"subscribe","params":"T.O:` + ticker + dateToday_ws + call_put_token + formattedNumber + suffixDigits + `"}`;
        // send request string
        polygonWS.send(subscribeRequest);
        totalSubscriptions++;
    };
    console.log(`total subscriptions: ` + totalSubscriptions);
}


var subscriptions = new Array();

// subscribes AND unsubscribes to websockets
function SubScribeToTicker(symbol) {

    //currentSpyPrice = 400;
    //radius = 10;
    var newSubscriptions = new Array(); // will contain ALL current subscriptions needed
    //var subscriptions = new Array();
    const suffixDigits = `000`;
    const marketMax = Math.floor(rangePrice + radius); // the highest I want to subscribe to
    const marketMin = Math.floor(rangePrice - radius);
    var contract = [`C`, `P`]; // call, put
    var type = [`Q`, `T`]; // quote, trade

    // Add ALL necessary subscriptions to Array 
    for (let strike = marketMin; strike < marketMax; strike++) {
        var formattedNumber = ("00000" + strike).slice(-5); // should get last 5 digits
        for (let cp = 0; cp < contract.length; cp++) {
            for (let tq = 0; tq < type.length; tq++) {
                let subscrString = type[tq] + `.O:` + symbol + dateToday_ws + contract[cp] + formattedNumber + suffixDigits;
                newSubscriptions.push(subscrString);
            }
        }
    }

    // subscribe to them
    for (let i = 0; i < newSubscriptions.length; i++) {
        if (!subscriptions.includes(newSubscriptions[i])) {
            let subscribeRequest = `{"action":"subscribe","params":"` + newSubscriptions[i] + `"}`;
            polygonWS.send(subscribeRequest);
        }
    }

    // unsubscribe to wrong ones
    for (let i = 0; i < subscriptions.length; i++) {
        if (!newSubscriptions.includes(subscriptions[i])) {
            // not in list to be added, unsubscribe
            let unsubscribeRequest = `{"action":"unsubscribe","params":"` + subscriptions[i] + `"}`;
            //console.log(subscribeRequest);
            polygonWS.send(unsubscribeRequest);
        }
    }

    subscriptions = newSubscriptions;
    //console.log("Subscriptions:" + subscriptions.map(i => i).join('\n ') );
    console.log(`total subscriptions to ` + symbol + `: ` + subscriptions.length);
}




// called ONCE at program Start from the controller.js.
function OpenWebSockets() {
    //if (polygonWS.readyState !== WebSocket.OPEN) { // CONNECTING OPEN CLOSING or CLOSED
    //}
    if (!openedWebSockets) {
        console.log(`Opening Websockets`);
        OpenPolygonWS();
        OpenAndSubscribeFinnhubWS(); // subscribes to price data
        openedWebSockets = true;
    }
} // done opening webSockets

function OpenPolygonWS() {

    /////////////////////////////////////////////////
    // Polygon Websocket for trades, quotes, delta

    polygonWS = new WebSocket('wss://socket.polygon.io/options');

    // Connection Opened:
    polygonWS.onopen = function () {
        console.log('Polygon Connected! Authorizing...');
        polygonWS.send(`{"action":"auth","params":"${APIKEY_polygon}"}`);
        // // subscribe to all NEEDED options
        //SubscribeToEverything();
        //SubScribeToSPY();

        WebSocketReady = true;
    }

    // Each message:
    polygonWS.onmessage = (messageEvent) => {
        data = JSON.parse(messageEvent.data); 
        //console.log(data);
        //console.log(messageEvent);
        data.map((msg) => {
            if (msg.ev === 'status') {
                return console.log('PolygonWS Status Update:', msg.message)
            }
            else if (msg.ev === 'Q') {

                myHealthChecker.recordTimeSpentOn('q', true);
                //console.log("quote in. SYmbol: " + msg.sym)
                let timeStamp = msg.t;
                let bidPrice = msg.bp;
                let askPrice = msg.ap;
                let contract = msg.sym.substring(11, 12);
                let strike = parseInt(msg.sym.substring(14, 17), 10);// should return an integer

                ConsoleQuotesCache += ` contract: ${contract} strike: ${strike} bidPrice: ${bidPrice} askPrice: ${askPrice} timeStamp: ${timeStamp}\n`;


                QuoteByStrikeSPY.getLast(contract)[strike] = new QuoteDataPoint(timeStamp, bidPrice, askPrice);

                //console.log("recorded Quote bidPrice is " + QuoteByStrikeSPY.getLast(contract)[strike].bidPrice)

                myHealthChecker.recordTimeSpentOn('q', false);
                // quotes
            }
            else if (msg.ev === 'T') {

                myHealthChecker.recordTimeSpentOn('t', true);
                //console.log("Trade in. SYmbol: " + msg.sym)
                let timeStamp = msg.t;
                let price = msg.p;
                let size = msg.s;
                let contract = msg.sym.substring(11, 12); // returns P or C, for put or call
                let strike = parseInt(msg.sym.substring(14, 17), 10); // should return an integer


                ConsoleTradesCache += ` contract: ${contract} strike: ${strike} price: ${price} size: ${size}`;

                //console.log(` Trade | contract: ${contract} strike: ${strike} price: ${price} size: ${size}`);

                TradeByStrikeSPY.getLast(contract)[strike] = new TradeDataPoint(timeStamp, price, size);

                CalculateImpact(timeStamp, contract, strike, 'SPY');
                // ImpactByStrikeSPY.getLast(contract)[strike] = // use calculateImpact()

                //console.log("recorded trade price is " + TradeByStrikeSPY.getLast(contract)[strike].price);
                // for trade
                myHealthChecker.recordTimeSpentOn('t', false);

            }
            //console.log('Tick:', msg)
        })
    }

    // ERROR HANDLING
    polygonWS.onerror = function () {
        console.log('error');
    }
}

let timeSpyLastRecorded = 0;
function OpenAndSubscribeFinnhubWS() {
    /////////////////////////////////////////////////
    // finnhub.io socket for free SPY price
    finnhubWS = new WebSocket('wss://ws.finnhub.io?token=' + APIKEY_finnhub);

    // Connection opened -> Subscribe
    finnhubWS.addEventListener('open', function (event) {
        finnhubWS.send(JSON.stringify({ 'type': 'subscribe', 'symbol': 'SPY' }))
        //finnhubWS.send(JSON.stringify({'type':'subscribe', 'symbol': 'IC MARKETS:1'}))
    });

    // copied from above
    finnhubWS.onmessage = (messageEvent) => {
        if (Date.now() - 999 < timeSpyLastRecorded) {
            return; // don't need multiple spy per second
        }
        data = JSON.parse(messageEvent.data); //this worked once!
        //console.log(data); // see entire object, formatted
        //console.log(messageEvent);
        if (data.type == `trade`) { // could also be ping
            let tradeData = data.data[0];
            // record price of SPY
            let price = tradeData.p;
            // console.log('FInnhub Tick: ', price);
            // let finnhubTime =  tradeData.t;
            // console.log('FInnhub Time: ', finnhubTime);
            // console.log('Date.now() Time: ', Date.now());

            let timeStamp = tradeData.t; // convert nanoseconds to milliseconds


            //console.log(`finnhub recording Price: ${price}`);
            timeSpyLastRecorded = Date.now();
            RecordCurrentSpyPrice('SPY', timeStamp, price);

        }
    }

    // Unsubscribe function
    var unsubscribe = function (symbol) {
        finnhubWS.send(JSON.stringify({ 'type': 'unsubscribe', 'symbol': symbol }))
    }
}