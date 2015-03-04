;
/**
 * Creates an instance of a gauge.
 *
 * @name TunguskaGauge
 * @author Rob Fallows
 * @version 1.0.0
 * @return {object} TunguskaGauge.
 */
TunguskaGauge = function(options) {
  'use strict';
  return this.__init(options);
};

// TunguskaGauge Config contains some defaults and a basic theme
TunguskaGauge.config = {
  lastValue: null,
  theme: 'basic',
  themes: {
    basic: {
      radius: 85,
      range: {
        min: 0,
        max: 100,
        startAngle: -135,
        sweep: 225,
        colorBand: [{
          startAt: 0.95,
          endAt: 0.99,
          from: 0,
          to: 75,
          color: '#090'
        }, {
          startAt: 0.90,
          endAt: 0.99,
          from: 75,
          to: 90,
          color: '#e80'
        }, {
          startAt: 0.85,
          endAt: 0.99,
          from: 90,
          to: 100,
          color: '#d00'
        }]
      },
      outer: {
        lineWidth: 1,
        color: "black",
        alpha: 0.5,
        radius: 1
      },
      pointer: {
        points: [
          [-0.1, -0.05],
          [0.95, 0],
          [-0.1, 0.05]
        ],
        lineWidth: 1,
        color: "black",
        alpha: 1,
        fillColor: "red",
        shadowX: 2,
        shadowY: 2,
        shadowBlur: 5,
        shadowColor: "#000",
        dynamics: {
          duration: 150,
          easing: 'easeIn'
        }
      },
      tick: {
        minor: {
          lineWidth: 1,
          startAt: 0.90,
          endAt: 0.96,
          interval: 2,
          color: "black",
          alpha: 1,
          first: 0,
          last: 100
        },
        major: {
          lineWidth: 2,
          startAt: 0.86,
          endAt: 0.96,
          interval: 10,
          color: "black",
          legend: {
            color: "#669",
            font: '12px sans-serif',
            radius: 0.72
          },
          alpha: 1,
          first: 0,
          last: 100
        }
      },
      digital: {
        top: 40,
        left: 0,
        font: '20px monospace',
        color: "#66a"
      }
    }
  }
}

// TunguskaGauge Easing contains some defaults
TunguskaGauge.easing = {
  linear: [
    [0, 0],
    [0.33, 0.33],
    [0.67, 0.67],
    [1, 1]
  ],
  bounce: [
    [0, 0],
    [0.95, 1.2],
    [0.98, 0.9],
    [1, 1]
  ],
  instant: [
    [0, 1],
    [0, 1],
    [0, 1],
    [0, 1]
  ],
  easeIn: [
    [0, 0],
    [0.8, 0.8],
    [0.9, 0.95],
    [1, 1]
  ]
};

