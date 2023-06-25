// Load the Visualization API and the controls package.
// Packages for all the other charts you need will be loaded
// automatically by the system.
function googleAwake() {
    console.log("googleAwake()");
    //google.charts.load('current', {'packages':['corechart']});
    google.charts.load('current', {
        'packages': ['corechart', 'line', 'controls', 'bar', 'table']
        //,callback: function () {
        //    InitializeAll();
        //}
    });
    // Set a callback to run when the Google Visualization API is loaded.
    google.charts.setOnLoadCallback(InitializeView);
}


function InitializeView() { // after google.charts has loaded
    console.log("Charts InitializeAll()");
    //ConnectButtons();
    InitializeDataTables(); // in model
    console.log(" extreme logger about to initialize all charts");

    InitializeAllCharts(); // components that correspond to model
    googleReady = true;
}

var leftTicker;
var rightTicker;

function UpdateAllCharts() {
    leftTicker.UpdateChart();
    rightTicker.UpdateChart();
}

function InitializeAllCharts() {
    leftTicker = new TickerLive({
        tickerColor: myColor.price,
        connectedTicker: SPY,
        divSuffixString: "_left"
    });

    //rightTicker = new TickerLive({
    //    tickerColor: myColor.price2,
    //    connectedTicker: SPX,
    //    divSuffixString: "_right" // used to differentiate divs
    //});

    console.log(" extreme logger successfully initialized all charts");

}

// color variables
var myColor = {
    zero1: '#fff', // white
    both1: '#4d9de0', // celestial blue
    calls1: '#f2e863', // maize yellow
    puts1: '#e33b57', // amaranth
    zero: '#fff', // white
    both: '#2DE1FC', // electric blue
    calls: '#FFEF00', // canary yellow
    puts: '#EE2677', // rose
    price: '#FF7F11', //orange
    price2: '#2AFC98' // spring green
}

function toDateTime(millisecs) {
    var t = new Date(millisecs);
    return t;
}

function formatDate(x) {

    var year = x.getFullYear();
    var month = x.getMonth() + 1;
    var day = x.getDate();
    var hours = String(x.getHours()).padStart(2, '0');
    var minutes = String(x.getMinutes()).padStart(2, '0');
    var seconds = String(x.getSeconds()).padStart(2, '0');

    return hours + ":" + minutes + ":" + seconds;
}

class TickerLive { // everything to do with the VISUAL for a single ticker. None of the data pertaining to a specific Ticker

    divSuffixString = "";
    tickerPrimaryColor; // visually differentiates tickers
    connectedTicker; // what to display

    AutoScroll = true; // updateChart() checks this
    UpdateChartOnce = false; // allows you to bypass AutoScroll and still update
    //var displayTimeRange = '30Sec';
    displayTimeMs = 10 * 60 * 1000; // starts at 10 mins

    constructor(options) {
        
        this.tickerPrimaryColor = options.tickerColor;
        this.connectedTicker = options.connectedTicker;
        this.divSuffixString = options.divSuffixString;

        this.InitializeCharts();
        this.tickerGraph.updateOptions({
            labels: ['Time', `${this.connectedTicker.sym} Price`],
            rollPeriod: this.connectedTicker.tickerRollerPeriod,
            colors: [this.tickerPrimaryColor]
        }); // can't set these until it's been constructed


    }


