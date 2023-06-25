


function InitializeDyGraph() {

    Dygraph.onDOMready(function onDOMready() {
        dyGraph_chart = new Dygraph(

            // containing div
            document.getElementById("ticker_dygraph"),
            csvData,//"http://localhost:5000/data_files/test1.csv", //csv path
            tickerGraphOptions
            // CSV or path to a CSV file.
            //"Date,Temperature\n" +
            //"2008-05-07,75\n" +
            //"2008-05-08,70\n" +
            //"2008-05-09,80\n"

        );
    });
    dyGraphReady = true;
}// end InitializeDyGraph()


let timeStamp = Date.now();

UpdateDyGraph = function () {

    dyGraph_chart.updateOptions({ 'file': csvData });
    

}


