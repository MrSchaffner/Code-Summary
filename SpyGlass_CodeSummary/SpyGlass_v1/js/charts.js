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
    google.charts.setOnLoadCallback(InitializeAllGoogleCharts);
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
    green: '#2AFC98' // spring green
}

//var tickerGraph; // making public
//var tickerGraphOptions;
//var tickerGraphReady = false;

var tickerGraph;
var tickerGraphOptions = {
    // appearance
    labels: ['Time', 'Price'],
    drawPoints: true,
    drawAxesAtZero: true,
    drawPoints: false,
    colors: [myColor.price],
    legend: 'always',
    //valueRange: [0.0, 1.2],
    // features
    showRoller: true,
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
}//options

var tickerGraphReady = false;

//var impactGraph;
//var impactGraphOptions;
//var impactGraphReady = false;

var impactGraph;
var impactGraphOptions = {
    //appearance
    labels: ['Time', 'ZeroLine', 'Both', 'Calls', 'Puts'],
    drawPoints: false,
    drawAxesAtZero: true,
    colors: [myColor.zero, myColor.both, myColor.calls, myColor.puts],
    legend: 'always',
    //valueRange: [0.0, 1.2],
    // features
    animatedZooms: true,
    showRoller: true,
    panEdgeFraction: 0.0 // dont allow panning past edge
}//options


var impactBars;
var impactBarsOptions;
var impactBarsReady = false;

var impactTable;
let impactTableOptions = {
    backgroundColor: 'transparent',
    showRowNumber: true,
    width: '100%',
    height: '100%'
};



//setTimeout(() => { AutoScroll = false; }, 10000); // simulate turning off


function InitializeAllGoogleCharts() { // after google.charts has loaded
    console.log("charts initializeAll()");
    //ConnectButtons();
    InitializeDataTables();
    InitializeGoogleChart()
    googleReady = true;
}

function InitializeGoogleChart() {

    var dashboard = new google.visualization.Dashboard(document.getElementById('dashboard_div'));

    /////////////////////////////////////////////////////
    //TICKER GRAPH
    //REMOVE to use dyGraph instead
    //tickerGraph = new google.visualization.LineChart(document.getElementById('ticker_graph'));
    //tickerGraph = new google.charts.Line(document.getElementById('ticker_graph'));

    // add listeners to avoid double drawing.
    //google.visualization.events.addListener(tickerGraph, "ready", () => { tickerGraphReady = true; });
    //google.visualization.events.addListener(tickerGraph, "error", (e) => { alert(e); });
    //tickerGraphReady = true;


    Dygraph.onDOMready(function onDOMready() {
        /////////////////////////////////////////////////////
        //TICKER DY GRAPH
        tickerGraph = new Dygraph(

            // containing div
            document.getElementById("ticker_dygraph"),
            PriceSPY_table, // "http://localhost:5000/data_files/test1.csv", //csv path
            tickerGraphOptions
            // CSV or path to a CSV file.
            //"Date,Temperature\n" +
            //"2008-05-07,75\n" +
            //"2008-05-08,70\n" +
            //"2008-05-09,80\n"

        );

        /////////////////////////////////////////////////////
        //HEDGE IMPACT DY GRAPH

        impactGraph = new Dygraph(

            // containing div
            document.getElementById("impact_dygraph"),
            PriceSPY_table,//"http://localhost:5000/data_files/test1.csv", //csv path
            impactGraphOptions
            // CSV or path to a CSV file.
            //"Date,Temperature\n" +
            //"2008-05-07,75\n" +
            //"2008-05-08,70\n" +
            //"2008-05-09,80\n"

        );

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

    });


    /////////////////////////////////////////////////////
    //HEDGE IMPACT GRAPH
    /*   impactGraph = new google.visualization.LineChart(document.getElementById('impact_graph'));*/
    // add listeners to avoid double drawing. 
    //google.visualization.events.addListener(impactGraph, "ready", () => { impactGraphReady = true; });
    //google.visualization.events.addListener(impactGraph, "error", (e) => { alert(e); });
    //impactGraphReady = true;

    /////////////////////////////////////////////////////
    //HEDGE IMPACT BARS
    impactBars = new google.charts.Bar(document.getElementById('impact_bars'));

    // add listeners to avoid double drawing. 
    google.visualization.events.addListener(impactBars, "ready", () => { impactBarsReady = true; });
    google.visualization.events.addListener(impactBars, "error", (e) => { console.error(e); });
    impactBarsReady = true;

    /////////////////////////////////////////////////////
    //HEDGE IMPACT TABLE for DEBUGGING
    //impactTable = new google.visualization.Table(document.getElementById('impact_table'));

    //// add listeners to avoid double drawing. 
    //google.visualization.events.addListener(impactTable, "ready", () => { impactTableReady = true; });
    //google.visualization.events.addListener(impactTable, "error", (e) => { alert(e); });
    //impactTableReady = true;



    //updateChartOptions(); // in updateChart()

    UpdateChart();


    console.log("Chart initialized successfully");
} // end initializedChart()