    // TICKER GRAPH ///////////////////////////////////////
    tickerGraph; // dygraph object
    tickerGraphOptions = {
        // appearance
        labels: ['Time', `Price`],
        drawPoints: true,
        drawAxesAtZero: true,
        drawPoints: false,
        legend: 'always',
        axes: {
            x: {
                //ticker: function (a, b, pixels, opts, dygraph, vals) {
                //    return Dygraph.getDateAxis(a, b, Dygraph.DECADAL, opts, dygraph);
                //},
                // format legend Time
                drawAxis: false,

                // for proper date rendering:
                valueFormatter: function (val, opts, series_name, dygraph) {
                    //  debugger;
                    return formatDate(toDateTime(val));
                },
                // format xAxis time
                axisLabelFormatter: function (val, granularity, opts, dygraph) {
                    //debugger;
                    return formatDate(toDateTime(val));
                }
            },
            y: {
                labelsKMB: false // display K for thousands
                }
        },
        //valueRange: [0.0, 1.2],
        // features
        //showRoller: true, // for range selector input 
        animatedZooms: true,
        panEdgeFraction: 0.0 // dont allow panning past edge
        //annotationMouseOverHandler: function (ann, point, dg, event) {
        //    document.getElementById(nameAnnotation(ann)).style.fontWeight = 'bold';
        //    saveBg = ann.div.style.backgroundColor;
        //    ann.div.style.backgroundColor = '#ddd';
        //},
        //annotationMouseOutHandler: function (ann, point, dg, event) {
        //    document.getElementById(nameAnnotation(ann)).style.fontWeight = 'normal';
        //    ann.div.style.backgroundColor = saveBg;
        //},
    }// dygraph options
    tickerGraphReady = false;

    updateTickerDyGraphData() {
        //console.error(`${this.connectedTicker.sym} period: ${this.connectedTicker.tickerRollerPeriod}`);

        this.tickerGraph.updateOptions({
            'file': this.connectedTicker.price_array
        });
    }

    updateTickerDyGraphOptions() {
        //// center current price, not rangePrice
        //let space = Math.max(SPY_high - currentSpyPrice, currentSpyPrice - SPY_low) * 1.25;
        //graphBottom = currentSpyPrice - space;//SPY_low - ((SPY_high - SPY_low)*.25);
        //graphTop = currentSpyPrice + space;//SPY_high + ((SPY_high - SPY_low)*.25);

        // set left and right to time range
        let graphLeft = new Date(getDisplayTimeRangeInt(this.displayTimeMs)); // google charts require Date Object
        let graphRight = new Date(Date.now() + 1500);

        this.tickerGraph.updateOptions({
            dateWindow: [graphLeft, graphRight]
            //valueRange: [graphBottom, graphTop]
        });
    }


    // ETA GRAPH ///////////////////////////////////////

    impactGraph;
    impactGraphOptions = {
        //appearance
        labels: ['Time', 'ZeroLine', 'Both', 'Calls', 'Puts'],
        drawPoints: false,
        drawAxesAtZero: true,
        colors: [myColor.zero, myColor.both, myColor.calls, myColor.puts],
        legend: 'always',
        axes: {
            x: {
                //ticker: function (a, b, pixels, opts, dygraph, vals) {
                //    return Dygraph.getDateAxis(a, b, Dygraph.DECADAL, opts, dygraph);
                //},
                // format legend Time
                valueFormatter: function (val, opts, series_name, dygraph) {
                    //  debugger;
                    return formatDate(toDateTime(val));
                },
                // format xAxis time
                axisLabelFormatter: function (val, granularity, opts, dygraph) {
                    //debugger;
                    return formatDate(toDateTime(val));
                }
            },
            y: {
                labelsKMB: true // display K for thousands

                }
        },
        //valueRange: [0.0, 1.2],
        // features
        animatedZooms: true,
        //showRoller: true, // range selector
        panEdgeFraction: 0.0 // dont allow panning past edge
    }// dygraph options

    updateImpactDyGraphData() { // if you update this independently of other optioons, you can have it update while moving, i believe

        this.impactGraph.updateOptions({ 'file': this.connectedTicker.impact_array });
    }

    updateImpactDyGraphOptions() {
        //// center current price, not rangePrice
        //let space = Math.max(SPY_high - currentSpyPrice, currentSpyPrice - SPY_low) * 1.25;
        //graphBottom = currentSpyPrice - space;//SPY_low - ((SPY_high - SPY_low)*.25);
        //graphTop = currentSpyPrice + space;//SPY_high + ((SPY_high - SPY_low)*.25);

        // set left and right to time range
        let graphLeft = new Date(getDisplayTimeRangeInt(this.displayTimeMs)); // google charts require Date Object
        let graphRight = new Date(Date.now() + 1500);

        this.impactGraph.updateOptions({ // dygraph method
            dateWindow: [graphLeft, graphRight]
            //valueRange: [graphBottom, graphTop]
        });
    }

    // ETA BARS ///////////////////////////////////////

