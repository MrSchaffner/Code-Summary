
//// may need this for speed: https://developers.google.com/chart/interactive/docs/datatables_dataviews#javascriptliteral
//alert("model init");

var activeTicker;
var SPY;
var SPX;
var allTickers;

var dataTablesInitialized = false; // seems like sloppy code regarding this. Refactor.


function GetTicker(sym) {
    switch (sym.toUpperCase()) {
        case "SPY":
            return this.SPY;
            break
        case "SPXW":
        case "SPX":
        case "^GSPC":
            return this.SPX;
            break
        default:
            console.error("bad symbol - not found");
    }
}

class TickerViewModel { // simpler than what is needed on server

    sym;
    priceLoaded = false;
    impactBarsLoaded = false;
    impactGraphLoaded = false;
    vibeBarsLoaded = false;
    vibeGraphLoaded = false;
    // ticker specific data
    currentPrice;
    rangePrice = 0;
    rangePriceIndex = 0; //the index of the rangePrice can be different, because not all arrays start at 0. SPX started at 2500
    intervalStep;
    rangeWasUpdated = true;
    barsDisplayRadius;
    tickerRollerPeriod;
    //DATA arrays for visualizer
    price_array;
    impact_array;
    impactBars_Table; // for google display bars
    //impactBars_array; // to hold bars data for easier manipulation NOT USED
    vibe_array;
    vibeBars_Table; // for google display VIBE bars

    constructor(options) {
        console.log(`tickerViewModel constructor() ${options.sym}`);

        this.sym = options.sym;
        this.intervalStep = options.intervalStep;
        this.barsDisplayRadius = options.barsDisplayRadius;

        this.tickerRollerPeriod = options.tickerRollerPeriod;

        //BARS
        this.impactBars_Table = new google.visualization.DataTable();
        this.impactBars_Table.addColumn('string', 'ETA | Positive = Bullish, Negative = Bearish'); // must be of type string or it breaks. but needs to be 'number' for DyGraph if we use it for that. If string is empty, materialChart removes entirely
        this.impactBars_Table.addColumn('number', 'Call');
        this.impactBars_Table.addColumn('number', 'Put');
        //this.impactBars_Table.addRow(["400", 0, 0]);
        //PRICE GRAPH
        this.price_array = [[0, 0]];

        //IMPACT GRAPH
        this.impact_array = [[Date.now(), 0, 0, 0, 0]];

        //VIBE BARS
        this.vibeBars_Table = new google.visualization.DataTable();
        this.vibeBars_Table.addColumn('string', 'VIBE | Positive = Options Bought, Negative = Options Sold'); // must be of type string or it breaks. but needs to be 'number' for DyGraph if we use it for that. If string is empty, materialChart removes entirely
        this.vibeBars_Table.addColumn('number', 'Call');
        this.vibeBars_Table.addColumn('number', 'Put');
        //this.impactBars_Table.addRow(["400", 0, 0]);

        //VIBE GRAPH
        this.vibe_array = [[Date.now(), 0, 0, 0, 0]];


        //alert("thru constr");
    }



    SetCurrentPrice(dataInt) { 
        this.currentPrice = dataInt;
        if (Math.abs(
            Math.round(this.currentPrice) - this.rangePrice
        ) > this.intervalStep) {
            this.rangePrice = Math.round(this.currentPrice);
        }
    }

    // initializer methods

    InitializePrice(data) {
        this.price_array = data;
        this.SetCurrentPrice(data[data.length - 1][1]);
        this.priceLoaded = true;
    }

    InitializeImpactGraphWith(dataArray) {
        this.impact_array = dataArray;

        this.impactGraphLoaded = true;
    }



