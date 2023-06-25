
function RecordcurrentSpyPriceWithApi(symbol) {

return;

  var cacheBuster = ``;//Math.floor(Math.random() * 999999999);

  const currentSpyPriceURL = `https://finnhub.io/api/v1/quote?symbol=` + symbol + `&token=cfsfpepr01qgkckhee10cfsfpepr01qgkckhee1g&cache_bust=` + cacheBuster;

  console.log("running record price");

  axios.get(currentSpyPriceURL)
    .then(response => {


      // record price of SPY
      var price = response.data.c;

      const timeStamp = Date.now();

      console.log(response);
      //console.log(`Time: ${timeStamp}; Spy Price: ${price}`);

      PriceSPY.push(new PriceDataPoint(timeStamp, price));
      PriceSPY_table.addRow([new Date(timeStamp), price]);
      currentSpyPrice = price;

      // update chart parameters
      SPY_high = Math.max(SPY_high, price);
      SPY_low = Math.max(SPY_low, price);

    })
    .catch(error => console.error(`Error: ` + error));

  // trying to alternate call to see if I get different result

  axios.get("https://finnhub.io/api/v1/quote?symbol=AAPL&token=cfsfpepr01qgkckhee10cfsfpepr01qgkckhee1g")
    .then(response => {


      // record price of SPY
      var price = response.data.c;

      console.log("AAPL price: " + price);

    })
    .catch(error => console.error(`Error: ` + error));


}

function RecordCurrentGreeksAPIold(symbol) {

  var cacheBuster = Math.floor(Math.random() * 999999999);

  const currentSpyPriceURL = `https://finnhub.io/api/v1/quote?symbol=` + symbol + `&token=cfsfpepr01qgkckhee10cfsfpepr01qgkckhee1g&cache_bust=` + cacheBuster;

  console.log("running record price");

  axios.get(currentSpyPriceURL)
    .then(response => {


      // record price of SPY
      var price = response.data.c;

      const timeStamp = Date.now();

      console.log(response);
      //console.log(`Time: ${timeStamp}; Spy Price: ${price}`);

      PriceSPY.push(new PriceDataPoint(timeStamp, price));
      PriceSPY_table.addRow([new Date(timeStamp), price]);

      // update chart parameters
      SPY_high = Math.max(SPY_high, price);
      SPY_low = Math.max(SPY_low, price);

    })
    .catch(error => console.error(`Error: ` + error));

  // trying to alternate call to see if I get different result

  axios.get("https://finnhub.io/api/v1/quote?symbol=AAPL&token=cfsfpepr01qgkckhee10cfsfpepr01qgkckhee1g")
    .then(response => {


      // record price of SPY
      var price = response.data.c;

      console.log("AAPL price: " + price);

    })
    .catch(error => console.error(`Error: ` + error));


}

// right now this is calling every second for every strike within the radius 
//possibly it could call only as needed for trades that actually came in. 
function RecordCurrentGreeksAPI(symbol){

    if (DiagnosticModeController.isActive) return;

    let priceStep = 1; // 5 for SPXW
    //radius = 10;
    const marketMax = Math.floor(rangePrice + radius); // the highest I want to subscribe to
    const marketMin = Math.floor(rangePrice - radius);

    for (let strike = marketMin; strike < marketMax; strike += priceStep) {

        const tempURL = `https://api.polygon.io/v3/snapshot/options/` + symbol + `?strike_price=` + strike + `&expiration_date=` + dateToday_api + `&apiKey=` + APIKEY_polygon;

        axios.get(tempURL)
            .then(response => {

                myHealthChecker.recordTimeSpentOn('g', true);

                //console.log(`${tempURL}`);

                let both = response.data.results;
                let call = response.data.results[0];
                let put = response.data.results[1];
                let deltaC = Math.round(call.greeks.delta * 1000) * .001;
                let deltaP = Math.round(put.greeks.delta * 1000) * .001;
                let gammaC = Math.round(call.greeks.gamma * 1000) * .001;
                let gammaP = Math.round(put.greeks.gamma * 1000) * .001;
                //console.log("API return")
                //console.log(response);
                // console.log(response.data);
                // console.log(call.day.volume);
                // console.log(call.details.strike_price);
                // console.log(call.details.ticker);
                // console.log(call.greeks.delta);
                // console.log(call.greeks.gamma);
                // console.log(call.open_interest);
                // console.log(call.underlying_asset.price);
                // console.log(call.underlying_asset.ticker);


                //console.log("CALL: ");
                //console.log(call);
                //console.log("PUT: ");
                //console.log(put);
                //console.log(`strike: ${strike} delta: ${deltaC}`);

                const timeStampMS = Date.now();// Math.floor(call.underlying_asset.last_updated / 1000000); // convert nanoseconds to milliseconds
                //console.log(timeStampMS);
              
                if (isNaN(deltaC) || isNaN(gammaC)) {

                    //console.log("Results: ");
                    //console.log(both);

                    //console.warn(`SpyGlass Error: one of the call's greeks was undefined`);
                } else {
                    GreekByStrikeSPY.getLast('C')[strike] = new GreekDataPoint(timeStampMS, deltaC, gammaC);
                }

                if (isNaN(deltaP) || isNaN(gammaP)) {
                    //console.warn(`SpyGlass Error: one of the puts's greeks was undefined`);
                } else {
                    GreekByStrikeSPY.getLast('P')[strike] = new GreekDataPoint(timeStampMS, deltaP, gammaP);
                }


                myHealthChecker.recordTimeSpentOn('g', false);
            })
            .catch(error => console.error(`RecordCurrentGreeksApi() Error: ` + error));
    }


} // END RecordCurrentGreeksAPI(symbol)

ApiRequest = function () {

  // GreekByStrikeSPY
  // for(let i = marketMin; i< marketMax; i++ ) {

  // } // end for Loop

  var strike = `395`;

  const tempURL = `https://api.polygon.io/v3/snapshot/options/` + SYM + `?strike_price=` + strike + `&expiration_date=` + dateToday_api + `&apiKey=` + APIKEY_polygon;

  axios.get(tempURL)
    .then(response => {
      let both = response.data.results;
      let call = response.data.results[0];
      let put = response.data.results[1];
      // console.log("API return")
      // console.log(response.data);
      // console.log(call.day.volume);
      // console.log(call.details.strike_price);
      // console.log(call.details.ticker);
      // console.log(call.greeks.delta);
      // console.log(call.greeks.gamma);
      // console.log(call.open_interest);
      // console.log(call.underlying_asset.price);
      // console.log(call.underlying_asset.ticker);

      
      console.log("Results: ");
      console.log(both);

      console.log("CALL: ");
      console.log(call);
      console.log("PUT: ");
      console.log(put);

      // record price of SPY
      const price = call.underlying_asset.price;
      const timeStamp = Math.floor(call.underlying_asset.last_updated / 1000000); // convert nanoseconds to milliseconds
      PriceSPY.push(new PriceDataPoint(timeStamp, price));
      PriceSPY_table.addRow([new Date(timeStamp), price]);

      // update chart parameters
      SPY_high = Math.max(SPY_high, price);
      SPY_low = Math.max(SPY_low, price);

    })
    .catch(error => console.error(`Error: ` + error));

}

//let myTimer = setInterval(()=>console.log(Date.now()), 1000);

ApiReady = true;