    impactBars;
    impactBarsOptions;
    impactBarsReady = false;

    updateImpactBarsOptions() {

        const ticker = this.connectedTicker;

        if (!ticker.rangeWasUpdated) return; // no need to update these options

        // also update Vibe Bars
        this.updateVibeBarsOptions();

        ticker.rangeWasUpdated = false;
        // set left and right to time range
        let graphLeft = parseInt(ticker.rangePriceIndex) - ticker.barsDisplayRadius;
        let graphRight = parseInt(ticker.rangePriceIndex) + ticker.barsDisplayRadius; 

        //console.log(`updating range on chart ${this.connectedTicker.sym} left: ${graphLeft} right: ${graphRight}`);

        this.impactBarsOptions = {
            //legend: { position: 'top' },
            backgroundColor: 'transparent',
            series: {
                0: { color: myColor.calls },
                1: { color: myColor.puts }
            },
            // https://github.com/google/google-visualization-issues/issues/1964
            legend: { position: 'none' },
            chartArea: { backgroundColor: 'transparent' },
            chart: {
                //title: 'Current Eta',
                //subtitle: 'Organized by Strike',
            },
            bars: 'vertical', // Required for Material Bar Charts.
            legendTextStyle: { color: '#FFF' },
            titleTextStyle: { color: '#FFF' },
            hAxis: {
                showTextEvery: 1,
                textPosition: 'none',
                textStyle: {
                    fontSize: 10 ,// or the number you want
                    color: '#FFF'
                },
                gridlines: { count: 10, color: '#555' },
                viewWindow: {
                    min: graphLeft,
                    max: graphRight
                }
            },
            vAxis: {
                textStyle: {
                    fontSize: 10,// or the number you want
                    color: '#FFF'
                },
                gridlines: { count: 5, color: '#555' },
                //viewWindow: {
                // min: graphBottom,
                // max: graphTop
                //}
            }
        };
    }

    // VIBE CLONED METHODS /////////////////////////////////

    // VIBE GRAPH ///////////////////////////////////////

    vibeGraph;
    vibeGraphOptions = {
        //appearance
        labels: ['Time', 'ZeroLine', 'Both', 'Calls', 'Puts'],
        drawPoints: false,
        drawAxesAtZero: true,
        colors: [myColor.zero, myColor.both, myColor.calls, myColor.puts],
        legend: 'always',
        axes: {
            x: {
                //ticker: function (a, b, pixels, opts, dygraph, vals) {
                //    return Dygraph.getDateAxis(a, b, Dygraph.DECADAL, opts, dygraph);
                //},
                // format legend Time
                valueFormatter: function (val, opts, series_name, dygraph) {
                    //  debugger;
                    return formatDate(toDateTime(val));
                },
                // format xAxis time
                axisLabelFormatter: function (val, granularity, opts, dygraph) {
                    //debugger;
                    return formatDate(toDateTime(val));
                }
            },
            y: {
                labelsKMB: true // display K for thousands

            }
        },
        //valueRange: [0.0, 1.2],
        // features
        animatedZooms: true,
        //showRoller: true, // range selector
        panEdgeFraction: 0.0 // dont allow panning past edge
    }// dygraph options

    updateVibeDyGraphData() { // if you update this independently of other optioons, you can have it update while moving, i believe

        //console.log(`viewChart updating vibeGraph with file data`);

        //this.vibeGraph.updateOptions({ 'file': this.connectedTicker.impact_array });
        this.vibeGraph.updateOptions({ 'file': this.connectedTicker.vibe_array });

      //  console.log(`viewChart updated vibeGraph with file data`);


    }

    updateVibeDyGraphOptions() {
        //// center current price, not rangePrice
        //let space = Math.max(SPY_high - currentSpyPrice, currentSpyPrice - SPY_low) * 1.25;
        //graphBottom = currentSpyPrice - space;//SPY_low - ((SPY_high - SPY_low)*.25);
        //graphTop = currentSpyPrice + space;//SPY_high + ((SPY_high - SPY_low)*.25);

        // set left and right to time range
        let graphLeft = new Date(getDisplayTimeRangeInt(this.displayTimeMs)); // google charts require Date Object
        let graphRight = new Date(Date.now() + 1500);

        this.vibeGraph.updateOptions({ // dygraph method
            dateWindow: [graphLeft, graphRight]
            //valueRange: [graphBottom, graphTop]
        });
    }

