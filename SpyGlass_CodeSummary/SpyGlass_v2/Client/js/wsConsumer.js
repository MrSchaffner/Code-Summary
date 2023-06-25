// @connect
// Connect to the websocket
let socket;
// This will let us create a connection to our Server websocket.
// For this to work, your websocket needs to be running with node index.js
const wsConsumerConnect = function () {
    // Return a promise, which will wait for the socket to open
    return new Promise((resolve, reject) => {
        // This calculates the link to the websocket. 
        const socketProtocol = (window.location.protocol === 'https:' ? 'wss:' : 'ws:') // if secure, establsh wss
        const port = 3000;
        const socketUrl = `ws://localhost:3000/`;
        //'ws://localhost:3000/ws';
        //`${socketProtocol}//${window.location.hostname}:${port}/ws/`

        console.log(`Connecting to Server at ${socketUrl}`);

        // Define socket
        // If you are running your websocket on localhost, you can change 
        // socketUrl to 'http://localhost:3000', as we are running our websocket
        // on port 3000 from the previous websocket code.
        socket = new WebSocket(socketUrl);

        // This will fire once the socket opens
        socket.onopen = (e) => {
            // Send a little test data, which we can use on the server if we want

            console.log("Web Socket Opened Successfully!");

            wsConsumerConnected = true;
            // Resolve the promise - we are connected
            resolve();
        }

        socket.onclose = (e) => {
            console.log(`Connection to Server Closed | Attempting to Reconnect | Error: `, e);

            ControllerRunning = false;

            // Try to connect again
            setTimeout(StartServices, 3000);
        }

        // This will fire on error
        socket.onerror = (e) => {
            // Return an error if any occurs
            console.error(`SpyGlass failed to connect to Server | Error: `, e);
            resolve();
            // Try to connect again
            SetTimeout(wsConsumerConnect, 3000);
        }
    });


} // end wsCOnsumerCOnnect

// @isOpen
// check if a websocket is open
const isOpen = function (ws) {
    return ws.readyState === ws.OPEN
}

var sentRequests = false;
var tryingToConnect = false;

