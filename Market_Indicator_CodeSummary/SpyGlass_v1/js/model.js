
// may need this for speed: https://developers.google.com/chart/interactive/docs/datatables_dataviews#javascriptliteral


//BUILD a containing class for symbol.
// "SPY"
// radius to check
// interval step
// high for following times:
// lo ...
// by 30s, 1m, 5m, 1hr, 1day


class Ticker {
    name = "NONE"; // a string representing the ticker
    currentPrice;
    radius; // number of prices to check up and down, multiplied by intervalStep
    intervalStep; // size between each strike price
    lo30s;
    hi30s;
    lo1m;
    hi1m;
    lo5m;
    hi5m;
    lo1h;
    hi1h;
    loDay;
    hiDay;

    Price = [];
    GreekByStrike;
    QuoteByStrike;
    TradeByStrike;
    ImpactByStrike;
    // google DataTables
    Price_table;
    Impact_table;

    constructor(tickerName, intervalStep, radius = 10) {
        this.symbol = tickerName;
        this.intervalStep = intervalStep;
        this.radius = radius;
    }
}


// Spy stored data
var currentSpyPrice = 0;
var rangePrice = 0; // used whenever calculating range of UI, subscription to websocket, API etc.
var rangeWasUpdated = false;
var SPY_low = 9999;
var SPY_high = 0;
const radius = 5;

// Contain Delta for each strike, from RESTFUL api 
let GreekByStrikeSPY;


////////////////////////////////////////////////
// data
////////////////////////////////////////////////

// simple array of SPY price
var PriceSPY = [];
// google data table
var PriceSPY_table;
// Contain Quotes for each strike
var QuoteByStrikeSPY;
// Contain Trades for each strike - may not need since this is directly where the indicator data comes from
var TradeByStrikeSPY;
// Contain bar graph data for each strike
// same as tradeByStrike, but cumulative
var ImpactByStrikeSPY;
// google data table for bars visualization
var ImpactByStrikeSPY_table;
// Same as impactByStrike, but cumulated into just puts, calls, both.
var ImpactSPY;
// google data table
var ImpactSPY_table;


// stores simple 2 dimensional prices for easier access
class PriceDataPoint {
    constructor(timeStamp, price) {
        this.timeStamp = timeStamp;
        this.price = price;
    }
}

// data from api. Stored for EACH strike price, C/P
class GreekDataPoint {
    constructor(timeStamp, delta, gamma) {
        this.timeStamp = timeStamp;
        this.delta = delta;
        this.gamma = gamma;
    }
}

// from websocket. Stored for EACH strike price, C/P
class TradeDataPoint {
    constructor(timeStamp, price, size) {
        this.timeStamp = timeStamp;
        this.price = price;
        this.size = size;
    }
}

// from websocket. Stored for EACH strike price, C/P
class QuoteDataPoint {
    constructor(timeStamp, bidPrice, askPrice) {
        this.timeStamp = timeStamp;
        this.bidPrice = bidPrice;
        this.askPrice = askPrice;
    }

    UpdateEntry(timeStamp, bidPrice, askPrice) {
    }

}

class ImpactDataPoint {
    constructor(timeStamp, eta) {
        this.timeStamp = timeStamp;
        this.eta = eta;
    }
}

// each element in array is an array of strike prices.
class ArrayByStrike {
    putStrikes = new Array(600);
    callStrikes = new Array(600);
    constructor(googleDataTable = null) {
        // each element in array denotes a single strike price.
        // zero-indexed everywhere. no need to convert ever
        //this.putStrikes.forEach(item => item = []);
        //this.callStrikes.forEach(item => item = []);
        this.linkedTable = googleDataTable;
    }

    getLast(pc) {
        if (pc == 'P') return this.putStrikes;
        if (pc == 'C') return this.callStrikes;
    }

}

class ImpactBarData {
    puts = new Array(600);
    calls = new Array(600);
    constructor(googleDataTable) {
        // each element in array denotes a single strike price.
        // zero-indexed everywhere. no need to convert ever
        //this.puts.forEach(item => item = 0);
        this.puts.fill(0);
        this.calls.fill(0);
        //this.calls.forEach(item => item = 0);
        this.linkedTable = googleDataTable;
    }