    // VIBE BARS ///////////////////////////////////////

    vibeBars;
    vibeBarsOptions;
    vibeBarsReady = false;

    updateVibeBarsOptions() {

        const ticker = this.connectedTicker;

        // set left and right to time range
        let graphLeft = parseInt(ticker.rangePriceIndex) - ticker.barsDisplayRadius;
        let graphRight = parseInt(ticker.rangePriceIndex) + ticker.barsDisplayRadius;

        //console.log(`updating range on chart ${this.connectedTicker.sym} left: ${graphLeft} right: ${graphRight}`);

        this.vibeBarsOptions = { // google options
            //legend: { position: 'top' },
            backgroundColor: 'transparent',
            series: {
                0: { color: myColor.calls },
                1: { color: myColor.puts }
            },
            // https://github.com/google/google-visualization-issues/issues/1964
            legend: { position: 'none' },
            chartArea: { backgroundColor: 'transparent' },
            chart: {
                //title: 'Current Eta',
                //subtitle: 'Organized by Strike',
            },
            bars: 'vertical', // Required for Material Bar Charts.
            legendTextStyle: { color: '#FFF' },
            titleTextStyle: { color: '#FFF' },
            hAxis: {
                showTextEvery: 1,
                textPosition: 'none',
                textStyle: {
                    fontSize: 10,// or the number you want
                    color: '#FFF'
                },
                gridlines: { count: 10, color: '#555' },
                viewWindow: {
                    min: graphLeft,
                    max: graphRight
                }
            },
            vAxis: {
                textStyle: {
                    fontSize: 10,// or the number you want
                    color: '#FFF'
                },
                gridlines: { count: 5, color: '#555' },
                //viewWindow: {
                // min: graphBottom,
                // max: graphTop
                //}
            }
        };
    }

    // END OF VIBE

    // GENERAL CHART METHODS ///////////////////////////////////

    InitializeCharts() {

        console.log(`extreme logger started initialize ${this.connectedTicker.sym} charts`);


        var dashboard = new google.visualization.Dashboard(document.getElementById('dashboard_div'));
        //console.log("ticka: ", this.connectedTicker);

        Dygraph.onDOMready(
            function onDOMready() {
                //console.log("ticka: ", this.connectedTicker);


                /////////////////////////////////////////////////////
                //price ticker DY GRAPH
                this.tickerGraph = new Dygraph(

                    document.getElementById("ticker_dygraph" + this.divSuffixString),
                    this.connectedTicker.price_array, // "http://localhost:5000/data_files/test1.csv", //csv path
                    this.tickerGraphOptions


                );

                /////////////////////////////////////////////////////
                //HEDGE IMPACT DY GRAPH

                this.impactGraph = new Dygraph(

                    // containing div
                    document.getElementById("impact_dygraph" + this.divSuffixString),
                    this.connectedTicker.impact_array,//"http://localhost:5000/data_files/test1.csv", //csv path
                    this.impactGraphOptions
                    // CSV or path to a CSV file.
                    //"Date,Temperature\n" +
                    //"2008-05-07,75\n" +
                    //"2008-05-08,70\n" +
                    //"2008-05-09,80\n"

                );

                /////////////////////////////////////////////////////
                // VIBE DY GRAPH

                console.log(" extreme logger creating vibeGraph with " + this.connectedTicker.vibe_array);


                this.vibeGraph = new Dygraph(

                    // containing div
                    document.getElementById("vibe_dygraph" + this.divSuffixString),
                    this.connectedTicker.vibe_array,//"http://localhost:5000/data_files/test1.csv", //csv path
                    this.vibeGraphOptions
                    // CSV or path to a CSV file.
                    //"Date,Temperature\n" +
                    //"2008-05-07,75\n" +
                    //"2008-05-08,70\n" +
                    //"2008-05-09,80\n"

                );

                console.log(" extreme logger created vibeGraph");


                /////////////////////////////////////////////////////
                //HEDGE IMPACT DY BARS
                // not sure if this exists. 
                //impactBars = new Dygraph(
                //    document.getElementById("impact_dybars"),
                //    "X,Bar1,Bar2,Bar3\n" +
                //    "1,10,11,12\n" +
                //    "2,7,17,5\n" +
                //    "3,6,23,12\n" +
                //    "4,4,27,10\n" +
                //    "5,3,30,23\n" +
                //    "6,2,32,5\n" +
                //    "7,1,33,17\n",
                //    {
                //        // options go here. See http://dygraphs.com/options.html
                //        legend: 'always',
                //        animatedZooms: true,
                //        //plotter: "multiColumnBarPlotter",
                //        colors: ["#00A0B0", "#6A4A3C", "#CC333F",],
                //        dateWindow: [0, 8]
                //    }
                //);

            }.bind(this) // need to bind to use .this inside
        );

        /////////////////////////////////////////////////////
        //HEDGE IMPACT BARS
        this.impactBars = new google.charts.Bar(document.getElementById('impact_bars' + this.divSuffixString));

        // add listeners to avoid double drawing. 
        google.visualization.events.addListener(this.impactBars, "ready", () => { this.impactBarsReady = true; });
        google.visualization.events.addListener(this.impactBars, "error", (e) => { console.error(e); });
        this.impactBarsReady = true;

        /////////////////////////////////////////////////////
        //VIBE BARS
        this.vibeBars = new google.charts.Bar(document.getElementById('vibe_bars' + this.divSuffixString));

        // add listeners to avoid double drawing. 
        google.visualization.events.addListener(this.vibeBars, "ready", () => { this.vibeBarsReady = true; });
        google.visualization.events.addListener(this.vibeBars, "error", (e) => { console.error(e); });
        this.vibeBarsReady = true;

        this.UpdateChart();

        console.log("Charts initialized successfully");
    } // end initializedChart()