function RequestDataFromServer() {
    if (!isOpen(socket)) return;
    if (sentRequests) return;

    console.log("requesting initial array data from server")

    socket.send(JSON.stringify({ "ev": "request_array", "sym": "SPY", "type": "price" })
    );
    socket.send(JSON.stringify({ "ev": "request_array", "sym": "SPY", "type": "bars" })
    );
    socket.send(JSON.stringify({ "ev": "request_array", "sym": "SPY", "type": "etaGraph" })
    );
    socket.send(JSON.stringify({ "ev": "request_array", "sym": "SPY", "type": "vibeBars" })
    );
    socket.send(JSON.stringify({ "ev": "request_array", "sym": "SPY", "type": "vibeGraph" })
    );
    //socket.send(JSON.stringify({ "ev": "request_array", "sym": "SPX", "type": "price" })
    //);
    //socket.send(JSON.stringify({ "ev": "request_array", "sym": "SPX", "type": "bars" })
    //);
    //socket.send(JSON.stringify({ "ev": "request_array", "sym": "SPX", "type": "etaGraph" })
    //);
    //socket.send(JSON.stringify({ "ev": "request_array", "sym": "SPX", "type": "vibeBars" })
    //);
    //socket.send(JSON.stringify({ "ev": "request_array", "sym": "SPX", "type": "vibeGraph" })
    //);

    sentRequests = true;

    // adding onmessage listener here instead of above
    ////////////////////////////////

    // This will fire when the server sends the user a message
    socket.onmessage = (msg) => {

        //console.log("msg : ", msg); // msg is a data object
        //console.log("msg.data: ", msg.data);
        //console.log("JSON.parse(msg.data): ", JSON.parse(msg.data));
        //console.log("JSON.parse(msg.data).data: ", JSON.parse(msg.data).data);

        let JSONmsg = JSON.parse(msg.data);

        // RECEIVED initial Array, Populate local array
        if (JSONmsg.ev == "send_array") {
            switch (JSONmsg.type) {
                case "price":
                    console.log(`Received price array for ${JSONmsg.sym}. Setting...`);
                    GetTicker(JSONmsg.sym).InitializePrice(JSON.parse(JSONmsg.data));
                    break;

                case "bars":
                    console.log(`Received bars array for ${JSONmsg.sym}. Setting...`);

                    GetTicker(JSONmsg.sym).InitializeBarsWith(JSON.parse(JSONmsg.data));

                    // if you want to populate a 2d array, do it here
                    break;
                case "etaGraph":

                    console.log(`Received Eta array for ${JSONmsg.sym}. Setting...`);
                    GetTicker(JSONmsg.sym).InitializeImpactGraphWith(JSON.parse(JSONmsg.data));
                    break;
                case "vibeBars":
                    console.log(`Received VIBE bars array for ${JSONmsg.sym}. Setting...`);

                    GetTicker(JSONmsg.sym).InitializeVibeBarsWith(JSON.parse(JSONmsg.data));

                    // if you want to populate a 2d array, do it here
                    break;
                case "vibeGraph":

                    console.log(`Received VIBE array for ${JSONmsg.sym}. Setting...`);
                    GetTicker(JSONmsg.sym).InitializeVibeGraphWith(JSON.parse(JSONmsg.data));
                    break;
                default:
            }
        } else if (JSONmsg.ev == "send_data_point") {  // RECEIVED new data point Populate local array
            switch (JSONmsg.type) {
                case "price":
                    //console.log(`received ${JSONmsg.type} data point for ${JSONmsg.sym}: ${dataPoint}`);

                    GetTicker(JSONmsg.sym).price_array.push(JSONmsg.data);
                    break;

                case "bars":
                    // for bars, strike must be gotten from first entry of array.


                    let strike = JSONmsg.data[0]; // needs to receive table row index for SetValue()
                    let callOrPutIndex = JSONmsg.data[1];
                    let newEta = JSONmsg.data[2];


                    //console.log(`received ${JSONmsg.type} data POINT for ${JSONmsg.sym} strike: ${strike} index: ${callOrPutIndex} newEta: ${newEta}`);



                    GetTicker(JSONmsg.sym).impactBars_Table.setValue(strike, callOrPutIndex, newEta);

                    break;
                case "etaGraph":

                    GetTicker(JSONmsg.sym).impact_array.push(JSONmsg.data);
                    break;
                case "vibeBars":

                    let strikeIndex = JSONmsg.data[0]; // needs to receive table row index for SetValue()
                    let callOrPutIndex2 = JSONmsg.data[1];
                    let newVibe = JSONmsg.data[2];

                    //console.log(`received ${JSONmsg.type} data POINT for ${JSONmsg.sym} strikeIndex: ${strikeIndex} index: ${callOrPutIndex2} newEta: ${newVibe} | SETTING ....`);

                    //parameters were created in another switch case, but still accessible in scope somehow

                    GetTicker(JSONmsg.sym).vibeBars_Table.setValue(strikeIndex, callOrPutIndex2, newVibe);

                    break;
                case "vibeGraph":

                    GetTicker(JSONmsg.sym).vibe_array.push(JSONmsg.data);
                    break;
                default:
            }
        }
        else if (JSONmsg.ev == "send_rangepriceindex") {
           // console.error(`range price index received: ${JSONmsg.data}`);

            // randomizer used to test if bars actually move properly
            //let randInt = Math.floor((Math.random() * 16) - 8);

            GetTicker(JSONmsg.sym).rangePriceIndex = JSONmsg.data;// + randInt;
            // forces more frequent range update:
            GetTicker(JSONmsg.sym).rangeWasUpdated = true;
        }

    } // socket onMessage

} // requestDataFromServer()

function RestartConnection() {

}

function wsConsumerSetup() {
    if (tryingToConnect) return;

    wsConsumerConnect();
    tryingToConnect = true;

}

// When the document has loaded
//document.addEventListener('DOMContentLoaded', function () {
//    // Connect to the websocket
//    connect();
//    // And add our event listeners
//    //document.getElementById('websocket-button').addEventListener('click', function (e) {
//    //    alert('checking if open');
//    //    if (isOpen(socket)) {
//    //        alert('open, sending');

//    //        socket.send(JSON.stringify({
//    //            "data": "this is our data to send",
//    //            "other": "this can be in any format"
//    //        }))
//    //    }
//    //});
//});

//function retrieveInitialData() {

//        alert('checking if open');
//        if (isOpen(socket)) {
//            alert('open, sending');

//            socket.send(JSON.stringify({
//                "data": "this is our data to send",
//                "other": "this can be in any format"
//            }))
//        }

//}