///////////////////////////////////////////////////////
// Update Chart if it is ready to be
///////////////////////////////////////////////////////


function updateImpactDyGraphData() {
    impactGraph.updateOptions({ 'file': ImpactSPY_table });
}

function updateImpactDyGraphOptions() {
    // center current price, not rangePrice
    let space = Math.max(SPY_high - currentSpyPrice, currentSpyPrice - SPY_low) * 1.25;
    graphBottom = currentSpyPrice - space;//SPY_low - ((SPY_high - SPY_low)*.25);
    graphTop = currentSpyPrice + space;//SPY_high + ((SPY_high - SPY_low)*.25);

    // set left and right to time range
    graphLeft = new Date(getDisplayTimeRangeInt()); // google charts require Date Object
    graphRight = new Date(Date.now() + 1500);

    impactGraph.updateOptions({
        dateWindow: [graphLeft, graphRight]
        //valueRange: [graphBottom, graphTop]
    });
}

//function updateImpactGraphOptions() {

//    // set left and right to time range
//    graphLeft = new Date(getDisplayTimeRangeInt()); // google charts require Date Object
//    graphRight = new Date(Date.now() + 1500);
//    let dragAction = "dragToZoom";// | "dragToPan"; // set this with a button

//    impactGraphOptions = {
//        title: 'Eta Impact',
//        //curveType: 'function',
//        legend: { position: 'top' },
//        curveType: 'function',
//        explorer: {
//            actions: [dragAction, "rightClickToReset"],
//            maxZoomIn: 0.05
//        },
//        chartArea: { width: '90%', height: '80%' },
//        series: {
//            0: { color: '#fff' }, // white
//            1: { color: myColor.both }, // celestial blue
//            2: { color: myColor.calls }, // maize yellow
//            3: { color: myColor.puts } // amaranth
//        },
//        backgroundColor: 'transparent',
//        legendTextStyle: { color: '#FFF' },
//        titleTextStyle: { color: '#FFF' },
//        hAxis: {
//            textPosition: 'out',
//            textStyle: { color: '#FFF' },
//            format: 'hh:mm:ss',
//            gridlines: { count: 5, color: '#555' },
//            viewWindow: {

//                min: graphLeft,
//                max: graphRight
//            }
//        },
//        vAxis: {
//            textPosition: 'in',
//            textStyle: { color: '#FFF' },
//            gridlines: { count: 5, color: '#555' },
//            //viewWindow: {
//            // min: graphBottom,
//            // max: graphTop
//            //}
//        }
//    };
//}

//function updateTickerGraphOptions() {

//    // center current price, not rangePrice
//    let space = Math.max(SPY_high - currentSpyPrice, currentSpyPrice - SPY_low) * 1.25;
//    graphBottom = currentSpyPrice - space;//SPY_low - ((SPY_high - SPY_low)*.25);
//    graphTop = currentSpyPrice + space;//SPY_high + ((SPY_high - SPY_low)*.25);

//    // set left and right to time range
//    graphLeft = new Date(getDisplayTimeRangeInt()); // google charts require Date Object
//    graphRight = new Date(Date.now() + 1500);


//    //console.log(`Left : ${graphLeft} RIght : ${graphRight}`);
//    //console.log(`Top: ${graphBottom} Bottom : ${graphTop}`);
//    tickerGraphOptions = {
//        title: 'SPY Price',
//        //curveType: 'function',
//        legend: 'none',
//        curveType: 'function',
//        explorer: {
//            actions: ["dragToZoom", "rightClickToReset"],
//            maxZoomIn: 0.05
//        },
//        series: {
//            0: { color: myColor.puts } // amaranth
//        },
//        chartArea: { width: '90%', height: '80%' },
//        backgroundColor: 'transparent',
//        legendTextStyle: { color: '#FFF' },
//        titleTextStyle: { color: '#FFF' },
//        hAxis: {
//            textStyle: { color: '#FFF' },
//            format: 'hh:mm:ss',
//            gridlines: { count: 5, color: 'lightgray' },
//            viewWindow: {
//                min: graphLeft,
//                max: graphRight
//            }
//        },
//        vAxis: {
//            textPosition: 'in',
//            textStyle: { color: '#FFF' },
//            gridlines: { count: 5, color: 'lightgray' },
//            viewWindow: {
//                min: graphBottom,
//                max: graphTop
//            }
//        }
//    };
//}