// Define the TunguskaGauge object's methods
// Cloning taken from http://stackoverflow.com/questions/728360/most-elegant-way-to-clone-a-javascript-object
TunguskaGauge.prototype = {
  __clone: function(obj) {
    'use strict';
    var copy;

    // Handle the 3 simple types, and null or undefined
    if (null === obj || 'object' !== typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
      copy = new Date();
      copy.setTime(obj.getTime());
      return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
      copy = [];
      for (var i = 0, len = obj.length; i < len; i++) {
        copy[i] = this.__clone(obj[i]);
      }
      return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
      copy = {};
      for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = this.__clone(obj[attr]);
      }
      return copy;
    }
  },

  // Initialise
  __init: function(options) {
    'use strict';
    var canvas,
      dh,
      DOMid,
      h,
      i,
      j,
      lock,
      myZ,
      self,
      selfLeft,
      selfTop,
      style,
      that,
      thbgimg,
      theme,
      thfgimg,
      w,
      z;

    theme = options.theme || TunguskaGauge.config.theme;
    theme = TunguskaGauge.config.themes[theme];
    if (!theme) {
      theme = TunguskaGauge.config.themes[TunguskaGauge.config.theme];
    }
    this.theme = this.__clone(theme);

    for (i in options) {
      that = options[i];
      switch (i) {
        case 'center':
          {
            if (!this.theme.center) {
              this.theme.center = {};
            }
            for (j in that) {
              this.theme.center[j] = this.__clone(that[j]);
            }
            break;
          }
        case 'range':
          {
            if (!this.theme.range) {
              this.theme.range = {};
            }
            for (j in that) {
              this.theme.range[j] = this.__clone(that[j]);
            }
            break;
          }
        case 'background':
          {
            if (!this.theme.background) {
              this.theme.background = {};
            }
            for (j in that) {
              this.theme.background[j] = this.__clone(that[j]);
            }
            break;
          }
        case 'foreground':
          {
            if (!this.theme.foreground) {
              this.theme.foreground = {};
            }
            for (j in that) {
              this.theme.foreground[j] = this.__clone(that[j]);
            }
            break;
          }
        case 'aperture':
          {
            if (!this.theme.aperture) {
              this.theme.aperture = {};
            }
            for (j in that) {
              this.theme.aperture[j] = this.__clone(that[j]);
            }
            break;
          }
        case 'tick':
          {
            this.theme.tick = this.__clone(that);
            break;
          }
        case 'digital':
          {
            if (!this.theme.digital) {
              this.theme.digital = {};
            }
            for (j in that) {
              this.theme.digital[j] = this.__clone(that[j]);
            }
            break;
          }
        case 'pointer':
          {
            if (!this.theme.pointer) {
              this.theme.pointer = {};
            }
            for (j in that) {
              this.theme.pointer[j] = this.__clone(that[j]);
            }
            break;
          }
        case 'outer':
          {
            if (!this.theme.outer) {
              this.theme.outer = {};
            }
            for (j in that) {
              this.theme.outer[j] = this.__clone(that[j]);
            }
            break;
          }
        case 'callback':
          {
            if (!this.theme.callback) {
              this.theme.callback = {};
            }
            for (j in that) {
              this.theme.callback[j] = this.__clone(that[j]);
            }
            break;
          }
      }
    }

    this.id = options.id;
    DOMid = document.getElementById(this.id);
    lock = document.createElement('div');
    lock.id = this.id + '-lock';
    DOMid.appendChild(lock);
    z = DOMid.style.zIndex || 0;
    DOMid = document.getElementById(lock.id);
    DOMid.setAttribute('style', 'position:relative;top:0;left:0');

    //Create canvas elements 0: background, 1: scale, 2: digital, 3: pointers, 4: foreground
    this.canvasId = [];
    for (i = 0; i <= 4; i++) {
      canvas = document.createElement('canvas');
      canvas.id = this.id + '-' + i;
      DOMid.appendChild(canvas);
      this.canvasId[i] = canvas.id;
    }
    this.gaugeRadius = options.radius || this.theme.radius;
    this.showDigits = typeof options.showDigits === 'boolean' ? options.showDigits : false;

    //define context elements
    this.context = [];
    // Get the canvas elements
    this.canvas = [];

    w = this.gaugeRadius * 2;
    h = this.gaugeRadius * 2;
    dh = 0;
    if (this.theme.aperture) {
      w = this.theme.aperture.width || w;
      w -= (this.theme.aperture.left) ? this.theme.aperture.left : 0;
      dh = (this.theme.aperture.height) ? h - this.theme.aperture.height : 0;
      h = this.theme.aperture.height || h;
      h -= (this.theme.aperture.top) ? this.theme.aperture.top : 0;
    }
    this.width = w;
    this.height = h;
    this.dh = dh / 2;
    myZ = z;
    for (i = 0; i < this.canvasId.length; i++) {
      this.canvas[i] = document.getElementById(this.canvasId[i]);
      // Make each canvas the same requested size.
      this.canvas[i].setAttribute('width', w);
      this.canvas[i].setAttribute('height', h);
      myZ += 1;
      style = 'position:absolute;top:0;left:0;z-index:' + myZ + ';width:' + w + 'px;height:' + h + 'px;';
      this.canvas[i].setAttribute('style', style);
      // Initialise each canvas context
      this.context[i] = this.canvas[i].getContext('2d');
      this.context[i].translate(w / 2, h / 2);
      if (this.theme.aperture) {
        this.context[i].translate(this.theme.aperture.left, this.theme.aperture.top);
      }
    }
    if (('background' in this.theme) && ('image' in this.theme.background)) {
      thbgimg = new Image();
      self = this;
      selfLeft = this.theme.background.left || -this.width / 2;
      selfTop = this.theme.background.top || -this.height / 2;
      thbgimg.onload = function() {
        self.context[0].drawImage(thbgimg, selfLeft, selfTop);
      };
      thbgimg.src = this.theme.background.image;
    }
    if (('foreground' in this.theme) && ('image' in this.theme.foreground)) {
      thfgimg = new Image();
      self = this;
      selfLeft = this.theme.foreground.left || -this.width / 2;
      selfTop = this.theme.foreground.top || -this.height / 2;
      thfgimg.onload = function() {
        self.context[4].drawImage(thfgimg, selfLeft, selfTop);
      };
      thfgimg.src = this.theme.foreground.image;
    }
    this.lastValue = TunguskaGauge.config.lastValue;
    this.initialised = false;
    return this;
  },

  /** easing is an array of four waypoints (t,v): [[t0,v0],[t1,v1],[t2,v2],[t3,v3]]
   *  which form the control points of a cubic Beziér Curve.
   *  under normal circumstances, the first point will be [0,0] and the fourth will be [1,1]
   * t and v are each in the range 0..1
   * t is a time marker (0=start, 1=end)
   * v is the relative value at that time
   * tWay is in the range 0..1 and is the time waypoint for which a relative value is to be computed.
   * It corresponds to a proportion of distance along the Bezier curve.
   * ==================================================
   * Based off:
   * 13thParallel.org Beziér Curve Code
   * by Dan Pupius (www.pupius.net)
   * http://www.13thparallel.org/archive/bezier-curves/
   * ==================================================
   */
  __tween: function(tWay, easing) {
    'use strict';
    var Coord = function(t, v) {
        return {
          t: t,
          v: v
        };
      },
      b1 = function(t) {
        return (1 - t) * (1 - t) * (1 - t);
      },
      b2 = function(t) {
        return 3 * t * t * (1 - t);
      },
      b3 = function(t) {
        return 3 * t * (1 - t) * (1 - t);
      },
      b4 = function(t) {
        return t * t * t;
      },
      getBezier = function(t, controlArray) {
        var v;
        var c = [];
        if (t <= 0) {
          return 0;
        } else if (t >= 1) {
          return 1;
        }
        for (var i = 0; i < 4; i++) {
          c[i] = new Coord(controlArray[i][0], controlArray[i][1]);
        }
        v = c[0].v * b1(t) + c[1].v * b2(t) + c[2].v * b3(t) + c[3].v * b4(t);
        return v;
      };
    return getBezier(tWay, TunguskaGauge.easing[easing]);
  },

  __offset: function(obj) {
    'use strict';
    var curleft = 0;
    var curtop = 0;
    if (obj.offsetParent) {
      do {
        curleft += obj.offsetLeft;
        curtop += obj.offsetTop;
      } while (!!(obj = obj.offsetParent)); //    Assign obj and force boolean test result
    }
    return [curleft, curtop];
  },

  __outerArc: function() {
    'use strict';
    var angle0,
      angle1,
      ctx,
      radius,
      radScale;
    ctx = this.context[1];
    ctx.save();
    ctx.globalAlpha = (this.theme.outer && this.theme.outer.alpha) ? this.theme.outer.alpha : 0;
    ctx.lineWidth = (this.theme.outer && this.theme.outer.lineWidth) ? this.theme.outer.lineWidth : 1;
    ctx.beginPath();

    radScale = (this.theme.outer && this.theme.outer.radius) ? this.theme.outer.radius : 0;
    radius = this.gaugeRadius * radScale - ctx.lineWidth / 2;
    ctx.strokeStyle = this.theme.outer.color;

    angle0 = this.theme.range.startAngle * Math.PI / 180.0 - Math.PI / 2;
    angle1 = angle0 + Math.abs(this.theme.range.sweep) * Math.PI / 180.0;
    if (radius > 0) {
      ctx.arc(0, 0, radius, angle0, angle1, false);
    }
    ctx.stroke();
    ctx.restore();
  },

  __colorBand: function() {
    'use strict';
    var angle0,
      angle1,
      ctx,
      i,
      radius,
      thisBand;
    ctx = this.context[1];
    ctx.save();
    for (i in this.theme.range.colorBand) {
      thisBand = this.theme.range.colorBand[i];
      ctx.lineWidth = this.gaugeRadius * Math.abs((thisBand.endAt - thisBand.startAt));
      radius = this.gaugeRadius * Math.abs((thisBand.endAt + thisBand.startAt)) / 2;
      ctx.strokeStyle = thisBand.color;
      angle0 = Math.PI * (this.__scaleValue(thisBand.from) - 90) / 180.0;
      angle1 = Math.PI * (this.__scaleValue(thisBand.to) - 90) / 180.0;
      ctx.beginPath();
      ctx.arc(0, 0, radius, angle0, angle1, false);
      ctx.stroke();
    }
    ctx.restore();
  },

  // Draw some text centered vertically and horizontally
  __text: function(ctx, theText, x, y) {
    'use strict';
    var tArray = ('' + theText).split('\n');
    var myY = y;
    for (var t in tArray) {
      var tSize = this.context[ctx].measureText(tArray[t]);
      this.context[ctx].fillText(tArray[t], x - tSize.width / 2, myY);
      myY += 12;
    }
  },

  __scaleValue: function(plotValue) {
    'use strict';
    var min = 0;
    var max = 359;
    var range = 360;
    var sweep = 360;
    var startAngle = 0;
    if ('range' in this.theme) {
      if ('lowStop' in this.theme.range) {
        plotValue = Math.max(this.theme.range.lowStop, plotValue);
      }
      if ('highStop' in this.theme.range) {
        plotValue = Math.min(this.theme.range.highStop, plotValue);
      }
      if ('min' in this.theme.range) {
        min = this.theme.range.min;
      }
      if ('max' in this.theme.range) {
        max = this.theme.range.max;
      }
      range = max - min + 1;
      if ('sweep' in this.theme.range) {
        sweep = this.theme.range.sweep;
      }
      if ('startAngle' in this.theme.range) {
        startAngle = this.theme.range.startAngle;
      }
    }
    return startAngle + ((plotValue - min) * Math.abs(sweep) / parseFloat(range));
  },

  // the full range of the gauge is 0-100. We work out the angle accordingly
  __drawTick: function(tickValue, tick) {
    'use strict';
    var angle,
      ctx,
      radius,
      sweep,
      t,
      x0,
      x1,
      xDirection,
      y0,
      y1;
    ctx = this.context[1];
    ctx.save();
    ctx.globalAlpha = tick.alpha;
    ctx.strokeStyle = tick.color;
    ctx.lineWidth = tick.lineWidth;

    angle = Math.PI * this.__scaleValue(tickValue) / 180.0;
    sweep = 360;
    if (this.theme.range && this.theme.range.sweep) {
      sweep = this.theme.range.sweep;
    }
    xDirection = (sweep < 0) ? -1 : 1;
    x0 = xDirection * Math.sin(angle) * this.gaugeRadius * tick.startAt;
    y0 = -Math.cos(angle) * this.gaugeRadius * tick.startAt;
    x1 = xDirection * Math.sin(angle) * this.gaugeRadius * tick.endAt;
    y1 = -Math.cos(angle) * this.gaugeRadius * tick.endAt;
    ctx.beginPath();
    if (x0 && y0) {
      ctx.moveTo(x0, y0);
      if (x1 && y1) {
        ctx.lineTo(x1, y1);
        ctx.stroke();
      }
    }

    if (tick.legend) {
      radius = this.gaugeRadius * tick.startAt;
      x0 = xDirection * Math.sin(angle) * this.gaugeRadius * this.theme.tick.major.legend.radius;
      y0 = -Math.cos(angle) * this.gaugeRadius * this.theme.tick.major.legend.radius;
      ctx.save();
      ctx.fillStyle = this.theme.tick.major.legend.color;
      ctx.font = this.theme.tick.major.legend.font;
      if (this.theme.tick.major.legend.callback) {
        t = this.theme.tick.major.legend.callback(tickValue);
      } else {
        t = tickValue;
      }
      this.__text(1, t, x0, y0 + 5);
      ctx.restore();
    }
    ctx.restore();
  },

  __drawPointer: function(p, pointerValue) {
    'use strict';
    var angle,
      bgimg,
      context,
      deltaR,
      fgimg,
      i,
      Radius,
      self,
      sweep,
      theta,
      themePointer,
      x,
      xy,
      xDirection,
      y;
    angle = Math.PI * this.__scaleValue(pointerValue) / 180.0;
    Radius = this.gaugeRadius;

    if (!('pointer' in this.theme)) return;
    themePointer = this.theme.pointer;
    if (this.theme.pointer instanceof Array) {
      themePointer = this.theme.pointer[p];
    }

    sweep = 360;
    if (('range' in this.theme) && ('sweep' in this.theme.range)) {
      sweep = this.theme.range.sweep;
    }
    xDirection = (sweep < 0) ? -1 : 1;

    if (('shadow' in themePointer) || ('image' in themePointer)) {
      if ('shadow' in themePointer) {
        self = this;
        context = this.context[3];
        if ('name' in themePointer.shadow) {
          bgimg = new Image();
          bgimg.onload = function() {
            context.save();
            context.translate(0, self.dh);
            context.translate(themePointer.shadowX, themePointer.shadowY);
            context.rotate((xDirection * angle) - Math.PI / 2);
            context.translate(-themePointer.shadow.xOffset, -themePointer.shadow.yOffset);
            context.drawImage(bgimg, 0, 0);
            context.restore();
          };
          bgimg.src = themePointer.shadow.name;
        }
      }
      if ('image' in themePointer) {
        self = this;
        context = this.context[3];
        if ('name' in themePointer.image) {
          fgimg = new Image();
          fgimg.onload = function() {
            context.save();
            context.translate(0, self.dh);
            context.rotate((xDirection * angle) - Math.PI / 2);
            context.translate(-themePointer.image.xOffset, -themePointer.image.yOffset);
            context.drawImage(fgimg, 0, 0);
            context.restore();
          };
          fgimg.src = themePointer.image.name;
        }
      }
    } else {
      this.context[3].save();
      if ('alpha' in themePointer) {
        this.context[3].globalAlpha = themePointer.alpha;
      }
      if ('color' in themePointer) {
        this.context[3].strokeStyle = themePointer.color;
      }
      if ('lineWidth' in themePointer) {
        this.context[3].lineWidth = themePointer.lineWidth;
      }
      if ('fillColor' in themePointer) {
        this.context[3].fillStyle = themePointer.fillColor;
      }
      if ('shadowX' in themePointer) {
        this.context[3].shadowOffsetX = themePointer.shadowX;
      }
      if ('shadowY' in themePointer) {
        this.context[3].shadowOffsetY = themePointer.shadowY;
      }
      if ('shadowBlur' in themePointer) {
        this.context[3].shadowBlur = themePointer.shadowBlur;
      }
      if ('shadowColor' in themePointer) {
        this.context[3].shadowColor = themePointer.shadowColor;
      }

      this.context[3].beginPath();
      for (i in themePointer.points) {
        xy = themePointer.points[i];
        x = xy[0] * this.gaugeRadius;
        y = xy[1] * this.gaugeRadius;
        deltaR = Math.sqrt(x * x + y * y);
        theta = Math.atan2(y, x);
        x = xDirection * Math.sin(angle + theta) * deltaR;
        y = -Math.cos(angle + theta) * deltaR;
        if (+i === 0) {
          this.context[3].moveTo(x, y);
        } else {
          this.context[3].lineTo(x, y);
        }
      }
      this.context[3].closePath();
      if (themePointer.lineWidth) {
        this.context[3].stroke();
      }
      if (themePointer.fillColor) {
        this.context[3].fill();
      }
      this.context[3].restore();
    }
  },

  __update: function(pointerValue) {
    'use strict';
    var self = this;
    var i;
    var pValue;

    if (pointerValue instanceof Array) {
      pValue = this.__clone(pointerValue);
      this.lastValue = [];
      for (i = 0; i < pointerValue.length; i++) {
        if (!('dynamics' in this.theme.pointer[i])) {
          this.theme.pointer[i].dynamics = {
            duration: 200,
            easing: 'linear'
          };
        } else {
          if (!('duration' in this.theme.pointer[i].dynamics)) {
            this.theme.pointer[i].dynamics.duration = 200;
          }
          if (!('easing' in this.theme.pointer[i].dynamics)) {
            this.theme.pointer[i].dynamics.easing = 'linear';
          }
        }
        pValue[i] = pointerValue[i];
        this.lastValue[i] = pointerValue[i];
      }
    } else {
      if (!('dynamics' in this.theme.pointer)) {
        this.theme.pointer.dynamics = {
          duration: 200,
          easing: 'bounce'
        };
      } else {
        if (!('duration' in this.theme.pointer.dynamics)) {
          this.theme.pointer.dynamics.duration = 200;
        }
        if (!('easing' in this.theme.pointer.dynamics)) {
          this.theme.pointer.dynamics.easing = 'bounce';
        }
      }
      pValue = pointerValue;
      this.lastValue = pointerValue;
    }

    // Write the value
    if (this.theme.digital) {
      self.context[2].clearRect(-self.width / 2, -self.height / 2, self.width, self.height);
      this.context[2].save();
      if (this.theme.digital.color) {
        this.context[2].fillStyle = this.theme.digital.color;
      }
      if (this.theme.digital.font) {
        this.context[2].font = this.theme.digital.font;
      }
      var t = null;
      if (this.theme.digital.callback) {
        t = this.theme.digital.callback(this.pointerValue);
      } else {
        var v = Math.round(Math.abs(pValue), 0);
        t = v + '';
        if (v < 100) t = '0' + t;
        if (v < 10) t = '0' + t;
        if (pValue < 0) {
          this.context[3].fillStyle = 'red';
        }
      }
      this.__text(2, t, this.theme.digital.left, this.theme.digital.top);
      this.context[2].restore();
    }

    // Draw the pointer(s)
    if (this.theme.pointer) {
      self.context[3].clearRect(-self.width / 2, -self.height / 2, self.width, self.height);
      this.context[3].save();
      if (pValue instanceof Array) {
        var l = pValue.length;
        for (var p = 0; p < l; p++) {
          this.__drawPointer(p, pValue[p]);
        }
      } else {
        this.__drawPointer(0, pValue);
      }
      this.context[3].restore();
    }
  },

  __animate: function(value) {
    'use strict';
    var last = this.__clone(this.lastValue);
    this.__cycle(0, value, last);
  },

  __cycle: function(t, value, last) {
    'use strict';
    var i, v;
    var self = this;
    var ti;
    var wrap = ('callback' in this.theme) ? 'wrap' in this.theme.callback : false;

    if (value instanceof Array) {
      v = [];
      for (i = 0; i < value.length; i++) {
        if (wrap && Math.abs(value[i] - self.theme.range.min) < 1e-3) {
          last[i] = self.theme.range.min - 1;
        }
        ti = t / self.theme.pointer[i].dynamics.duration;
        v[i] = last[i] + (value[i] - last[i]) * self.__tween(ti, self.theme.pointer[i].dynamics.easing);
      }
    } else {
      if (wrap && Math.abs(value - self.theme.range.min) < 1e-3) {
        last = self.theme.range.min - 1;
      }
      ti = t / self.theme.pointer.dynamics.duration;
      v = last + (value - last) * self.__tween(ti, self.theme.pointer.dynamics.easing);
    }
    self.__update(v);
    if (ti <= 1) {
      setTimeout(function() {
        self.__cycle(t + 16, value, last);
      }, 16);
    } else {
      this.lastValue = this.__clone(value);
    }
  },

  __render: function(pointerValue) {
    'use strict';
    var a,
      finish,
      first,
      i,
      interval,
      last,
      majorFirst,
      majorInterval,
      majorLast,
      minorFirst,
      minorInterval,
      minorLast,
      pValue,
      start;

    start = 0;
    finish = 100;
    minorInterval = 1;
    majorInterval = 10;

    this.context[0].save();

    if ('outer' in this.theme) { //                     Draw the outer edge of the gauge
      this.__outerArc();
    }
    //                                                  Draw colour band
    if ('range' in this.theme) {
      if ('colorBand' in this.theme.range) {
        this.__colorBand();
      }
      if ('min' in this.theme.range) {
        start = this.theme.range.min;
      }
      if ('max' in this.theme.range) {
        finish = this.theme.range.max;
      }
    }
    first = start;
    last = finish;
    minorFirst = first;
    minorLast = last;
    majorFirst = first;
    majorLast = last;
    if ('tick' in this.theme) { //                      Draw the tick marks.
      if ('minor' in this.theme.tick) {
        if ('interval' in this.theme.tick.minor) {
          minorInterval = this.theme.tick.minor.interval;
        }
        if ('first' in this.theme.tick.minor) {
          minorFirst = this.theme.tick.minor.first;
        }
        if ('last' in this.theme.tick.minor) {
          minorLast = this.theme.tick.minor.last;
        }
        first = minorFirst;
        last = minorLast;
      }
      if ('major' in this.theme.tick) {
        if ('interval' in this.theme.tick.major) {
          majorInterval = this.theme.tick.major.interval;
        }
        if ('first' in this.theme.tick.major) {
          majorFirst = this.theme.tick.major.first;
        }
        if ('last' in this.theme.tick.major) {
          majorLast = this.theme.tick.major.last;
        }
        first = Math.min(first, majorFirst);
        last = Math.max(last, majorLast);
      }
      interval = Math.min(minorInterval, majorInterval);
      for (i = first; i <= last; i += interval) {
        a = parseInt(i * 10, 10) / 10;
        if (a % majorInterval === 0) {
          if ('major' in this.theme.tick) {
            if (a >= majorFirst && a <= majorLast) {
              this.__drawTick(a, this.theme.tick.major);
            }
          }
        } else {
          if ('minor' in this.theme.tick) {
            if (a >= minorFirst && a <= minorLast) {
              this.__drawTick(a, this.theme.tick.minor);
            }
          }
        }
      }
    }
    this.context[0].restore();
    this.pointerValue = pointerValue;
    if ('callback' in this.theme) {
      if ('pointer' in this.theme.callback) {
        pValue = this.theme.callback.pointer(pointerValue);
      }
    } else {
      pValue = pointerValue;
    }
    this.__update(pValue);
  },

  setValue: function(value) {
    'use strict';
    var i,
      match,
      pointerValue;
    if (this.initialised) {
      this.pointerValue = value;
      if (this.theme.callback && this.theme.callback.pointer) {
        pointerValue = this.theme.callback.pointer(value);
      } else {
        pointerValue = value;
      }
      if (this.lastValue !== null) {
        if (pointerValue instanceof Array) {
          match = true;
          for (i = 0; i < pointerValue.length; i++) {
            if (pointerValue[i] !== this.lastValue[i]) {
              match = false;
              break;
            }
          }
          if (match) return;
        } else if (this.lastValue === pointerValue) {
          return;
        }
        this.__animate(pointerValue);
      } else {
        this.__update(pointerValue);
        if (pointerValue instanceof Array) {
          this.lastValue = [];
          for (i = 0; i < pointerValue.length; i++) {
            this.lastValue[i] = pointerValue[i];
          }
        } else {
          this.lastValue = pointerValue;
        }
      }
    } else {
      this.initialised = true;
      this.__render(value);
    }
  },

  getValue: function() {
    'use strict';
    return this.lastValue;
  }
};