    updateBarLinkedData(strike, index, value) {

        // Randomly generaste data:
        //let strike = (Math.floor(Math.random() * 600));
        //let value = (Math.floor(Math.random() * 1000) - 500); // positive or negative
        //let putOrCall = (Math.floor(Math.random() * 2) + 1); // return 1 or 2
        //console.log(`${strike} ${value} ${putOrCall}`);

        this.linkedTable.setValue(strike, index, value) // sets value of 

    }

    setEta(pc, strike, eta) {
        let etaArray;
        let callOrPutIndex;

        switch (pc) {
            case 'P':
                etaArray = this.puts
                callOrPutIndex = 2;
                break;
            case 'C':
                etaArray = this.calls
                callOrPutIndex = 1;
                break;
            default:
        }

        // update current Array
        // add last value of Eta to current Eta
        let newEta = etaArray[strike] + eta;

        // If NaN, exit before setting values
        // This should never be hit
        if (isNaN(newEta)) {
            console.log("etaArray:" + etaArray.map(i => i).join(',\n'));
            console.log(`ImpactBarData.setEta() | Trying to add data that is Not a Number. eta: ${eta} etaArray: ${etaArray[strike]}`);
            console.warn("SpyGlass Warning | ImpactBarData.setEta | Parameter is not a number!");
            return;
        }

        // add a new data point
        etaArray[strike] = newEta;

        // set Bar Data in google table
        this.updateBarLinkedData(strike, callOrPutIndex, newEta);
    }

    getArray(pc) {
        if (pc == 'P') return this.puts;
        if (pc == 'C') return this.calls;
    }

}

// more complicated because it has puts, calls, both, and links and updates corresponding google DataTable
class ImpactGraphData {
    constructor(googleDataTable) {
        // greek letter H is Eta
        this.linkedTable = googleDataTable;
        this.calls = [new ImpactDataPoint(Date.now(), 0)]; // new array with first value 0
        this.puts = [new ImpactDataPoint(Date.now(), 0)];
        this.both = [new ImpactDataPoint(Date.now(), 0)];
    }

    AddRowToLinkedTable(timeStamp, bothEta) {
        this.linkedTable.addRow(
            [new Date(timeStamp),
                0,
                bothEta,
            this.calls[this.calls.length - 1].eta,
            this.puts[this.puts.length - 1].eta,
            ]
        )
    }

    setEta(pc, timeStamp, eta) {
        let etaArray;

        switch (pc) {
            case 'C':
                etaArray = this.calls;
                break;
            case 'P':
                etaArray = this.puts;
                break;
            default:
        }

        // update current Array
        // add last value of Eta to current Eta
        let newEta = etaArray[etaArray.length - 1].eta + eta;

        // If NaN, exit before setting values
        // This should never be hit
        if (isNaN(newEta)) {
            console.log("ImpactGraphData.setEta() | Trying to add data that is Not a Number:", newEta);
            console.error("SpyGlass Error: Parameter is not a number!");
            return;
        }

        // add a new data point
        etaArray.push(new ImpactDataPoint(timeStamp, newEta));

        // update 'Both' Array as well:
        // add last value of Eta to current Eta
        let bothEta = this.both[this.both.length - 1].eta + eta;
        // add a new data point
        this.both.push(new ImpactDataPoint(timeStamp, bothEta));

        // set Row in google table
        this.AddRowToLinkedTable(timeStamp, bothEta);
    }

    // receiving bothEta because it was already calculated. One value was calculated, but would need to determine which one it was by adding additional fields in setEta . didn't want to

} // END ImpactGraphData