    InitializeBarsWith(dataArray) { // NOTE - need to call this method above to clean up repeated code

        // Empty the google dataTable

        this.impactBars_Table = new google.visualization.DataTable();
        this.impactBars_Table.addColumn('string', 'ETA | Positive = Bullish, Negative = Bearish'); // must be of type string or it breaks. but needs to be 'number' for DyGraph if we use it for that. If string is empty, materialChart removes entirely
        this.impactBars_Table.addColumn('number', 'Call');
        this.impactBars_Table.addColumn('number', 'Put');

        for (let i = 0; i < dataArray.length; i++) {
            this.impactBars_Table.addRow([
                dataArray[i][0].toString(), // strike indexed on server, stringified here
                dataArray[i][1], // call
                dataArray[i][2] // put
            ]);
        }

        this.impactBarsLoaded = true;
    }

    InitializeVibeGraphWith(dataArray) {

        this.vibe_array = dataArray;

        this.vibeGraphLoaded = true;
    }



    InitializeVibeBarsWith(dataArray) { // NOTE - need to call this method in constructor to clean up repeated code

        // Empty the google dataTable

        this.vibeBars_Table = new google.visualization.DataTable();
        this.vibeBars_Table.addColumn('string', 'VIBE | Positive = Options Bought, Negative = Options Sold'); // must be of type string or it breaks. but needs to be 'number' for DyGraph if we use it for that. If string is empty, materialChart removes entirely
        this.vibeBars_Table.addColumn('number', 'Call');
        this.vibeBars_Table.addColumn('number', 'Put');

        console.log("initialize vibeBars dataArray: "/*, dataArray*/);

        for (let i = 0; i < dataArray.length; i++) {
            this.vibeBars_Table.addRow([
                dataArray[i][0].toString(), // strike indexed on server, stringified here
                dataArray[i][1], // call
                dataArray[i][2] // put
            ]);
        }

        this.vibeBarsLoaded = true;
    }


} // class TickerTable



let dataTablesPopulated = function () {
    console.log("checking if model is populated");
    let areDataTablesPopulated = true;
    ////DIAGNOSTIC mode sss

    //allTickers.forEach(
    //    (ticker) => {
    //        if (!ticker.priceLoaded) {
    //            console.log(`${ticker.priceLoaded} ${ticker.impactGraphLoaded}  ${ticker.impactBarsLoaded}`);
    //            return false;
    //        }
    //    }
    //)

    //return true;


    // normal
    allTickers.forEach(
        (ticker) => {
            if (!ticker.priceLoaded || !ticker.impactBarsLoaded || !ticker.impactGraphLoaded || !ticker.vibeBarsLoaded || !ticker.vibeGraphLoaded) {
                //console.log(`${ticker.sym} populated? price:  ${ticker.priceLoaded} graph: ${ticker.impactGraphLoaded} bars: ${ticker.impactBarsLoaded}`);
                areDataTablesPopulated = false;
            }
        }
    )
    return areDataTablesPopulated;
}



// can't be called until after google is ready. Let google charts method call it'
function InitializeDataTables() {
    console.log("initialized Data tables from viewModel");
    SPY = new TickerViewModel({
        sym: "SPY",
        intervalStep: 1,
        barsDisplayRadius: 5,
        tickerRollerPeriod: 10
    });
    //SPX = new TickerViewModel({
    //    sym: "SPX",
    //    intervalStep: 5,
    //    barsDisplayRadius: 10,
    //    tickerRollerPeriod: 10 // adds smoothing to bad data
    //});
    allTickers = [
        SPY,
       // SPX
    ];
    activeTicker = SPY;
    dataTablesInitialized = true;
}



function convert2DArrayToGoogleDataTable(arr) {
    console.log("converting array!");
    // should only have to run on refresh
    let dataTable = new google.visualization.DataTable();
    dataTable.addColumn('string', 'Strike'); // must be of type string or it breaks. but needs to be 'number' for DyGraph if we use it for that
    dataTable.addColumn('number', 'Call');
    dataTable.addColumn('number', 'Put');
    // only need this because of the string input.

    for (let i = 0; i < arr.length; i++) {
        let thisRow = arr[i];
        dataTable.addRow([thisRow[0].toString(), thisRow[1], thisRow[2]]);

    }

    return dataTable;
}
