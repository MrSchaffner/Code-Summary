
var AutoScroll = true;
UpdateChartOnce = false; // allows you to bypass AutoScroll and still update
var displayTimeRange = '30Sec';
var displayTimeMs = 30000;

$(document).ready(function () {

    $('#gooseImageContainer').click(function () {
        if ($('#hintsDiv').is(":hidden")) {
            $('#hintsDiv').show(1000);
        } else {
            $('#hintsDiv').hide(2000);
        }
    });

    $('#Auto').click(function () {
        //alert('auto clicked');
        AutoScroll = !AutoScroll;
        $(this).toggleClass("btn-pressed");
        $(this).toggleClass("btn-unpressed");
    });

    $('.ig_btn_time').click(function () {
        displayTimeRange = $(this).attr('id');
        setDisplayTimeRangeMs();

        if (!AutoScroll) {
            // force update once
            UpdateChartOnce = true;
        }

        unpressClass($('.ig_btn_time'));
        $(this).addClass("btn-pressed");
        $(this).removeClass("btn-unpressed");
    });



});

function setDisplayTimeRangeMs() {
    switch (displayTimeRange) {
        case '30Sec':
            displayTimeMs = 30000;
            break;
        case '1Min':
            displayTimeMs = 60000;
            break;
        case '5Min':
            displayTimeMs = 300000;
            break;
        case '10Min':
            displayTimeMs = 600000;
            break;
        case '30Min':
            displayTimeMs = 1800000;
            break;
        case '1Hr':
            displayTimeMs = 3600000;
            break;
        case '1Day':
            displayTimeMs = 25200000;
            break; default:
    }
}

function getDisplayTimeRangeInt() {
    // return whichever is later, the range timestamp or the start of day timestamp

    return Math.max(Date.now() - displayTimeMs, dayStart);
}

function unpressClass(elementGroup) {
    elementGroup.removeClass("btn-pressed");
    elementGroup.addClass("btn-unpressed");
}