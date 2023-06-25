


$(document).ready(function () {

    // hints revealer - NOT USING
    //$('#gooseImageContainer').click(function () {
    //    if ($('#hintsDiv').is(":hidden")) {
    //        $('#hintsDiv').show(1000);
    //    } else {
    //        $('#hintsDiv').hide(2000);
    //    }
    //});

    $('#Auto_left').click(function () {
        //alert('auto clicked');
        leftTicker.AutoScroll = !leftTicker.AutoScroll;
        $(this).toggleClass("btn-pressed");
        $(this).toggleClass("btn-unpressed");
    });

    $('#Auto_right').click(function () {
        //alert('auto clicked');
        rightTicker.AutoScroll = !rightTicker.AutoScroll;
        $(this).toggleClass("btn-pressed");
        $(this).toggleClass("btn-unpressed");
    });

    $('.ig_btn_time_left').click(function () {
        let displayTimeRange = $(this).attr('id');

        leftTicker.displayTimeMs = getDisplayTimeRangeMs(displayTimeRange);

        /*console.warn("left clicked " + displayTimeRange + " ms: " + leftTicker.displayTimeMs + " autoscroll? " + leftTicker.AutoScroll + " leftTicker symbol " + leftTicker.connectedTicker.sym);*/
        if (!leftTicker.AutoScroll) {
            // force update once
            leftTicker.UpdateChartOnce = true;
        }

        unpressClass($('.ig_btn_time_left'));
        $(this).addClass("btn-pressed");
        $(this).removeClass("btn-unpressed");
    });

    // it was far easier to just duplicate the function rather than creating a pattern
    $('.ig_btn_time_right').click(function () {
        let displayTimeRange = $(this).attr('id');
        rightTicker.displayTimeMs = getDisplayTimeRangeMs(displayTimeRange);

        if (!rightTicker.AutoScroll) {
            // force update once
            rightTicker.UpdateChartOnce = true;
        }

        unpressClass($('.ig_btn_time_right'));
        $(this).addClass("btn-pressed");
        $(this).removeClass("btn-unpressed");
    });

});

function getDisplayTimeRangeMs(displayTimeRange) {
    console.warn(`getDisplayTimeRangeMs`);
    switch (displayTimeRange) {
        case '30Sec':
            return 30 * 1000;
            break;
        case '1Min':
            return 60 * 1000;
            break;
        case '5Min':
            return 5 * 60 * 1000;
            break;
        case '10Min':
            return 10 * 60 * 1000;
            break;
        case '30Min':
            return 30 * 60 * 1000;
            break;
        case '1Hr':
            return 60 * 60 * 1000;
            break;
        case '1Day':
            return 7 * 60 * 60 * 1000;
            break;
        default:
            console.error("hit default while setting time. That shouldn't happen");
            return 7 * 60 * 60 * 1000;
            break;
    }
}

function getDisplayTimeRangeInt(timeMS) {
    // return whichever is later, the range timestamp or the start of day timestamp

    return Math.max(Date.now() - timeMS, dayStart);
}

function unpressClass(elementGroup) {
    elementGroup.removeClass("btn-pressed");
    elementGroup.addClass("btn-unpressed");
}