function InitializeDataTables() {
    PriceSPY_table = new google.visualization.DataTable();
    PriceSPY_table.addColumn('datetime', 'timeStamp');
    PriceSPY_table.addColumn('number', 'Price');

    // dummy rows. supposed to add with API call
    // PriceSPY_table.addRow([new Date(2023, 2, 22, 13, 8, 6, 100),405.4]);

    // for BARS
    ImpactByStrikeSPY_table = new google.visualization.DataTable();
    ImpactByStrikeSPY_table.addColumn('string', 'Strike'); // must be of type string or it breaks. but needs to be 'number' for DyGraph if we use it for that
    ImpactByStrikeSPY_table.addColumn('number', 'Call');
    ImpactByStrikeSPY_table.addColumn('number', 'Put');

    let strikePrices = 600; // will have to set this in ticker class eventually
    let intervalStep = 1; // different for SPX
    for (let i = 0; i < strikePrices; i += intervalStep) {
        ImpactByStrikeSPY_table.addRow(
            [i.toString(), 0, 0] // was i.toString() for google chart format
        );
    }
    //ImpactByStrikeSPY_table.addRows(600);

    GreekByStrikeSPY = new ArrayByStrike();
    GreekByStrikeSPXW = new ArrayByStrike();
    QuoteByStrikeSPY = new ArrayByStrike();
    QuoteByStrikeSPXW = new ArrayByStrike();
    TradeByStrikeSPY = new ArrayByStrike();
    TradeByStrikeSPXW = new ArrayByStrike();
    ImpactByStrikeSPY = new ImpactBarData(ImpactByStrikeSPY_table);
    ImpactByStrikeSPXW = new ArrayByStrike();



    ImpactSPY_table = new google.visualization.DataTable();
    ImpactSPY_table.addColumn('datetime', 'timeStamp'); // datetime is different from date
    ImpactSPY_table.addColumn('number', 'zeroLine');
    ImpactSPY_table.addColumn('number', 'both');
    ImpactSPY_table.addColumn('number', 'call');
    ImpactSPY_table.addColumn('number', 'put');
    ImpactSPY_table.addRow([new Date(Date.now()), 0, 0, 0, 0]); // need preliminary row

    ImpactSPY = new ImpactGraphData(ImpactSPY_table);

    console.log("DataTables initialized successfully");
} // DONE initializeData tables

function UpdateRange() {
    //console.log("updateRange()");
    // update range first time, as soon as a price is gotten.
    // after that, called by controllerUpdate()

    let intervalStep = 1;
    if (Math.abs(currentSpyPrice - rangePrice) > intervalStep) {
        rangeWasUpdated = true;
        console.log("updateRange() needs to update");

        // update range
        rangePrice = Math.round(currentSpyPrice);

        console.log("updateRange() Updating subscriptions");
        //update Subscriptions
        // subscribe first

        //REMOVE
        SubScribeToTicker("SPY");


    }

}


