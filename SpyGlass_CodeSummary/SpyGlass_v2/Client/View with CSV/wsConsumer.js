// @connect
// Connect to the websocket
let socket;
// This will let us create a connection to our Server websocket.
// For this to work, your websocket needs to be running with node index.js
const connect = function () {
    // Return a promise, which will wait for the socket to open
    return new Promise((resolve, reject) => {
        // This calculates the link to the websocket. 
        const socketProtocol = (window.location.protocol === 'https:' ? 'wss:' : 'ws:') // if secure, establsh wss
        const port = 3000;
        const socketUrl = 'ws://localhost:3000/ws';//`${socketProtocol}//${window.location.hostname}:${port}/ws/`

        alert(socketUrl);

        // Define socket
        // If you are running your websocket on localhost, you can change 
        // socketUrl to 'http://localhost:3000', as we are running our websocket
        // on port 3000 from the previous websocket code.
        socket = new WebSocket(socketUrl);

        // This will fire once the socket opens
        socket.onopen = (e) => {
            // Send a little test data, which we can use on the server if we want
            socket.send(JSON.stringify({ "ev": "request_Array", "sym": "SPY", "type": "price" })
            );
            socket.send(JSON.stringify({ "ev": "request_Array", "sym": "SPY", "type": "impact" })
            );
            socket.send(JSON.stringify({ "ev": "request_Array", "sym": "SPY", "type": "bars" })
            );
            wsConsumerReady = true;

            // Resolve the promise - we are connected
            resolve();
        }

        // This will fire when the server sends the user a message
        socket.onmessage = (msg) => {
            console.log("message ",msg);
            //let json = JSON.parse(msg);
            console.log("data ",msg.data);
            // Any data from the server can be manipulated here.
            //let parsedData = msg.data;//JSON.parse(data.data);
        
        }

        // This will fire on error
        socket.onerror = (e) => {
            // Return an error if any occurs
            console.log(e);
            resolve();
            // Try to connect again
            connect();
        }
    });
}

// @isOpen
// check if a websocket is open
const isOpen = function (ws) {

    return ws.readyState === ws.OPEN

}

// When the document has loaded
document.addEventListener('DOMContentLoaded', function () {
    // Connect to the websocket
    connect();
    // And add our event listeners
    //document.getElementById('websocket-button').addEventListener('click', function (e) {
    //    alert('checking if open');
    //    if (isOpen(socket)) {
    //        alert('open, sending');

    //        socket.send(JSON.stringify({
    //            "data": "this is our data to send",
    //            "other": "this can be in any format"
    //        }))
    //    }
    //});
});