    UpdateChart = function () {

        //console.log(`price : ${this.connectedTicker.currentPrice} rangeprice : ${this.connectedTicker.rangePrice} rangepriceIndex : ${this.connectedTicker.rangePriceIndex}`);

        if (!this.AutoScroll && !this.UpdateChartOnce) return;
        this.UpdateChartOnce = false;
        // Google Charts won't update when not scrolling, because they need full Draw.

        if (/*!tickerGraphReady || !impactGraphReady || */!this.impactBarsReady || !this.vibeBarsReady) {
            console.warn("Tried to updateChart() but it wasn't ready. ready event is called by chart.draw()");
            return;
        }

        myHealthChecker.recordTimeSpentOn('d', true);

        // format table data prior to drawing
        //var timeFormatter = new google.visualization.DateFormat({ pattern: "hh:mm:ss" }); // whne hovering over points
        //timeFormatter.format(ImpactSPY_table, 0); // format(table,colIndex_of_col_to_format);
        //timeFormatter.format(PriceSPY_table, 0); // format(table,colIndex_of_col_to_format);

        // PRICE
        this.updateTickerDyGraphData(); // just the data, not the position
        //remove
        this.updateTickerDyGraphOptions(); // updates range. Data (above) can always be updated, even if autoscroll = false, but it will steal control. Need to find workaround for better functionality.

        // ETA
        this.updateImpactDyGraphData(); // just the data, not the position
        this.updateImpactDyGraphOptions(); // updates range. Data (above) can always be updated, even if autoscroll = false, but it will steal control. Need to find workaround for better functionality.


        // BARS
        this.updateImpactBarsOptions();
        this.impactBarsReady = false; // prevents double drawing
        this.impactBars.draw(this.connectedTicker.impactBars_Table, google.charts.Bar.convertOptions(this.impactBarsOptions));

        // VIBE ETA
        this.updateVibeDyGraphData(); // just the data, not the position
        this.updateVibeDyGraphOptions(); // updates range. Data (above) can always be updated, even if autoscroll = false, but it will steal control. Need to find workaround for better functionality.


        // VIBE BARS
        this.updateVibeBarsOptions();
        this.vibeBarsReady = false; // prevents double drawing
        this.vibeBars.draw(this.connectedTicker.vibeBars_Table, google.charts.Bar.convertOptions(this.vibeBarsOptions));


        // TABLE
        //updateImpactTableOptions();
        //  impactTable.draw(ImpactSPY_table, impactTableOptions);

        myHealthChecker.recordTimeSpentOn('d', false);
    } // updateChart()
}


