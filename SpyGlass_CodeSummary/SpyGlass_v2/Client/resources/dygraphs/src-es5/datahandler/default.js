/**
 * @license
 * Copyright 2013 David Eberlein (david.eberlein@ch.sauter-bc.com)
 * MIT-licenced: https://opensource.org/licenses/MIT
 */

/**
 * @fileoverview DataHandler default implementation used for simple line charts.
 * @author David Eberlein (david.eberlein@ch.sauter-bc.com)
 */

/*global Dygraph:false */
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _datahandler = _interopRequireDefault(require("./datahandler"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
/**
 * @constructor
 * @extends Dygraph.DataHandler
 */
var DefaultHandler = function DefaultHandler() {};
DefaultHandler.prototype = new _datahandler["default"]();

/** @inheritDoc */
DefaultHandler.prototype.extractSeries = function (rawData, i, options) {
  // TODO(danvk): pre-allocate series here.
  var series = [];
  var seriesLabel = options.get("labels")[i];
  var logScale = options.getForSeries("logscale", seriesLabel);
  for (var j = 0; j < rawData.length; j++) {
    var x = rawData[j][0];
    var point = rawData[j][i];
    if (logScale) {
      // On the log scale, points less than zero do not exist.
      // This will create a gap in the chart.
      if (point <= 0) {
        point = null;
      }
    }
    series.push([x, point]);
  }
  return series;
};

/** @inheritDoc */
DefaultHandler.prototype.rollingAverage = function (originalData, rollPeriod, options, i) {
  rollPeriod = Math.min(rollPeriod, originalData.length);
  var rollingData = [];
  var i, j, y, sum, num_ok;
  // Calculate the rolling average for the first rollPeriod - 1 points
  // where
  // there is not enough data to roll over the full number of points
  if (rollPeriod == 1) {
    return originalData;
  }
  for (i = 0; i < originalData.length; i++) {
    sum = 0;
    num_ok = 0;
    for (j = Math.max(0, i - rollPeriod + 1); j < i + 1; j++) {
      y = originalData[j][1];
      if (y === null || isNaN(y)) continue;
      num_ok++;
      sum += originalData[j][1];
    }
    if (num_ok) {
      rollingData[i] = [originalData[i][0], sum / num_ok];
    } else {
      rollingData[i] = [originalData[i][0], null];
    }
  }
  return rollingData;
};

/** @inheritDoc */
DefaultHandler.prototype.getExtremeYValues = function getExtremeYValues(series, dateWindow, stepPlot) {
  var minY = null,
    maxY = null,
    y;
  var firstIdx = 0,
    lastIdx = series.length - 1;
  for (var j = firstIdx; j <= lastIdx; j++) {
    y = series[j][1];
    if (y === null || isNaN(y)) continue;
    if (maxY === null || y > maxY) {
      maxY = y;
    }
    if (minY === null || y < minY) {
      minY = y;
    }
  }
  return [minY, maxY];
};
var _default = DefaultHandler;
exports["default"] = _default;
module.exports = exports.default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZWZhdWx0SGFuZGxlciIsInByb3RvdHlwZSIsIkR5Z3JhcGhEYXRhSGFuZGxlciIsImV4dHJhY3RTZXJpZXMiLCJyYXdEYXRhIiwiaSIsIm9wdGlvbnMiLCJzZXJpZXMiLCJzZXJpZXNMYWJlbCIsImdldCIsImxvZ1NjYWxlIiwiZ2V0Rm9yU2VyaWVzIiwiaiIsImxlbmd0aCIsIngiLCJwb2ludCIsInB1c2giLCJyb2xsaW5nQXZlcmFnZSIsIm9yaWdpbmFsRGF0YSIsInJvbGxQZXJpb2QiLCJNYXRoIiwibWluIiwicm9sbGluZ0RhdGEiLCJ5Iiwic3VtIiwibnVtX29rIiwibWF4IiwiaXNOYU4iLCJnZXRFeHRyZW1lWVZhbHVlcyIsImRhdGVXaW5kb3ciLCJzdGVwUGxvdCIsIm1pblkiLCJtYXhZIiwiZmlyc3RJZHgiLCJsYXN0SWR4Il0sInNvdXJjZXMiOlsiLi4vLi4vc3JjL2RhdGFoYW5kbGVyL2RlZmF1bHQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IDIwMTMgRGF2aWQgRWJlcmxlaW4gKGRhdmlkLmViZXJsZWluQGNoLnNhdXRlci1iYy5jb20pXG4gKiBNSVQtbGljZW5jZWQ6IGh0dHBzOi8vb3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvTUlUXG4gKi9cblxuLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IERhdGFIYW5kbGVyIGRlZmF1bHQgaW1wbGVtZW50YXRpb24gdXNlZCBmb3Igc2ltcGxlIGxpbmUgY2hhcnRzLlxuICogQGF1dGhvciBEYXZpZCBFYmVybGVpbiAoZGF2aWQuZWJlcmxlaW5AY2guc2F1dGVyLWJjLmNvbSlcbiAqL1xuXG4vKmdsb2JhbCBEeWdyYXBoOmZhbHNlICovXG5cInVzZSBzdHJpY3RcIjtcblxuaW1wb3J0IER5Z3JhcGhEYXRhSGFuZGxlciBmcm9tICcuL2RhdGFoYW5kbGVyJztcblxuLyoqXG4gKiBAY29uc3RydWN0b3JcbiAqIEBleHRlbmRzIER5Z3JhcGguRGF0YUhhbmRsZXJcbiAqL1xudmFyIERlZmF1bHRIYW5kbGVyID0gZnVuY3Rpb24oKSB7XG59O1xuXG5EZWZhdWx0SGFuZGxlci5wcm90b3R5cGUgPSBuZXcgRHlncmFwaERhdGFIYW5kbGVyKCk7XG5cbi8qKiBAaW5oZXJpdERvYyAqL1xuRGVmYXVsdEhhbmRsZXIucHJvdG90eXBlLmV4dHJhY3RTZXJpZXMgPSBmdW5jdGlvbihyYXdEYXRhLCBpLCBvcHRpb25zKSB7XG4gIC8vIFRPRE8oZGFudmspOiBwcmUtYWxsb2NhdGUgc2VyaWVzIGhlcmUuXG4gIHZhciBzZXJpZXMgPSBbXTtcbiAgY29uc3Qgc2VyaWVzTGFiZWwgPSBvcHRpb25zLmdldChcImxhYmVsc1wiKVtpXTtcbiAgY29uc3QgbG9nU2NhbGUgPSBvcHRpb25zLmdldEZvclNlcmllcyhcImxvZ3NjYWxlXCIsIHNlcmllc0xhYmVsKTtcbiAgZm9yICggdmFyIGogPSAwOyBqIDwgcmF3RGF0YS5sZW5ndGg7IGorKykge1xuICAgIHZhciB4ID0gcmF3RGF0YVtqXVswXTtcbiAgICB2YXIgcG9pbnQgPSByYXdEYXRhW2pdW2ldO1xuICAgIGlmIChsb2dTY2FsZSkge1xuICAgICAgLy8gT24gdGhlIGxvZyBzY2FsZSwgcG9pbnRzIGxlc3MgdGhhbiB6ZXJvIGRvIG5vdCBleGlzdC5cbiAgICAgIC8vIFRoaXMgd2lsbCBjcmVhdGUgYSBnYXAgaW4gdGhlIGNoYXJ0LlxuICAgICAgaWYgKHBvaW50IDw9IDApIHtcbiAgICAgICAgcG9pbnQgPSBudWxsO1xuICAgICAgfVxuICAgIH1cbiAgICBzZXJpZXMucHVzaChbIHgsIHBvaW50IF0pO1xuICB9XG4gIHJldHVybiBzZXJpZXM7XG59O1xuXG4vKiogQGluaGVyaXREb2MgKi9cbkRlZmF1bHRIYW5kbGVyLnByb3RvdHlwZS5yb2xsaW5nQXZlcmFnZSA9IGZ1bmN0aW9uKG9yaWdpbmFsRGF0YSwgcm9sbFBlcmlvZCxcbiAgICBvcHRpb25zLCBpKSB7XG4gIHJvbGxQZXJpb2QgPSBNYXRoLm1pbihyb2xsUGVyaW9kLCBvcmlnaW5hbERhdGEubGVuZ3RoKTtcbiAgdmFyIHJvbGxpbmdEYXRhID0gW107XG5cbiAgdmFyIGksIGosIHksIHN1bSwgbnVtX29rO1xuICAvLyBDYWxjdWxhdGUgdGhlIHJvbGxpbmcgYXZlcmFnZSBmb3IgdGhlIGZpcnN0IHJvbGxQZXJpb2QgLSAxIHBvaW50c1xuICAvLyB3aGVyZVxuICAvLyB0aGVyZSBpcyBub3QgZW5vdWdoIGRhdGEgdG8gcm9sbCBvdmVyIHRoZSBmdWxsIG51bWJlciBvZiBwb2ludHNcbiAgaWYgKHJvbGxQZXJpb2QgPT0gMSkge1xuICAgIHJldHVybiBvcmlnaW5hbERhdGE7XG4gIH1cbiAgZm9yIChpID0gMDsgaSA8IG9yaWdpbmFsRGF0YS5sZW5ndGg7IGkrKykge1xuICAgIHN1bSA9IDA7XG4gICAgbnVtX29rID0gMDtcbiAgICBmb3IgKGogPSBNYXRoLm1heCgwLCBpIC0gcm9sbFBlcmlvZCArIDEpOyBqIDwgaSArIDE7IGorKykge1xuICAgICAgeSA9IG9yaWdpbmFsRGF0YVtqXVsxXTtcbiAgICAgIGlmICh5ID09PSBudWxsIHx8IGlzTmFOKHkpKVxuICAgICAgICBjb250aW51ZTtcbiAgICAgIG51bV9vaysrO1xuICAgICAgc3VtICs9IG9yaWdpbmFsRGF0YVtqXVsxXTtcbiAgICB9XG4gICAgaWYgKG51bV9vaykge1xuICAgICAgcm9sbGluZ0RhdGFbaV0gPSBbIG9yaWdpbmFsRGF0YVtpXVswXSwgc3VtIC8gbnVtX29rIF07XG4gICAgfSBlbHNlIHtcbiAgICAgIHJvbGxpbmdEYXRhW2ldID0gWyBvcmlnaW5hbERhdGFbaV1bMF0sIG51bGwgXTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcm9sbGluZ0RhdGE7XG59O1xuXG4vKiogQGluaGVyaXREb2MgKi9cbkRlZmF1bHRIYW5kbGVyLnByb3RvdHlwZS5nZXRFeHRyZW1lWVZhbHVlcyA9IGZ1bmN0aW9uIGdldEV4dHJlbWVZVmFsdWVzKHNlcmllcywgZGF0ZVdpbmRvdywgc3RlcFBsb3QpIHtcbiAgdmFyIG1pblkgPSBudWxsLCBtYXhZID0gbnVsbCwgeTtcbiAgdmFyIGZpcnN0SWR4ID0gMCwgbGFzdElkeCA9IHNlcmllcy5sZW5ndGggLSAxO1xuXG4gIGZvciAoIHZhciBqID0gZmlyc3RJZHg7IGogPD0gbGFzdElkeDsgaisrKSB7XG4gICAgeSA9IHNlcmllc1tqXVsxXTtcbiAgICBpZiAoeSA9PT0gbnVsbCB8fCBpc05hTih5KSlcbiAgICAgIGNvbnRpbnVlO1xuICAgIGlmIChtYXhZID09PSBudWxsIHx8IHkgPiBtYXhZKSB7XG4gICAgICBtYXhZID0geTtcbiAgICB9XG4gICAgaWYgKG1pblkgPT09IG51bGwgfHwgeSA8IG1pblkpIHtcbiAgICAgIG1pblkgPSB5O1xuICAgIH1cbiAgfVxuICByZXR1cm4gWyBtaW5ZLCBtYXhZIF07XG59O1xuXG5leHBvcnQgZGVmYXVsdCBEZWZhdWx0SGFuZGxlcjtcbiJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLFlBQVk7O0FBQUM7RUFBQTtBQUFBO0FBQUE7QUFFYjtBQUErQztBQUUvQztBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUlBLGNBQWMsR0FBRyxTQUFqQkEsY0FBYyxHQUFjLENBQ2hDLENBQUM7QUFFREEsY0FBYyxDQUFDQyxTQUFTLEdBQUcsSUFBSUMsdUJBQWtCLEVBQUU7O0FBRW5EO0FBQ0FGLGNBQWMsQ0FBQ0MsU0FBUyxDQUFDRSxhQUFhLEdBQUcsVUFBU0MsT0FBTyxFQUFFQyxDQUFDLEVBQUVDLE9BQU8sRUFBRTtFQUNyRTtFQUNBLElBQUlDLE1BQU0sR0FBRyxFQUFFO0VBQ2YsSUFBTUMsV0FBVyxHQUFHRixPQUFPLENBQUNHLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQ0osQ0FBQyxDQUFDO0VBQzVDLElBQU1LLFFBQVEsR0FBR0osT0FBTyxDQUFDSyxZQUFZLENBQUMsVUFBVSxFQUFFSCxXQUFXLENBQUM7RUFDOUQsS0FBTSxJQUFJSSxDQUFDLEdBQUcsQ0FB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