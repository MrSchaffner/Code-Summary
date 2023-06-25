class HealthChecker {
    isActive = false; // record nothing, report nothing
    isPerformingFullReport = false; // to allow it to deliver 10 sec reports
    drawTimeStarted = { val: 0 }; // setting as object so it can be passed as reference. other option is an array
    drawTimeArray = [];
    greekTimeStarted = { val: 0 };
    greekTimeArray = []; // is a total for a given period
    tradeTimeStarted = { val: 0 };
    tradeTimeArray = []; // is a total for a given period
    quoteTimeStarted = { val: 0 };
    quoteTimeArray = []; // is a total for a given period

    reportString = "";

    avg = 1;

    recordTimeSpentOn(activityChar, isStart) {
        if (!this.isActive) return;
        let TimeStartedRecording;
        let TimeArray; // hopefully sent as reference


        switch (activityChar) {
            case 'd':
                TimeStartedRecording = this.drawTimeStarted;
                TimeArray = this.drawTimeArray;
                break;
            case 'g':
                TimeStartedRecording = this.greekTimeStarted;
                TimeArray = this.greekTimeArray;
                if (!this.isPerformingFullReport) return; 
                break;
            case 't':
                TimeStartedRecording = this.tradeTimeStarted;
                TimeArray = this.tradeTimeArray;
                if (!this.isPerformingFullReport) return; 
                break;
            case 'q':
                TimeStartedRecording = this.quoteTimeStarted;
                TimeArray = this.quoteTimeArray;
                if (!this.isPerformingFullReport) return; 
                break;
            default:
        }

        if (isStart) {
            TimeStartedRecording.val = Date.now();
        }
        else {
           // console.log(`TimeStarted: ${TimeStartedRecording.val} | tradeTimeStarted: ${this.tradeTimeStarted.val}`);
            let timePassed = Date.now() - TimeStartedRecording.val;
            TimeArray.push(timePassed);
        }
    }

    reportFull(keepModeOn = false) {
// only run if performing full diagnostic
        if (!this.isPerformingFullReport) return ""; 
        this.reportDiagnosticDrawTime(true);
        this.reportDiagnosticDataTimeOn("Greeks", true);
        this.reportDiagnosticDataTimeOn("Trades", true);
        this.reportDiagnosticDataTimeOn("Quotes", true);
        let reportString = this.reportString; // doing this so I can clear it and THEN return value.
        this.reportString = "";
        this.isPerformingFullReport = keepModeOn; 
        return reportString;
    }

    reportDiagnosticDrawTime(clearOldData = true) {
        if (!this.isActive) return;

        let total = 0;
        //this.drawTimeArray.forEach((e) => { total += e });
        //total = this.drawTimeArray.reduce((partialSum, a) => partialSum + a, 0);

        for (let i = 0; i < this.drawTimeArray.length; i++) {
            total += this.drawTimeArray[i];
        };

        this.avg = Math.round(total / this.drawTimeArray.length);

        if (clearOldData) {
            this.drawTimeArray = []; // emptying array
        }

        this.reportString += ` Average draw time for period: ${this.avg} ms | Eta Table RowCount: ${ImpactSPY_table.getNumberOfRows()} | status: ${this.getStatusString(this.avg)} \n `;
       
        return this.avg;
    }

    reportDiagnosticDataTimeOn(typeString, clearOldData = true) {
        if (!this.isActive) return;

        let TimeArray; // hopefully sent as reference

        switch (typeString) {
            case 'Greeks':
                TimeArray = this.greekTimeArray;
                break;
            case 'Trades':
                TimeArray = this.tradeTimeArray;
                break;
            case 'Quotes':
                TimeArray = this.quoteTimeArray;
                break;
            default:
        }

        let total = 0;
        //this.drawTimeArray.forEach((e) => { total += e });
        //total = this.drawTimeArray.reduce((partialSum, a) => partialSum + a, 0);

        for (let i = 0; i < TimeArray.length; i++) {
            total += TimeArray[i];
        };

        // don't want average for this
        //this.avg = Math.round(total / this.drawTimeArray.length);

        if (clearOldData) {
            TimeArray = []; // emptying array
        }

        this.reportString += `${typeString} time: ${total} ms | `;
        
        return total;
    }

    getAdjustedDrawTime() {
        let healthyDrawTime = 500;
        let multiplier = 1;
        if (this.avg > healthyDrawTime) {
            multiplier = this.avg / healthyDrawTime;
        }

        console.log(`Draw time delay: ${multiplier} secs | getAdjustedDrawTime()`)
        return multiplier;
    }

    getStatusString(timeMS) {
        let status;

        if (timeMS < 250) {
            status = "Very healthy";
        } else if (timeMS < 500) {
            status = "Healthy";
        } else if (timeMS < 700) {
            status = "Sick";
        } else if (timeMS < 900) {
            status = "Dying";
        } else {
            status = "Basically Dead";
        }

        return status;
    }

    addFakeRows(dataTable, numberOfRows) {

        for (let i = 0; i < numberOfRows; i++) {
            let puts = (Math.random() * 2000) - 1000;
            let calls = (Math.random() * 2000) - 1000;
            let both = puts + calls;

            dataTable.addRow([new Date(Date.now()-(i*10)), 0, puts, calls, both]); // need preliminary row
        }
    }

} // end HealthChecker class

class DiagnosticModeController {
    static isActive = false;
}

class DataFaker {
    getQuoteDP() {
        let timeStamp = Date.now() - 20;
        let bidPrice = Math.random();
        let askPrice = bidPrice + 0.1;

        return new QuoteDataPoint(timeStamp, bidPrice, askPrice);
    }

    getTradeDP() {
        let timeStamp = Date.now() - 10;
        let price = Math.random() + 0.1;
        let size = Math.floor(Math.random() * 10);

        return new TradeDataPoint(timeStamp, price, size);
    }

    getGreekDP() {

        timeStamp = Date.now() - 30;
        delta = (Math.random() * 2) - 1;
        gamma = 0.5;

        return new GreekDataPoint(timeStamp, delta, gamma);
    }

    getPriceDP() {

        timeStamp = Date.now();
        price = (Math.round(Math.random() * 20) / 10) + 400;

        return new PriceDataPoint(timeStamp, price);
    }



    dyTimeStamp = Date.now();

    static RecordFakePrice(symbol) {
        console.warn("adding fake dyGraph rows");
    let rowsToAdd = 100;

    for (let i = 0; i < rowsToAdd; i++) {
        let price = currentSpyPrice + ((Math.random() * .04) - .02);

        //csvData += "" + dyTimeStamp + "," + rando + "\n"
        //dyTimeStamp += 1000;

        RecordCurrentSpyPrice(symbol, (Date.now() - 1000) + (i * (1000 / rowsToAdd)), price)

    }
}

} // end DataFaker class