// var data = new google.visualization.DataTable();
//       data.addColumn('number', 'Day');
//       data.addColumn('number', 'Guardians of the Galaxy');
//       data.addColumn('number', 'The Avengers');
//       data.addColumn('number', 'Transformers: Age of Extinction');

//       data.addRows([
//         [1,  37.8, 80.8, 41.8],
//         [2,  30.9, 69.5, 32.4],
//         [3,  25.4,   57, 25.7],
//         [4,  11.7, 18.8, 10.5],
//         [5,  11.9, 17.6, 10.4],
//         [6,   8.8, 13.6,  7.7],
//         [7,   7.6, 12.3,  9.6],
//         [8,  12.3, 29.2, 10.6],
//         [9,  16.9, 42.9, 14.8],
//         [10, 12.8, 30.9, 11.6],
//         [11,  5.3,  7.9,  4.7],
//         [12,  6.6,  8.4,  5.2],
//         [13,  4.8,  6.3,  3.6],
//         [14,  4.2,  6.2,  3.4]
//       ]);

//let RecordSpyPrice_Timer = setInterval(()=>{RecordcurrentSpyPrice("SPY")}, 1000);
//let UpdateChart_Timer = setInterval(UpdateChart, 1000);




// // Load the Visualization API and the controls package.
//     // Packages for all the other charts you need will be loaded
//     // automatically by the system.
//     google.charts.load('current', {'packages':['corechart', 'controls']});

//     // Set a callback to run when the Google Visualization API is loaded.
//     google.charts.setOnLoadCallback(drawDashboard);

//     function drawDashboard() {
//       console.log("DrawDashboard()");
//       // Everything is loaded. Assemble your dashboard...

//       var dashboard = new google.visualization.Dashboard(document.getElementById('dashboard_div'));

//   // Create a range slider, passing some options
//   var donutRangeSlider = new google.visualization.ControlWrapper({
//     'controlType': 'NumberRangeFilter',
//     'containerId': 'filter_div',
//     'options': {
//       'filterColumnLabel': 'Donuts eaten',
//       'ui': {'labelStacking': 'vertical'},
//       'minValue': 1,
//       'maxValue': 10
//     },
//     'state': {  //starting values
//       'minValue': 3,
//       'maxValue': 8
//     }
//   });

//   // Create a pie chart, passing some options
//   var pieChart = new google.visualization.ChartWrapper({
//     'chartType': 'PieChart',
//     'containerId': 'chart_div',
//     'options': {
//       'width': 300,
//       'height': 300,
//       'chartArea': {'left': 15, 'top': 15, 'right': 0, 'bottom': 0},
//       'pieSliceText': 'label'
//     }
//   });

//   var data = google.visualization.arrayToDataTable([
//           ['Name', 'Donuts eaten'],
//           ['Michael' , 5],
//           ['Elisa', 7],
//           ['Robert', 3],
//           ['John', 2],
//           ['Jessica', 6],
//           ['Aaron', 1],
//           ['Margareth', 8]
//         ]);

//   // Connect control to chart
//   dashboard.bind(donutRangeSlider, pieChart);

//   pieChartReady = function() {
//     console.log("pieCHartReady()");
//     pieChartReady = true
//   }

//   // add listener to avoid double drawing.
//   google.visualization.events.addListener(pieChart, "ready", pieChartReady);
//   // call every time datatable changed OR composition of dashboard is changed
//   // fires ready event which must be checked for before redrawing
//   dashboard.draw(data);



//   changeRange = function() {
//     donutRangeSlider.setState({'lowValue': 2, 'highValue': 5});
//     donutRangeSlider.draw();
//         };

//         changeOptions = function() {
//           pieChart.setOption('is3D', true);
//           pieChart.draw();
//         };


// }
// pieChartReady = false;



// need chart range filter