function updateTickerDyGraphData() {
    tickerGraph.updateOptions({ 'file': PriceSPY_table });
}

function updateTickerDyGraphOptions() {
    // center current price, not rangePrice
    let space = Math.max(SPY_high - currentSpyPrice, currentSpyPrice - SPY_low) * 1.25;
    graphBottom = currentSpyPrice - space;//SPY_low - ((SPY_high - SPY_low)*.25);
    graphTop = currentSpyPrice + space;//SPY_high + ((SPY_high - SPY_low)*.25);

    // set left and right to time range
    graphLeft = new Date(getDisplayTimeRangeInt()); // google charts require Date Object
    graphRight = new Date(Date.now() + 1500);

    tickerGraph.updateOptions({
        dateWindow: [graphLeft, graphRight]
        //valueRange: [graphBottom, graphTop]
    });
}

function updateImpactBarsOptions() {

    if (!rangeWasUpdated) return; // no need to update these options

    // set left and right to time range
    graphLeft = rangePrice - 5;
    graphRight = rangePrice + 5;


    impactBarsOptions = {
        //legend: { position: 'top' },
        backgroundColor: 'transparent',
        series: {
            0: { color: myColor.calls },
            1: { color: myColor.puts }
        },
        // https://github.com/google/google-visualization-issues/issues/1964
        // legend options don't work for material charts
        legend: 'none',
        chartArea: { backgroundColor: 'transparent' },
        chart: {
            title: 'Current Eta',
            subtitle: 'Organized by Strike',
        },
        bars: 'vertical', // Required for Material Bar Charts.
        legendTextStyle: { color: '#FFF' },
        titleTextStyle: { color: '#FFF' },
        hAxis: {
            showTextEvery: 1,
            textStyle: { color: '#FFF' },
            gridlines: { count: 10, color: '#555' },
            viewWindow: {
                min: graphLeft,
                max: graphRight
            }
        },
        vAxis: {
            textStyle: { color: '#FFF' },
            gridlines: { count: 5, color: '#555' },
            //viewWindow: {
            // min: graphBottom,
            // max: graphTop
            //}
        }
    };
}





UpdateChart = function () {


    if (!AutoScroll && !UpdateChartOnce) return;
    UpdateChartOnce = false;
    // Google Charts won't update when not scrolling, because they need full Draw.

    if (/*!tickerGraphReady || !impactGraphReady || */!impactBarsReady) {
        console.log("Tried to updateCHart() but it wasn't ready. ready event is called by chart.draw()");
        return;
    }

    myHealthChecker.recordTimeSpentOn('d', true);

    // format table data prior to drawing
    //var timeFormatter = new google.visualization.DateFormat({ pattern: "hh:mm:ss" }); // whne hovering over points
    //timeFormatter.format(ImpactSPY_table, 0); // format(table,colIndex_of_col_to_format);
    //timeFormatter.format(PriceSPY_table, 0); // format(table,colIndex_of_col_to_format);

    // PRICE
    //updateTickerGraphOptions();
    //tickerGraphReady = false; // prevents double drawing
    //tickerGraph.draw(PriceSPY_table, tickerGraphOptions);

    //tickerGraph.draw(PriceSPY_table, google.charts.Line.convertOptions(tickerGraphOptions));

    // DYgraph Version
    updateTickerDyGraphData(); // just the data, not the position
    updateTickerDyGraphOptions(); // updates range. Data (above) can always be updated, even if autoscroll = false, but it will steal control. Need to find workaround for better functionality.

    // ETA
    //updateImpactGraphOptions();
    //impactGraphReady = false; // prevents double drawing
    //impactGraph.draw(ImpactSPY_table, impactGraphOptions);

    // dyGraphVersion
    updateImpactDyGraphData(); // just the data, not the position
    updateImpactDyGraphOptions(); // updates range. Data (above) can always be updated, even if autoscroll = false, but it will steal control. Need to find workaround for better functionality.
    //ImpactByStrikeSPY_table = [["400", 5, 6], ["401", 6, 7]];

    // BARS
    updateImpactBarsOptions();
    impactBarsReady = false; // prevents double drawing
    impactBars.draw(impactBars_Table, google.charts.Bar.convertOptions(impactBarsOptions));

    // TABLE
    //updateImpactTableOptions();
    //  impactTable.draw(ImpactSPY_table, impactTableOptions);

    myHealthChecker.recordTimeSpentOn('d', false);
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