/// contract = 'P' or 'C'
// symbol will be input later when this is part of containing class. 
function CalculateImpact(tradeTimeStamp, contract, strike, symbol) {

    /*let tradeTimeStamp = Date.now();*/ // may need to make this Trade timeStamp instead
    var directionMultiplier = 1;
    const greeksMaxTimePassed = 10000;
    const quoteMaxTimePassed = 5000;



    // QUOTE
    // if time is recent within 2 seconds, use quote bidPrice, askPrice
    let quote = QuoteByStrikeSPY.getLast(contract)[strike];
    if (typeof quote === "undefined") {
        ConsoleTradesCache += ` | undefined quote \n`;
        return; //no quote stored
    }
    // QUOTE TIME CHECK
    let quoteAgeMs = tradeTimeStamp - quote.timeStamp;
    //if (quote.timeStamp < tradeTimeStamp - quoteMaxTimePassed) {
    if (quoteAgeMs > quoteMaxTimePassed) {
        ConsoleTradesCache += ` | outdated quote. ${quoteAgeMs / 1000} sec \n`;
        //console.warn(`CalculateImpact() | skipping outdated QUOTE data. contract:  ${contract}${strike} age: ${quote.timeStamp - tradeTimeStamp} ms`);
        //console.log("QUOTE: ", quote);
        //console.log("Trade size:", TradeByStrikeSPY.getLast(contract)[strike].size);
        return; // data is too old, useless
    };

    // TRADE
    let trade = TradeByStrikeSPY.getLast(contract)[strike];
    if (typeof trade === "undefined") {
        ConsoleTradesCache += ` | undefined trade \n`;
        return; //no quote stored
    }
    // look at price and size

    // look at greeks for delta = ?
    let greeks = GreekByStrikeSPY.getLast(contract)[strike];
    if (typeof greeks === "undefined") {
        ConsoleTradesCache += ` | undefined greeks \n`;
        return; //no quote stored
    }
    // GREEK TIME CHECK
    if (greeks.timeStamp < tradeTimeStamp - greeksMaxTimePassed) {
        console.warn(`CalculateImpact() | skipping outdated GREEKS data. contract:  ${contract}${strike} age: ${greeks.timeStamp - tradeTimeStamp} ms`);
        ConsoleTradesCache += ` | outdated greeks \n`;
        return; // data is too old, useless
    };

    // DIRECTION of MARKET
    if ((contract == 'P' && trade.price <= quote.bidPrice)
        || (contract == 'C' && trade.price >= quote.askPrice)) {
        //directionMultiplier = 1; // already set above
    } else if ((contract == 'P' && trade.price >= quote.askPrice)
        || (contract == 'C' && trade.price <= quote.bidPrice)) {
        directionMultiplier = -1;
    } else {

        ConsoleTradesCache += ` | no impact on market, skipped \n`;
        return;
    }







    // All variables available.
    // definitely do calculation:
    let eta = trade.size * Math.abs(greeks.delta) * 100 * directionMultiplier;

    // If NaN, exit before setting values
    if (isNaN(eta)) {

        ConsoleTradesCache += ` | isNaN(eta), skipped \n`;
        console.log("CalculateImpact() | Calculated that is Not a Number:", eta);
        // throw new Error("Parameter is not a number!"); //throw pauses program, not needed
        console.error(`SpyGlass Error: Parameter is not a number! eta: ${eta} size: ${trade.size} delta: ${delta} dm: ${directionMultiplier}`);
        return;
    }

    // add HedgeImpact to ImpactByStrike Table for Bar charts for each strike and  contract type

    // Add Eta to my data table
    // add HedgeImpact to graph data over time for 3 given contract type
    // and update the 'both' line
    // ImpactSpy updates a linked google Chart
    ConsoleTradesCache += ` | recording \n`;
    ImpactSPY.setEta(contract, tradeTimeStamp, eta);
    ImpactByStrikeSPY.setEta(contract, strike, eta);


}

function RecordCurrentSpyPrice(symbol, timeStamp, price) {

    if (PriceSPY[PriceSPY.length - 1] >= timeStamp) {
        // trying to record an entry dated before last one.
        // makes for an ugly ui.
        return;
    }
    PriceSPY.push(new PriceDataPoint(timeStamp, price));
    PriceSPY_table.addRow([new Date(timeStamp), price]);


    //console.log(`FIrst recording Price: top and bottom: ${SPY_high} : ${SPY_low} price: ${price}`);

    // update Spy 
    currentSpyPrice = price;
    SPY_high = Math.max(SPY_high, price);
    SPY_low = Math.min(SPY_low, price);



} // DONE RecordcurrentSpyPrice()

////////////////////////////////////////////////
// Dummy Data Populating:
////////////////////////////////////////////////


// PriceSPY.push( PriceDataPoint(1676857389507, 405.1) );
// PriceSPY.push( PriceDataPoint(1676857390507, 404.8) );
// PriceSPY.push( PriceDataPoint(1676857391507, 405.5) );



// QuoteByStrikeSPY.putStrikes[405].push(new QuoteDataPoint(1676857389506, 404, 406));
// TradeByStrikeSPY.putStrikes[405].push(new TradeDataPoint(1676857389507, 0.5, 50));
// QuoteByStrikeSPY.putStrikes[405].push(new QuoteDataPoint(1676857390506, 404, 406));
// TradeByStrikeSPY.putStrikes[405].push(new TradeDataPoint(1676857390507, 0.5, 1));
// QuoteByStrikeSPY.putStrikes[405].push(new QuoteDataPoint(1676857391506, 404, 406));
// TradeByStrikeSPY.putStrikes[405].push(new TradeDataPoint(1676857391507, 0.5, 100));
