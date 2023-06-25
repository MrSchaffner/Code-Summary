/**
 * @license
 * Copyright 2012 Dan Vanderkam (danvdk@gmail.com)
 * MIT-licenced: https://opensource.org/licenses/MIT
 */

/*global Dygraph:false */

'use strict';

/*
Bits of jankiness:
- Direct layout access
- Direct area access
- Should include calculation of ticks, not just the drawing.

Options left to make axis-friendly.
  ('drawAxesAtZero')
  ('xAxisHeight')
*/
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var utils = _interopRequireWildcard(require("../dygraph-utils"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
/**
 * Draws the axes. This includes the labels on the x- and y-axes, as well
 * as the tick marks on the axes.
 * It does _not_ draw the grid lines which span the entire chart.
 */
var axes = function axes() {
  this.xlabels_ = [];
  this.ylabels_ = [];
};
axes.prototype.toString = function () {
  return 'Axes Plugin';
};
axes.prototype.activate = function (g) {
  return {
    layout: this.layout,
    clearChart: this.clearChart,
    willDrawChart: this.willDrawChart
  };
};
axes.prototype.layout = function (e) {
  var g = e.dygraph;
  if (g.getOptionForAxis('drawAxis', 'y')) {
    var w = g.getOptionForAxis('axisLabelWidth', 'y') + 2 * g.getOptionForAxis('axisTickSize', 'y');
    e.reserveSpaceLeft(w);
  }
  if (g.getOptionForAxis('drawAxis', 'x')) {
    var h;
    // NOTE: I think this is probably broken now, since g.getOption() now
    // hits the dictionary. (That is, g.getOption('xAxisHeight') now always
    // has a value.)
    if (g.getOption('xAxisHeight')) {
      h = g.getOption('xAxisHeight');
    } else {
      h = g.getOptionForAxis('axisLabelFontSize', 'x') + 2 * g.getOptionForAxis('axisTickSize', 'x');
    }
    e.reserveSpaceBottom(h);
  }
  if (g.numAxes() == 2) {
    if (g.getOptionForAxis('drawAxis', 'y2')) {
      var w = g.getOptionForAxis('axisLabelWidth', 'y2') + 2 * g.getOptionForAxis('axisTickSize', 'y2');
      e.reserveSpaceRight(w);
    }
  } else if (g.numAxes() > 2) {
    g.error('Only two y-axes are supported at this time. (Trying ' + 'to use ' + g.numAxes() + ')');
  }
};
axes.prototype.detachLabels = function () {
  function removeArray(ary) {
    for (var i = 0; i < ary.length; i++) {
      var el = ary[i];
      if (el.parentNode) el.parentNode.removeChild(el);
    }
  }
  removeArray(this.xlabels_);
  removeArray(this.ylabels_);
  this.xlabels_ = [];
  this.ylabels_ = [];
};
axes.prototype.clearChart = function (e) {
  this.detachLabels();
};
axes.prototype.willDrawChart = function (e) {
  var g = e.dygraph;
  if (!g.getOptionForAxis('drawAxis', 'x') && !g.getOptionForAxis('drawAxis', 'y') && !g.getOptionForAxis('drawAxis', 'y2')) {
    return;
  }

  // Round pixels to half-integer boundaries for crisper drawing.
  function halfUp(x) {
    return Math.round(x) + 0.5;
  }
  function halfDown(y) {
    return Math.round(y) - 0.5;
  }
  var context = e.drawingContext;
  var containerDiv = e.canvas.parentNode;
  var canvasWidth = g.width_; // e.canvas.width is affected by pixel ratio.
  var canvasHeight = g.height_;
  var label, x, y, tick, i;
  var makeLabelStyle = function makeLabelStyle(axis) {
    return {
      position: 'absolute',
      fontSize: g.getOptionForAxis('axisLabelFontSize', axis) + 'px',
      width: g.getOptionForAxis('axisLabelWidth', axis) + 'px'
    };
  };
  var labelStyles = {
    x: makeLabelStyle('x'),
    y: makeLabelStyle('y'),
    y2: makeLabelStyle('y2')
  };
  var makeDiv = function makeDiv(txt, axis, prec_axis) {
    /*
     * This seems to be called with the following three sets of axis/prec_axis:
     * x: undefined
     * y: y1
     * y: y2
     */
    var div = document.createElement('div');
    var labelStyle = labelStyles[prec_axis == 'y2' ? 'y2' : axis];
    utils.update(div.style, labelStyle);
    // TODO: combine outer & inner divs
    var inner_div = document.createElement('div');
    inner_div.className = 'dygraph-axis-label' + ' dygraph-axis-label-' + axis + (prec_axis ? ' dygraph-axis-label-' + prec_axis : '');
    inner_div.innerHTML = txt;
    div.appendChild(inner_div);
    return div;
  };

  // axis lines
  context.save();
  var layout = g.layout_;
  var area = e.dygraph.plotter_.area;

  // Helper for repeated axis-option accesses.
  var makeOptionGetter = function makeOptionGetter(axis) {
    return function (option) {
      return g.getOptionForAxis(option, axis);
    };
  };
  var that = this;
  if (g.getOptionForAxis('drawAxis', 'y') || g.numAxes() == 2 && g.getOptionForAxis('drawAxis', 'y2')) {
    if (layout.yticks && layout.yticks.length > 0) {
      var num_axes = g.numAxes();
      var getOptions = [makeOptionGetter('y'), makeOptionGetter('y2')];
      layout.yticks.forEach(function (tick) {
        if (tick.label === undefined) return; // this tick only has a grid line.
        x = area.x;
        var sgn = 1;
        var prec_axis = 'y1';
        var getAxisOption = getOptions[0];
        if (tick.axis == 1) {
          // right-side y-axis
          x = area.x + area.w;
          sgn = -1;
          prec_axis = 'y2';
          getAxisOption = getOptions[1];
        }
        if (!getAxisOption('drawAxis')) return;
        var fontSize = getAxisOption('axisLabelFontSize');
        y = area.y + tick.pos * area.h;

        /* Tick marks are currently clipped, so don't bother drawing them.
        context.beginPath();
        context.moveTo(halfUp(x), halfDown(y));
        context.lineTo(halfUp(x - sgn * that.attr_('axisTickSize')), halfDown(y));
        context.closePath();
        context.stroke();
        */

        label = makeDiv(tick.label, 'y', num_axes == 2 ? prec_axis : null);
        var top = y - fontSize / 2;
        if (top < 0) top = 0;
        if (top + fontSize + 3 > canvasHeight) {
          label.style.bottom = '0';
        } else {
          // The lowest tick on the y-axis often overlaps with the leftmost
          // tick on the x-axis. Shift the bottom tick up a little bit to
          // compensate if necessary.
          label.style.top = Math.min(top, canvasHeight - 2 * fontSize) + 'px';
        }
        // TODO: replace these with css classes?
        if (tick.axis === 0) {
          label.style.left = area.x - getAxisOption('axisLabelWidth') - getAxisOption('axisTickSize') + 'px';
          label.style.textAlign = 'right';
        } else if (tick.axis == 1) {
          label.style.left = area.x + area.w + getAxisOption('axisTickSize') + 'px';
          label.style.textAlign = 'left';
        }
        label.style.width = getAxisOption('axisLabelWidth') + 'px';
        containerDiv.appendChild(label);
        that.ylabels_.push(label);
      });
    }

    // draw a vertical line on the left to separate the chart from the labels.
    var axisX;
    if (g.getOption('drawAxesAtZero')) {
      var r = g.toPercentXCoord(0);
      if (r > 1 || r < 0 || isNaN(r)) r = 0;
      axisX = halfUp(area.x + r * area.w);
    } else {
      axisX = halfUp(area.x);
    }
    context.strokeStyle = g.getOptionForAxis('axisLineColor', 'y');
    context.lineWidth = g.getOptionForAxis('axisLineWidth', 'y');
    context.beginPath();
    context.moveTo(axisX, halfDown(area.y));
    context.lineTo(axisX, halfDown(area.y + area.h));
    context.closePath();
    context.stroke();

    // if there's a secondary y-axis, draw a vertical line for that, too.
    if (g.numAxes() == 2 && g.getOptionForAxis('drawAxis', 'y2')) {
      context.strokeStyle = g.getOptionForAxis('axisLineColor', 'y2');
      context.lineWidth = g.getOptionForAxis('axisLineWidth', 'y2');
      context.beginPath();
      context.moveTo(halfDown(area.x + area.w), halfDown(area.y));
      context.lineTo(halfDown(area.x + area.w), halfDown(area.y + area.h));
      context.closePath();
      context.stroke();
    }
  }
  if (g.getOptionForAxis('drawAxis', 'x')) {
    if (layout.xticks) {
      var getAxisOption = makeOptionGetter('x');
      layout.xticks.forEach(function (tick) {
        if (tick.label === undefined) return; // this tick only has a grid line.
        x = area.x + tick.pos * area.w;
        y = area.y + area.h;

        /* Tick marks are currently clipped, so don't bother drawing them.
        context.beginPath();
        context.moveTo(halfUp(x), halfDown(y));
        context.lineTo(halfUp(x), halfDown(y + that.attr_('axisTickSize')));
        context.closePath();
        context.stroke();
        */

        label = makeDiv(tick.label, 'x');
        label.style.textAlign = 'center';
        label.style.top = y + getAxisOption('axisTickSize') + 'px';
        var left = x - getAxisOption('axisLabelWidth') / 2;
        if (left + getAxisOption('axisLabelWidth') > canvasWidth) {
          left = canvasWidth - getAxisOption('axisLabelWidth');
          label.style.textAlign = 'right';
        }
        if (left < 0) {
          left = 0;
          label.style.textAlign = 'left';
        }
        label.style.left = left + 'px';
        label.style.width = getAxisOption('axisLabelWidth') + 'px';
        containerDiv.appendChild(label);
        that.xlabels_.push(label);
      });
    }
    context.strokeStyle = g.getOptionForAxis('axisLineColor', 'x');
    context.lineWidth = g.getOptionForAxis('axisLineWidth', 'x');
    context.beginPath();
    var axisY;
    if (g.getOption('drawAxesAtZero')) {
      var r = g.toPercentYCoord(0, 0);
      if (r > 1 || r < 0) r = 1;
      axisY = halfDown(area.y + r * area.h);
    } else {
      axisY = halfDown(area.y + area.h);
    }
    context.moveTo(halfUp(area.x), axisY);
    context.lineTo(halfUp(area.x + area.w), axisY);
    context.closePath();
    context.stroke();
  }
  context.restore();
};
var _default = axes;
exports["default"] = _default;
module.exports = exports.default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJheGVzIiwieGxhYmVsc18iLCJ5bGFiZWxzXyIsInByb3RvdHlwZSIsInRvU3RyaW5nIiwiYWN0aXZhdGUiLCJnIiwibGF5b3V0IiwiY2xlYXJDaGFydCIsIndpbGxEcmF3Q2hhcnQiLCJlIiwiZHlncmFwaCIsImdldE9wdGlvbkZvckF4aXMiLCJ3IiwicmVzZXJ2ZVNwYWNlTGVmdCIsImgiLCJnZXRPcHRpb24iLCJyZXNlcnZlU3BhY2VCb3R0b20iLCJudW1BeGVzIiwicmVzZXJ2ZVNwYWNlUmlnaHQiLCJlcnJvciIsImRldGFjaExhYmVscyIsInJlbW92ZUFycmF5IiwiYXJ5IiwiaSIsImxlbmd0aCIsImVsIiwicGFyZW50Tm9kZSIsInJlbW92ZUNoaWxkIiwiaGFsZlVwIiwieCIsIk1hdGgiLCJyb3VuZCIsImhhbGZEb3duIiwieSIsImNvbnRleHQiLCJkcmF3aW5nQ29udGV4dCIsImNvbnRhaW5lckRpdiIsImNhbnZhcyIsImNhbnZhc1dpZHRoIiwid2lkdGhfIiwiY2FudmFzSGVpZ2h0IiwiaGVpZ2h0XyIsImxhYmVsIiwidGljayIsIm1ha2VMYWJlbFN0eWxlIiwiYXhpcyIsInBvc2l0aW9uIiwiZm9udFNpemUiLCJ3aWR0aCIsImxhYmVsU3R5bGVzIiwieTIiLCJtYWtlRGl2IiwidHh0IiwicHJlY19heGlzIiwiZGl2IiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50IiwibGFiZWxTdHlsZSIsInV0aWxzIiwidXBkYXRlIiwic3R5bGUiLCJpbm5lcl9kaXYiLCJjbGFzc05hbWUiLCJpbm5lckhUTUwiLCJhcHBlbmRDaGlsZCIsInNhdmUiLCJsYXlvdXRfIiwiYXJlYSIsInBsb3R0ZXJfIiwibWFrZU9wdGlvbkdldHRlciIsIm9wdGlvbiIsInRoYXQiLCJ5dGlja3MiLCJudW1fYXhlcyIsImdldE9wdGlvbnMiLCJmb3JFYWNoIiwidW5kZWZpbmVkIiwic2duIiwiZ2V0QXhpc09wdGlvbiIsInBvcyIsInRvcCIsImJvdHRvbSIsIm1pbiIsImxlZnQiLCJ0ZXh0QWxpZ24iLCJwdXNoIiwiYXhpc1giLCJyIiwidG9QZXJjZW50WENvb3JkIiwiaXNOYU4iLCJzdHJva2VTdHlsZSIsImxpbmVXaWR0aCIsImJlZ2luUGF0aCIsIm1vdmVUbyIsImxpbmVUbyIsImNsb3NlUGF0aCIsInN0cm9rZSIsInh0aWNrcyIsImF4aXNZIiwidG9QZXJjZW50WUNvb3JkIiwicmVzdG9yZSJdLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wbHVnaW5zL2F4ZXMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IDIwMTIgRGFuIFZhbmRlcmthbSAoZGFudmRrQGdtYWlsLmNvbSlcbiAqIE1JVC1saWNlbmNlZDogaHR0cHM6Ly9vcGVuc291cmNlLm9yZy9saWNlbnNlcy9NSVRcbiAqL1xuXG4vKmdsb2JhbCBEeWdyYXBoOmZhbHNlICovXG5cbid1c2Ugc3RyaWN0JztcblxuLypcbkJpdHMgb2YgamFua2luZXNzOlxuLSBEaXJlY3QgbGF5b3V0IGFjY2Vzc1xuLSBEaXJlY3QgYXJlYSBhY2Nlc3Ncbi0gU2hvdWxkIGluY2x1ZGUgY2FsY3VsYXRpb24gb2YgdGlja3MsIG5vdCBqdXN0IHRoZSBkcmF3aW5nLlxuXG5PcHRpb25zIGxlZnQgdG8gbWFrZSBheGlzLWZyaWVuZGx5LlxuICAoJ2RyYXdBeGVzQXRaZXJvJylcbiAgKCd4QXhpc0hlaWdodCcpXG4qL1xuXG5pbXBvcnQgKiBhcyB1dGlscyBmcm9tICcuLi9keWdyYXBoLXV0aWxzJztcblxuLyoqXG4gKiBEcmF3cyB0aGUgYXhlcy4gVGhpcyBpbmNsdWRlcyB0aGUgbGFiZWxzIG9uIHRoZSB4LSBhbmQgeS1heGVzLCBhcyB3ZWxsXG4gKiBhcyB0aGUgdGljayBtYXJrcyBvbiB0aGUgYXhlcy5cbiAqIEl0IGRvZXMgX25vdF8gZHJhdyB0aGUgZ3JpZCBsaW5lcyB3aGljaCBzcGFuIHRoZSBlbnRpcmUgY2hhcnQuXG4gKi9cbnZhciBheGVzID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMueGxhYmVsc18gPSBbXTtcbiAgdGhpcy55bGFiZWxzXyA9IFtdO1xufTtcblxuYXhlcy5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuICdBeGVzIFBsdWdpbic7XG59O1xuXG5heGVzLnByb3RvdHlwZS5hY3RpdmF0ZSA9IGZ1bmN0aW9uKGcpIHtcbiAgcmV0dXJuIHtcbiAgICBsYXlvdXQ6IHRoaXMubGF5b3V0LFxuICAgIGNsZWFyQ2hhcnQ6IHRoaXMuY2xlYXJDaGFydCxcbiAgICB3aWxsRHJhd0NoYXJ0OiB0aGlzLndpbGxEcmF3Q2hhcnRcbiAgfTtcbn07XG5cbmF4ZXMucHJvdG90eXBlLmxheW91dCA9IGZ1bmN0aW9uKGUpIHtcbiAgdmFyIGcgPSBlLmR5Z3JhcGg7XG5cbiAgaWYgKGcuZ2V0T3B0aW9uRm9yQXhpcygnZHJhd0F4aXMnLCAneScpKSB7XG4gICAgdmFyIHcgPSBnLmdldE9wdGlvbkZvckF4aXMoJ2F4aXNMYWJlbFdpZHRoJywgJ3knKSArIDIgKiBnLmdldE9wdGlvbkZvckF4aXMoJ2F4aXNUaWNrU2l6ZScsICd5Jyk7XG4gICAgZS5yZXNlcnZlU3BhY2VMZWZ0KHcpO1xuICB9XG5cbiAgaWYgKGcuZ2V0T3B0aW9uRm9yQXhpcygnZHJhd0F4aXMnLCAneCcpKSB7XG4gICAgdmFyIGg7XG4gICAgLy8gTk9URTogSSB0aGluayB0aGlzIGlzIHByb2JhYmx5IGJyb2tlbiBub3csIHNpbmNlIGcuZ2V0T3B0aW9uKCkgbm93XG4gICAgLy8gaGl0cyB0aGUgZGljdGlvbmFyeS4gKFRoYXQgaXMsIGcuZ2V0T3B0aW9uKCd4QXhpc0hlaWdodCcpIG5vdyBhbHdheXNcbiAgICAvLyBoYXMgYSB2YWx1ZS4pXG4gICAgaWYgKGcuZ2V0T3B0aW9uKCd4QXhpc0hlaWdodCcpKSB7XG4gICAgICBoID0gZy5nZXRPcHRpb24oJ3hBeGlzSGVpZ2h0Jyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGggPSBnLmdldE9wdGlvbkZvckF4aXMoJ2F4aXNMYWJlbEZvbnRTaXplJywgJ3gnKSArIDIgKiBnLmdldE9wdGlvbkZvckF4aXMoJ2F4aXNUaWNrU2l6ZScsICd4Jyk7XG4gICAgfVxuICAgIGUucmVzZXJ2ZVNwYWNlQm90dG9tKGgpO1xuICB9XG5cbiAgaWYgKGcubnVtQXhlcygpID09IDIpIHtcbiAgICBpZiAoZy5nZXRPcHRpb25Gb3JBeGlzKCdkcmF3QXhpcycsICd5MicpKSB7XG4gICAgICB2YXIgdyA9IGcuZ2V0T3B0aW9uRm9yQXhpcygnYXhpc0xhYmVsV2lkdGgnLCAneTInKSArIDIgKiBnLmdldE9wdGlvbkZvckF4aXMoJ2F4aXNUaWNrU2l6ZScsICd5MicpO1xuICAgICAgZS5yZXNlcnZlU3BhY2VSaWdodCh3KTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoZy5udW1BeGVzKCkgPiAyKSB7XG4gICAgZy5lcnJvcignT25seSB0d28geS1heGVzIGFyZSBzdXBwb3J0ZWQgYXQgdGhpcyB0aW1lLiAoVHJ5aW5nICcgK1xuICAgICAgICAgICAgJ3RvIHVzZSAnICsgZy5udW1BeGVzKCkgKyAnKScpO1xuICB9XG59O1xuXG5heGVzLnByb3RvdHlwZS5kZXRhY2hMYWJlbHMgPSBmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gcmVtb3ZlQXJyYXkoYXJ5KSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnkubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBlbCA9IGFyeVtpXTtcbiAgICAgIGlmIChlbC5wYXJlbnROb2RlKSBlbC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGVsKTtcbiAgICB9XG4gIH1cblxuICByZW1vdmVBcnJheSh0aGlzLnhsYWJlbHNfKTtcbiAgcmVtb3ZlQXJyYXkodGhpcy55bGFiZWxzXyk7XG4gIHRoaXMueGxhYmVsc18gPSBbXTtcbiAgdGhpcy55bGFiZWxzXyA9IFtdO1xufTtcblxuYXhlcy5wcm90b3R5cGUuY2xlYXJDaGFydCA9IGZ1bmN0aW9uKGUpIHtcbiAgdGhpcy5kZXRhY2hMYWJlbHMoKTtcbn07XG5cbmF4ZXMucHJvdG90eXBlLndpbGxEcmF3Q2hhcnQgPSBmdW5jdGlvbihlKSB7XG4gIHZhciBnID0gZS5keWdyYXBoO1xuXG4gIGlmICghZy5nZXRPcHRpb25Gb3JBeGlzKCdkcmF3QXhpcycsICd4JykgJiZcbiAgICAgICFnLmdldE9wdGlvbkZvckF4aXMoJ2RyYXdBeGlzJywgJ3knKSAmJlxuICAgICAgIWcuZ2V0T3B0aW9uRm9yQXhpcygnZHJhd0F4aXMnLCAneTInKSkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIFJvdW5kIHBpeGVscyB0byBoYWxmLWludGVnZXIgYm91bmRhcmllcyBmb3IgY3Jpc3BlciBkcmF3aW5nLlxuICBmdW5jdGlvbiBoYWxmVXAoeCkgIHsgcmV0dXJuIE1hdGgucm91bmQoeCkgKyAwLjU7IH1cbiAgZnVuY3Rpb24gaGFsZkRvd24oeSl7IHJldHVybiBNYXRoLnJvdW5kKHkpIC0gMC41OyB9XG5cbiAgdmFyIGNvbnRleHQgPSBlLmRyYXdpbmdDb250ZXh0O1xuICB2YXIgY29udGFpbmVyRGl2ID0gZS5jYW52YXMucGFyZW50Tm9kZTtcbiAgdmFyIGNhbnZhc1dpZHRoID0gZy53aWR0aF87ICAvLyBlLmNhbnZhcy53aWR0aCBpcyBhZmZlY3RlZCBieSBwaXhlbCByYXRpby5cbiAgdmFyIGNhbnZhc0hlaWdodCA9IGcuaGVpZ2h0XztcblxuICB2YXIgbGFiZWwsIHgsIHksIHRpY2ssIGk7XG5cbiAgdmFyIG1ha2VMYWJlbFN0eWxlID0gZnVuY3Rpb24oYXhpcykge1xuICAgIHJldHVybiB7XG4gICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgIGZvbnRTaXplOiBnLmdldE9wdGlvbkZvckF4aXMoJ2F4aXNMYWJlbEZvbnRTaXplJywgYXhpcykgKyAncHgnLFxuICAgICAgd2lkdGg6IGcuZ2V0T3B0aW9uRm9yQXhpcygnYXhpc0xhYmVsV2lkdGgnLCBheGlzKSArICdweCcsXG4gICAgfTtcbiAgfTtcblxuICB2YXIgbGFiZWxTdHlsZXMgPSB7XG4gICAgeDogbWFrZUxhYmVsU3R5bGUoJ3gnKSxcbiAgICB5OiBtYWtlTGFiZWxTdHlsZSgneScpLFxuICAgIHkyOiBtYWtlTGFiZWxTdHlsZSgneTInKVxuICB9O1xuXG4gIHZhciBtYWtlRGl2ID0gZnVuY3Rpb24odHh0LCBheGlzLCBwcmVjX2F4aXMpIHtcbiAgICAvKlxuICAgICAqIFRoaXMgc2VlbXMgdG8gYmUgY2FsbGVkIHdpdGggdGhlIGZvbGxvd2luZyB0aHJlZSBzZXRzIG9mIGF4aXMvcHJlY19heGlzOlxuICAgICAqIHg6IHVuZGVmaW5lZFxuICAgICAqIHk6IHkxXG4gICAgICogeTogeTJcbiAgICAgKi9cbiAgICB2YXIgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgdmFyIGxhYmVsU3R5bGUgPSBsYWJlbFN0eWxlc1twcmVjX2F4aXMgPT0gJ3kyJyA/ICd5MicgOiBheGlzXTtcbiAgICB1dGlscy51cGRhdGUoZGl2LnN0eWxlLCBsYWJlbFN0eWxlKTtcbiAgICAvLyBUT0RPOiBjb21iaW5lIG91dGVyICYgaW5uZXIgZGl2c1xuICAgIHZhciBpbm5lcl9kaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBpbm5lcl9kaXYuY2xhc3NOYW1lID0gJ2R5Z3JhcGgtYXhpcy1sYWJlbCcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAnIGR5Z3JhcGgtYXhpcy1sYWJlbC0nICsgYXhpcyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgIChwcmVjX2F4aXMgPyAnIGR5Z3JhcGgtYXhpcy1sYWJlbC0nICsgcHJlY19heGlzIDogJycpO1xuICAgIGlubmVyX2Rpdi5pbm5lckhUTUwgPSB0eHQ7XG4gICAgZGl2LmFwcGVuZENoaWxkKGlubmVyX2Rpdik7XG4gICAgcmV0dXJuIGRpdjtcbiAgfTtcblxuICAvLyBheGlzIGxpbmVzXG4gIGNvbnRleHQuc2F2ZSgpO1xuXG4gIHZhciBsYXlvdXQgPSBnLmxheW91dF87XG4gIHZhciBhcmVhID0gZS5keWdyYXBoLnBsb3R0ZXJfLmFyZWE7XG5cbiAgLy8gSGVscGVyIGZvciByZXBlYXRlZCBheGlzLW9wdGlvbiBhY2Nlc3Nlcy5cbiAgdmFyIG1ha2VPcHRpb25HZXR0ZXIgPSBmdW5jdGlvbihheGlzKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKG9wdGlvbikge1xuICAgICAgcmV0dXJuIGcuZ2V0T3B0aW9uRm9yQXhpcyhvcHRpb24sIGF4aXMpO1xuICAgIH07XG4gIH07XG5cbiAgY29uc3QgdGhhdCA9IHRoaXM7XG5cbiAgaWYgKGcuZ2V0T3B0aW9uRm9yQXhpcygnZHJhd0F4aXMnLCAneScpIHx8XG4gICAgICAoZy5udW1BeGVzKCkgPT0gMiAmJiBnLmdldE9wdGlvbkZvckF4aXMoJ2RyYXdBeGlzJywgJ3kyJykpKSB7XG4gICAgaWYgKGxheW91dC55dGlja3MgJiYgbGF5b3V0Lnl0aWNrcy5sZW5ndGggPiAwKSB7XG4gICAgICB2YXIgbnVtX2F4ZXMgPSBnLm51bUF4ZXMoKTtcbiAgICAgIHZhciBnZXRPcHRpb25zID0gW21ha2VPcHRpb25HZXR0ZXIoJ3knKSwgbWFrZU9wdGlvbkdldHRlcigneTInKV07XG4gICAgICBsYXlvdXQueXRpY2tzLmZvckVhY2goZnVuY3Rpb24gKHRpY2spIHtcbiAgICAgICAgaWYgKHRpY2subGFiZWwgPT09IHVuZGVmaW5lZCkgcmV0dXJuOyAgLy8gdGhpcyB0aWNrIG9ubHkgaGFzIGEgZ3JpZCBsaW5lLlxuICAgICAgICB4ID0gYXJlYS54O1xuICAgICAgICB2YXIgc2duID0gMTtcbiAgICAgICAgdmFyIHByZWNfYXhpcyA9ICd5MSc7XG4gICAgICAgIHZhciBnZXRBeGlzT3B0aW9uID0gZ2V0T3B0aW9uc1swXTtcbiAgICAgICAgaWYgKHRpY2suYXhpcyA9PSAxKSB7ICAvLyByaWdodC1zaWRlIHktYXhpc1xuICAgICAgICAgIHggPSBhcmVhLnggKyBhcmVhLnc7XG4gICAgICAgICAgc2duID0gLTE7XG4gICAgICAgICAgcHJlY19heGlzID0gJ3kyJztcbiAgICAgICAgICBnZXRBeGlzT3B0aW9uID0gZ2V0T3B0aW9uc1sxXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWdldEF4aXNPcHRpb24oJ2RyYXdBeGlzJykpIHJldHVybjtcbiAgICAgICAgdmFyIGZvbnRTaXplID0gZ2V0QXhpc09wdGlvbignYXhpc0xhYmVsRm9udFNpemUnKTtcbiAgICAgICAgeSA9IGFyZWEueSArIHRpY2sucG9zICogYXJlYS5oO1xuXG4gICAgICAgIC8qIFRpY2sgbWFya3MgYXJlIGN1cnJlbnRseSBjbGlwcGVkLCBzbyBkb24ndCBib3RoZXIgZHJhd2luZyB0aGVtLlxuICAgICAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgICAgICBjb250ZXh0Lm1vdmVUbyhoYWxmVXAoeCksIGhhbGZEb3duKHkpKTtcbiAgICAgICAgY29udGV4dC5saW5lVG8oaGFsZlVwKHggLSBzZ24gKiB0aGF0LmF0dHJfKCdheGlzVGlja1NpemUnKSksIGhhbGZEb3duKHkpKTtcbiAgICAgICAgY29udGV4dC5jbG9zZVBhdGgoKTtcbiAgICAgICAgY29udGV4dC5zdHJva2UoKTtcbiAgICAgICAgKi9cblxuICAgICAgICBsYWJlbCA9IG1ha2VEaXYodGljay5sYWJlbCwgJ3knLCBudW1fYXhlcyA9PSAyID8gcHJlY19heGlzIDogbnVsbCk7XG4gICAgICAgIHZhciB0b3AgPSAoeSAtIGZvbnRTaXplIC8gMik7XG4gICAgICAgIGlmICh0b3AgPCAwKSB0b3AgPSAwO1xuXG4gICAgICAgIGlmICh0b3AgKyBmb250U2l6ZSArIDMgPiBjYW52YXNIZWlnaHQpIHtcbiAgICAgICAgICBsYWJlbC5zdHlsZS5ib3R0b20gPSAnMCc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gVGhlIGxvd2VzdCB0aWNrIG9uIHRoZSB5LWF4aXMgb2Z0ZW4gb3ZlcmxhcHMgd2l0aCB0aGUgbGVmdG1vc3RcbiAgICAgICAgICAvLyB0aWNrIG9uIHRoZSB4LWF4aXMuIFNoaWZ0IHRoZSBib3R0b20gdGljayB1cCBhIGxpdHRsZSBiaXQgdG9cbiAgICAgICAgICAvLyBjb21wZW5zYXRlIGlmIG5lY2Vzc2FyeS5cbiAgICAgICAgICBsYWJlbC5zdHlsZS50b3AgPSBNYXRoLm1pbih0b3AsIGNhbnZhc0hlaWdodCAtICgyICogZm9udFNpemUpKSArICdweCc7XG4gICAgICAgIH1cbiAgICAgICAgLy8gVE9ETzogcmVwbGFjZSB0aGVzZSB3aXRoIGNzcyBjbGFzc2VzP1xuICAgICAgICBpZiAodGljay5heGlzID09PSAwKSB7XG4gICAgICAgICAgbGFiZWwuc3R5bGUubGVmdCA9IChhcmVhLnggLSBnZXRBeGlzT3B0aW9uKCdheGlzTGFiZWxXaWR0aCcpIC0gZ2V0QXhpc09wdGlvbignYXhpc1RpY2tTaXplJykpICsgJ3B4JztcbiAgICAgICAgICBsYWJlbC5zdHlsZS50ZXh0QWxpZ24gPSAncmlnaHQnO1xuICAgICAgICB9IGVsc2UgaWYgKHRpY2suYXhpcyA9PSAxKSB7XG4gICAgICAgICAgbGFiZWwuc3R5bGUubGVmdCA9IChhcmVhLnggKyBhcmVhLncgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2V0QXhpc09wdGlvbignYXhpc1RpY2tTaXplJykpICsgJ3B4JztcbiAgICAgICAgICBsYWJlbC5zdHlsZS50ZXh0QWxpZ24gPSAnbGVmdCc7XG4gICAgICAgIH1cbiAgICAgICAgbGFiZWwuc3R5bGUud2lkdGggPSBnZXRBeGlzT3B0aW9uKCdheGlzTGFiZWxXaWR0aCcpICsgJ3B4JztcbiAgICAgICAgY29udGFpbmVyRGl2LmFwcGVuZENoaWxkKGxhYmVsKTtcbiAgICAgICAgdGhhdC55bGFiZWxzXy5wdXNoKGxhYmVsKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIGRyYXcgYSB2ZXJ0aWNhbCBsaW5lIG9uIHRoZSBsZWZ0IHRvIHNlcGFyYXRlIHRoZSBjaGFydCBmcm9tIHRoZSBsYWJlbHMuXG4gICAgdmFyIGF4aXNYO1xuICAgIGlmIChnLmdldE9wdGlvbignZHJhd0F4ZXNBdFplcm8nKSkge1xuICAgICAgdmFyIHIgPSBnLnRvUGVyY2VudFhDb29yZCgwKTtcbiAgICAgIGlmIChyID4gMSB8fCByIDwgMCB8fCBpc05hTihyKSkgciA9IDA7XG4gICAgICBheGlzWCA9IGhhbGZVcChhcmVhLnggKyByICogYXJlYS53KTtcbiAgICB9IGVsc2Uge1xuICAgICAgYXhpc1ggPSBoYWxmVXAoYXJlYS54KTtcbiAgICB9XG5cbiAgICBjb250ZXh0LnN0cm9rZVN0eWxlID0gZy5nZXRPcHRpb25Gb3JBeGlzKCdheGlzTGluZUNvbG9yJywgJ3knKTtcbiAgICBjb250ZXh0LmxpbmVXaWR0aCA9IGcuZ2V0T3B0aW9uRm9yQXhpcygnYXhpc0xpbmVXaWR0aCcsICd5Jyk7XG5cbiAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgIGNvbnRleHQubW92ZVRvKGF4aXNYLCBoYWxmRG93bihhcmVhLnkpKTtcbiAgICBjb250ZXh0LmxpbmVUbyhheGlzWCwgaGFsZkRvd24oYXJlYS55ICsgYXJlYS5oKSk7XG4gICAgY29udGV4dC5jbG9zZVBhdGgoKTtcbiAgICBjb250ZXh0LnN0cm9rZSgpO1xuXG4gICAgLy8gaWYgdGhlcmUncyBhIHNlY29uZGFyeSB5LWF4aXMsIGRyYXcgYSB2ZXJ0aWNhbCBsaW5lIGZvciB0aGF0LCB0b28uXG4gICAgaWYgKGcubnVtQXhlcygpID09IDIgJiYgZy5nZXRPcHRpb25Gb3JBeGlzKCdkcmF3QXhpcycsICd5MicpKSB7XG4gICAgICBjb250ZXh0LnN0cm9rZVN0eWxlID0gZy5nZXRPcHRpb25Gb3JBeGlzKCdheGlzTGluZUNvbG9yJywgJ3kyJyk7XG4gICAgICBjb250ZXh0LmxpbmVXaWR0aCA9IGcuZ2V0T3B0aW9uRm9yQXhpcygnYXhpc0xpbmVXaWR0aCcsICd5MicpO1xuICAgICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICAgIGNvbnRleHQubW92ZVRvKGhhbGZEb3duKGFyZWEueCArIGFyZWEudyksIGhhbGZEb3duKGFyZWEueSkpO1xuICAgICAgY29udGV4dC5saW5lVG8oaGFsZkRvd24oYXJlYS54ICsgYXJlYS53KSwgaGFsZkRvd24oYXJlYS55ICsgYXJlYS5oKSk7XG4gICAgICBjb250ZXh0LmNsb3NlUGF0aCgpO1xuICAgICAgY29udGV4dC5zdHJva2UoKTtcbiAgICB9XG4gIH1cblxuICBpZiAoZy5nZXRPcHRpb25Gb3JBeGlzKCdkcmF3QXhpcycsICd4JykpIHtcbiAgICBpZiAobGF5b3V0Lnh0aWNrcykge1xuICAgICAgdmFyIGdldEF4aXNPcHRpb24gPSBtYWtlT3B0aW9uR2V0dGVyKCd4Jyk7XG4gICAgICBsYXlvdXQueHRpY2tzLmZvckVhY2goZnVuY3Rpb24gKHRpY2spIHtcbiAgICAgICAgaWYgKHRpY2subGFiZWwgPT09IHVuZGVmaW5lZCkgcmV0dXJuOyAgLy8gdGhpcyB0aWNrIG9ubHkgaGFzIGEgZ3JpZCBsaW5lLlxuICAgICAgICB4ID0gYXJlYS54ICsgdGljay5wb3MgKiBhcmVhLnc7XG4gICAgICAgIHkgPSBhcmVhLnkgKyBhcmVhLmg7XG5cbiAgICAgICAgLyogVGljayBtYXJrcyBhcmUgY3VycmVudGx5IGNsaXBwZWQsIHNvIGRvbid0IGJvdGhlciBkcmF3aW5nIHRoZW0uXG4gICAgICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgICAgIGNvbnRleHQubW92ZVRvKGhhbGZVcCh4KSwgaGFsZkRvd24oeSkpO1xuICAgICAgICBjb250ZXh0LmxpbmVUbyhoYWxmVXAoeCksIGhhbGZEb3duKHkgKyB0aGF0LmF0dHJfKCdheGlzVGlja1NpemUnKSkpO1xuICAgICAgICBjb250ZXh0LmNsb3NlUGF0aCgpO1xuICAgICAgICBjb250ZXh0LnN0cm9rZSgpO1xuICAgICAgICAqL1xuXG4gICAgICAgIGxhYmVsID0gbWFrZURpdih0aWNrLmxhYmVsLCAneCcpO1xuICAgICAgICBsYWJlbC5zdHlsZS50ZXh0QWxpZ24gPSAnY2VudGVyJztcbiAgICAgICAgbGFiZWwuc3R5bGUudG9wID0gKHkgKyBnZXRBeGlzT3B0aW9uKCdheGlzVGlja1NpemUnKSkgKyAncHgnO1xuXG4gICAgICAgIHZhciBsZWZ0ID0gKHggLSBnZXRBeGlzT3B0aW9uKCdheGlzTGFiZWxXaWR0aCcpLzIpO1xuICAgICAgICBpZiAobGVmdCArIGdldEF4aXNPcHRpb24oJ2F4aXNMYWJlbFdpZHRoJykgPiBjYW52YXNXaWR0aCkge1xuICAgICAgICAgIGxlZnQgPSBjYW52YXNXaWR0aCAtIGdldEF4aXNPcHRpb24oJ2F4aXNMYWJlbFdpZHRoJyk7XG4gICAgICAgICAgbGFiZWwuc3R5bGUudGV4dEFsaWduID0gJ3JpZ2h0JztcbiAgICAgICAgfVxuICAgICAgICBpZiAobGVmdCA8IDApIHtcbiAgICAgICAgICBsZWZ0ID0gMDtcbiAgICAgICAgICBsYWJlbC5zdHlsZS50ZXh0QWxpZ24gPSAnbGVmdCc7XG4gICAgICAgIH1cblxuICAgICAgICBsYWJlbC5zdHlsZS5sZWZ0ID0gbGVmdCArICdweCc7XG4gICAgICAgIGxhYmVsLnN0eWxlLndpZHRoID0gZ2V0QXhpc09wdGlvbignYXhpc0xhYmVsV2lkdGgnKSArICdweCc7XG4gICAgICAgIGNvbnRhaW5lckRpdi5hcHBlbmRDaGlsZChsYWJlbCk7XG4gICAgICAgIHRoYXQueGxhYmVsc18ucHVzaChsYWJlbCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBjb250ZXh0LnN0cm9rZVN0eWxlID0gZy5nZXRPcHRpb25Gb3JBeGlzKCdheGlzTGluZUNvbG9yJywgJ3gnKTtcbiAgICBjb250ZXh0LmxpbmVXaWR0aCA9IGcuZ2V0T3B0aW9uRm9yQXhpcygnYXhpc0xpbmVXaWR0aCcsICd4Jyk7XG4gICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICB2YXIgYXhpc1k7XG4gICAgaWYgKGcuZ2V0T3B0aW9uKCdkcmF3QXhlc0F0WmVybycpKSB7XG4gICAgICB2YXIgciA9IGcudG9QZXJjZW50WUNvb3JkKDAsIDApO1xuICAgICAgaWYgKHIgPiAxIHx8IHIgPCAwKSByID0gMTtcbiAgICAgIGF4aXNZID0gaGFsZkRvd24oYXJlYS55ICsgciAqIGFyZWEuaCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGF4aXNZID0gaGFsZkRvd24oYXJlYS55ICsgYXJlYS5oKTtcbiAgICB9XG4gICAgY29udGV4dC5tb3ZlVG8oaGFsZlVwKGFyZWEueCksIGF4aXNZKTtcbiAgICBjb250ZXh0LmxpbmVUbyhoYWxmVXAoYXJlYS54ICsgYXJlYS53KSwgYXhpc1kpO1xuICAgIGNvbnRleHQuY2xvc2VQYXRoKCk7XG4gICAgY29udGV4dC5zdHJva2UoKTtcbiAgfVxuXG4gIGNvbnRleHQucmVzdG9yZSgpO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgYXhlcztcbiJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQSxZQUFZOztBQUVaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBVEE7RUFBQTtBQUFBO0FBQUE7QUFXQTtBQUEwQztBQUFBO0FBRTFDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJQSxJQUFJLEdBQUcsU0FBUEEsSUFBSSxHQUFjO0VBQ3BCLElBQUksQ0FBQ0MsUUFBUSxHQUFHLEVBQUU7RUFDbEIsSUFBSSxDQUFDQyxRQUFRLEdBQUcsRUFBRTtBQUNwQixDQUFDO0FBRURGLElBQUksQ0FBQ0csU0FBUyxDQUFDQyxRQUFRLEdBQUcsWUFBVztFQUNuQyxPQUFPLGFBQWE7QUFDdEIsQ0FBQztBQUVESixJQUFJLENBQUNHLFNBQVMsQ0FBQ0UsUUFBUSxHQUFHLFVBQVNDLENBQUMsRUFBRTtFQUNwQyxPQUFPO0lBQ0xDLE1BQU0sRUFBRSxJQUFJLENBQUNBLE1BQU07SUFDbkJDLFVBQVUsRUFBRSxJQUFJLENBQUNBLFVBQVU7SUFDM0JDLGFBQWEsRUFBRSxJQUFJLENBQUNBO0VBQ3RCLENBQUM7QUFDSCxDQUFDO0FBRURULElBQUksQ0FBQ0csU0FBUyxDQUFDSSxNQUFNLEdBQUcsVUFBU0csQ0FBQyxFQUFFO0VBQ2xDLElBQUlKLENBQUMsR0FBR0ksQ0FBQyxDQUFDQyxPQUFPO0VBRWpCLElBQUlMLENBQUMsQ0FBQ00sZ0JB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