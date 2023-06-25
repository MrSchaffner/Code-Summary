/**
 * @license
 * Copyright 2013 David Eberlein (david.eberlein@ch.sauter-bc.com)
 * MIT-licenced: https://opensource.org/licenses/MIT
 */

/**
 * @fileoverview DataHandler implementation for the custom bars option.
 * @author David Eberlein (david.eberlein@ch.sauter-bc.com)
 */

/*global Dygraph:false */
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _bars = _interopRequireDefault(require("./bars"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
/**
 * @constructor
 * @extends Dygraph.DataHandlers.BarsHandler
 */
var CustomBarsHandler = function CustomBarsHandler() {};
CustomBarsHandler.prototype = new _bars["default"]();

/** @inheritDoc */
CustomBarsHandler.prototype.extractSeries = function (rawData, i, options) {
  // TODO(danvk): pre-allocate series here.
  var series = [];
  var x, y, point;
  var seriesLabel = options.get("labels")[i];
  var logScale = options.getForSeries("logscale", seriesLabel);
  for (var j = 0; j < rawData.length; j++) {
    x = rawData[j][0];
    point = rawData[j][i];
    if (logScale && point !== null) {
      // On the log scale, points less than zero do not exist.
      // This will create a gap in the chart.
      if (point[0] <= 0 || point[1] <= 0 || point[2] <= 0) {
        point = null;
      }
    }
    // Extract to the unified data format.
    if (point !== null) {
      y = point[1];
      if (y !== null && !isNaN(y)) {
        series.push([x, y, [point[0], point[2]]]);
      } else {
        series.push([x, y, [y, y]]);
      }
    } else {
      series.push([x, null, [null, null]]);
    }
  }
  return series;
};

/** @inheritDoc */
CustomBarsHandler.prototype.rollingAverage = function (originalData, rollPeriod, options, i) {
  rollPeriod = Math.min(rollPeriod, originalData.length);
  var rollingData = [];
  var y, low, high, mid, count, i, extremes;
  low = 0;
  mid = 0;
  high = 0;
  count = 0;
  for (i = 0; i < originalData.length; i++) {
    y = originalData[i][1];
    extremes = originalData[i][2];
    rollingData[i] = originalData[i];
    if (y !== null && !isNaN(y)) {
      low += extremes[0];
      mid += y;
      high += extremes[1];
      count += 1;
    }
    if (i - rollPeriod >= 0) {
      var prev = originalData[i - rollPeriod];
      if (prev[1] !== null && !isNaN(prev[1])) {
        low -= prev[2][0];
        mid -= prev[1];
        high -= prev[2][1];
        count -= 1;
      }
    }
    if (count) {
      rollingData[i] = [originalData[i][0], 1.0 * mid / count, [1.0 * low / count, 1.0 * high / count]];
    } else {
      rollingData[i] = [originalData[i][0], null, [null, null]];
    }
  }
  return rollingData;
};
var _default = CustomBarsHandler;
exports["default"] = _default;
module.exports = exports.default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDdXN0b21CYXJzSGFuZGxlciIsInByb3RvdHlwZSIsIkJhcnNIYW5kbGVyIiwiZXh0cmFjdFNlcmllcyIsInJhd0RhdGEiLCJpIiwib3B0aW9ucyIsInNlcmllcyIsIngiLCJ5IiwicG9pbnQiLCJzZXJpZXNMYWJlbCIsImdldCIsImxvZ1NjYWxlIiwiZ2V0Rm9yU2VyaWVzIiwiaiIsImxlbmd0aCIsImlzTmFOIiwicHVzaCIsInJvbGxpbmdBdmVyYWdlIiwib3JpZ2luYWxEYXRhIiwicm9sbFBlcmlvZCIsIk1hdGgiLCJtaW4iLCJyb2xsaW5nRGF0YSIsImxvdyIsImhpZ2giLCJtaWQiLCJjb3VudCIsImV4dHJlbWVzIiwicHJldiJdLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9kYXRhaGFuZGxlci9iYXJzLWN1c3RvbS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgMjAxMyBEYXZpZCBFYmVybGVpbiAoZGF2aWQuZWJlcmxlaW5AY2guc2F1dGVyLWJjLmNvbSlcbiAqIE1JVC1saWNlbmNlZDogaHR0cHM6Ly9vcGVuc291cmNlLm9yZy9saWNlbnNlcy9NSVRcbiAqL1xuXG4vKipcbiAqIEBmaWxlb3ZlcnZpZXcgRGF0YUhhbmRsZXIgaW1wbGVtZW50YXRpb24gZm9yIHRoZSBjdXN0b20gYmFycyBvcHRpb24uXG4gKiBAYXV0aG9yIERhdmlkIEViZXJsZWluIChkYXZpZC5lYmVybGVpbkBjaC5zYXV0ZXItYmMuY29tKVxuICovXG5cbi8qZ2xvYmFsIER5Z3JhcGg6ZmFsc2UgKi9cblwidXNlIHN0cmljdFwiO1xuXG5pbXBvcnQgQmFyc0hhbmRsZXIgZnJvbSAnLi9iYXJzJztcblxuLyoqXG4gKiBAY29uc3RydWN0b3JcbiAqIEBleHRlbmRzIER5Z3JhcGguRGF0YUhhbmRsZXJzLkJhcnNIYW5kbGVyXG4gKi9cbnZhciBDdXN0b21CYXJzSGFuZGxlciA9IGZ1bmN0aW9uKCkge1xufTtcblxuQ3VzdG9tQmFyc0hhbmRsZXIucHJvdG90eXBlID0gbmV3IEJhcnNIYW5kbGVyKCk7XG5cbi8qKiBAaW5oZXJpdERvYyAqL1xuQ3VzdG9tQmFyc0hhbmRsZXIucHJvdG90eXBlLmV4dHJhY3RTZXJpZXMgPSBmdW5jdGlvbihyYXdEYXRhLCBpLCBvcHRpb25zKSB7XG4gIC8vIFRPRE8oZGFudmspOiBwcmUtYWxsb2NhdGUgc2VyaWVzIGhlcmUuXG4gIHZhciBzZXJpZXMgPSBbXTtcbiAgdmFyIHgsIHksIHBvaW50O1xuICBjb25zdCBzZXJpZXNMYWJlbCA9IG9wdGlvbnMuZ2V0KFwibGFiZWxzXCIpW2ldO1xuICBjb25zdCBsb2dTY2FsZSA9IG9wdGlvbnMuZ2V0Rm9yU2VyaWVzKFwibG9nc2NhbGVcIiwgc2VyaWVzTGFiZWwpO1xuICBmb3IgKCB2YXIgaiA9IDA7IGogPCByYXdEYXRhLmxlbmd0aDsgaisrKSB7XG4gICAgeCA9IHJhd0RhdGFbal1bMF07XG4gICAgcG9pbnQgPSByYXdEYXRhW2pdW2ldO1xuICAgIGlmIChsb2dTY2FsZSAmJiBwb2ludCAhPT0gbnVsbCkge1xuICAgICAgLy8gT24gdGhlIGxvZyBzY2FsZSwgcG9pbnRzIGxlc3MgdGhhbiB6ZXJvIGRvIG5vdCBleGlzdC5cbiAgICAgIC8vIFRoaXMgd2lsbCBjcmVhdGUgYSBnYXAgaW4gdGhlIGNoYXJ0LlxuICAgICAgaWYgKHBvaW50WzBdIDw9IDAgfHwgcG9pbnRbMV0gPD0gMCB8fCBwb2ludFsyXSA8PSAwKSB7XG4gICAgICAgIHBvaW50ID0gbnVsbDtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gRXh0cmFjdCB0byB0aGUgdW5pZmllZCBkYXRhIGZvcm1hdC5cbiAgICBpZiAocG9pbnQgIT09IG51bGwpIHtcbiAgICAgIHkgPSBwb2ludFsxXTtcbiAgICAgIGlmICh5ICE9PSBudWxsICYmICFpc05hTih5KSkge1xuICAgICAgICBzZXJpZXMucHVzaChbIHgsIHksIFsgcG9pbnRbMF0sIHBvaW50WzJdIF0gXSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZXJpZXMucHVzaChbIHgsIHksIFsgeSwgeSBdIF0pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBzZXJpZXMucHVzaChbIHgsIG51bGwsIFsgbnVsbCwgbnVsbCBdIF0pO1xuICAgIH1cbiAgfVxuICByZXR1cm4gc2VyaWVzO1xufTtcblxuLyoqIEBpbmhlcml0RG9jICovXG5DdXN0b21CYXJzSGFuZGxlci5wcm90b3R5cGUucm9sbGluZ0F2ZXJhZ2UgPVxuICAgIGZ1bmN0aW9uKG9yaWdpbmFsRGF0YSwgcm9sbFBlcmlvZCwgb3B0aW9ucywgaSkge1xuICByb2xsUGVyaW9kID0gTWF0aC5taW4ocm9sbFBlcmlvZCwgb3JpZ2luYWxEYXRhLmxlbmd0aCk7XG4gIHZhciByb2xsaW5nRGF0YSA9IFtdO1xuICB2YXIgeSwgbG93LCBoaWdoLCBtaWQsY291bnQsIGksIGV4dHJlbWVzO1xuXG4gIGxvdyA9IDA7XG4gIG1pZCA9IDA7XG4gIGhpZ2ggPSAwO1xuICBjb3VudCA9IDA7XG4gIGZvciAoaSA9IDA7IGkgPCBvcmlnaW5hbERhdGEubGVuZ3RoOyBpKyspIHtcbiAgICB5ID0gb3JpZ2luYWxEYXRhW2ldWzFdO1xuICAgIGV4dHJlbWVzID0gb3JpZ2luYWxEYXRhW2ldWzJdO1xuICAgIHJvbGxpbmdEYXRhW2ldID0gb3JpZ2luYWxEYXRhW2ldO1xuXG4gICAgaWYgKHkgIT09IG51bGwgJiYgIWlzTmFOKHkpKSB7XG4gICAgICBsb3cgKz0gZXh0cmVtZXNbMF07XG4gICAgICBtaWQgKz0geTtcbiAgICAgIGhpZ2ggKz0gZXh0cmVtZXNbMV07XG4gICAgICBjb3VudCArPSAxO1xuICAgIH1cbiAgICBpZiAoaSAtIHJvbGxQZXJpb2QgPj0gMCkge1xuICAgICAgdmFyIHByZXYgPSBvcmlnaW5hbERhdGFbaSAtIHJvbGxQZXJpb2RdO1xuICAgICAgaWYgKHByZXZbMV0gIT09IG51bGwgJiYgIWlzTmFOKHByZXZbMV0pKSB7XG4gICAgICAgIGxvdyAtPSBwcmV2WzJdWzBdO1xuICAgICAgICBtaWQgLT0gcHJldlsxXTtcbiAgICAgICAgaGlnaCAtPSBwcmV2WzJdWzFdO1xuICAgICAgICBjb3VudCAtPSAxO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoY291bnQpIHtcbiAgICAgIHJvbGxpbmdEYXRhW2ldID0gW1xuICAgICAgICAgIG9yaWdpbmFsRGF0YVtpXVswXSxcbiAgICAgICAgICAxLjAgKiBtaWQgLyBjb3VudCxcbiAgICAgICAgICBbIDEuMCAqIGxvdyAvIGNvdW50LFxuICAgICAgICAgICAgMS4wICogaGlnaCAvIGNvdW50IF0gXTtcbiAgICB9IGVsc2Uge1xuICAgICAgcm9sbGluZ0RhdGFbaV0gPSBbIG9yaWdpbmFsRGF0YVtpXVswXSwgbnVsbCwgWyBudWxsLCBudWxsIF0gXTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcm9sbGluZ0RhdGE7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBDdXN0b21CYXJzSGFuZGxlcjtcbiJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLFlBQVk7O0FBQUM7RUFBQTtBQUFBO0FBQUE7QUFFYjtBQUFpQztBQUVqQztBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUlBLGlCQUFpQixHQUFHLFNBQXBCQSxpQkFBaUIsR0FBYyxDQUNuQyxDQUFDO0FBRURBLGlCQUFpQixDQUFDQyxTQUFTLEdBQUcsSUFBSUMsZ0JBQVcsRUFBRTs7QUFFL0M7QUFDQUYsaUJBQWlCLENBQUNDLFNBQVMsQ0FBQ0UsYUFBYSxHQUFHLFVBQVNDLE9BQU8sRUFBRUMsQ0FBQyxFQUFFQyxPQUFPLEVBQUU7RUFDeEU7RUFDQSxJQUFJQyxNQUFNLEdBQUcsRUFBRTtFQUNmLElBQUlDLENBQUMsRUFBRUMsQ0FBQyxFQUFFQyxLQUFLO0VBQ2YsSUFBTUMsV0FBVyxHQUFHTCxPQUFPLENBQUNNLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQ1AsQ0FBQyxDQUFDO0VBQzVDLElBQU1RLFFBQVEsR0FBR1AsT0FBTyxD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