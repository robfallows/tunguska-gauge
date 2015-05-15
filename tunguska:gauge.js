;
/*
The MIT License (MIT)
Copyright (c) 2015 Rob Fallows
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

/**
 * Creates an instance of a gauge.
 *
 * @name TunguskaGauge
 * @author Rob Fallows
 * @version 1.0.10
 * @return {object} TunguskaGauge.
 */
TunguskaGauge = function(options) {
  'use strict';
  return this.__init(options);
};

// TunguskaGauge.config contains some defaults
TunguskaGauge.config = {
  theme: 'basic'
};

// TunguskaGauge.themes contains basic themes
TunguskaGauge.themes = {
  none: {},
  basic: {
    radius: 0.85,
    range: {
      min: 0,
      max: 100,
      startAngle: -135,
      sweep: 225
    },
    pointer: {
      points: [
        [-0.1, -0.05],
        [0.95, 0],
        [-0.1, 0.05]
      ],
      lineWidth: 1,
      color: 'black',
      alpha: 1,
      fillColor: 'red',
      shadowX: 2,
      shadowY: 2,
      shadowBlur: 5,
      shadowColor: '#000',
      dynamics: {
        duration: 150,
        easing: 'bounce'
      }
    },
    tick: {
      minor: {
        lineWidth: 1,
        startAt: 0.90,
        endAt: 0.96,
        interval: 2,
        color: 'black',
        alpha: 1,
        first: 0,
        last: 100
      },
      major: {
        lineWidth: 2,
        startAt: 0.86,
        endAt: 0.96,
        interval: 10,
        color: 'black',
        legend: {
          color: '#669',
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
      color: '#66a'
    }
  }
};

// TunguskaGauge.easing contains some defaults
TunguskaGauge.easing = {
  linear: [
    [0, 0],
    [0.33, 0.33],
    [0.67, 0.67],
    [1, 1]
  ],
  bounce: [
    [0, 0],
    [0.73, 1],
    [1, 1.3],
    [1, 1]
  ],
  instant: [
    [0, 1],
    [0, 1],
    [0, 1],
    [1, 1]
  ],
  easeIn: [
    [0, 0],
    [0.2, 0.5],
    [0.8, 0.95],
    [1, 1]
  ],
  easeOut: [
    [0, 0],
    [0.2, 0.05],
    [0.8, 0.5],
    [1, 1]
  ],
  easeInOut: [
    [0, 0],
    [0.2, 0.1],
    [0.8, 0.9],
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

  // Overwrite based off __clone()
  __overWrite: function(copy, obj) {
    'use strict';
    if ('undefined' === typeof copy) {
      copy = obj;
    } else {
      // Handle the 3 simple types, and null or undefined
      if (null === obj || 'object' !== typeof obj) {
        //copy = obj;
        return obj;
        // Handle Date
      } else if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());

        // Handle Array
      } else if (obj instanceof Array) {
        return obj;

        // Handle Object
      } else if (obj instanceof Object) {
        for (var attr in obj) {
          if (obj.hasOwnProperty(attr)) {
            var next = this.__overWrite(copy[attr], obj[attr]);
            if ('undefined' !== typeof next) {
              copy[attr] = next;
            }
          }
        }
      }
    }
  },

  // Initialise
  __init: function(options) {
    'use strict';
    var canvas,
      DOMid,
      h,
      i,
      lock,
      myZ,
      style,
      that,
      theme,
      themePack,
      w,
      z;

    theme = options.theme || TunguskaGauge.config.theme;
    //                                                      Check for a theme pack. It will take precedence
    themePack = typeof TunguskaGaugeThemePack !== 'undefined';
    theme = themePack ? TunguskaGaugeThemePack[theme] : TunguskaGauge.themes[theme];
    if (!theme) {
      theme = themePack ? TunguskaGaugeThemePack[TunguskaGauge.config.theme] : TunguskaGauge.themes[TunguskaGauge.config.theme];
    }
    this.theme = this.__clone(theme);

    for (i in options) {
      that = options[i];
      switch (i) {

        case 'id':
        case 'radius':
        case 'theme':
          this.theme[i] = that;
          break;

        case 'background':
        case 'callback':
        case 'digital':
        case 'events':
        case 'foreground':
        case 'outer':
        case 'pointer':
        case 'range':
        case 'render':
        case 'tick':
          if ('undefined' === typeof this.theme[i]) {
            this.theme[i] = that;
          } else {
            this.__overWrite(this.theme[i], that);
          }
          break;

        default:
          throw new Error('Unknown option: ' + i);
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

    //                                                      Create canvas elements
    //                                                       0: background,
    //                                                       1: scale,
    //                                                       2: digital,
    //                                                       3: pointers,
    //                                                       4: foreground
    this.canvasId = [];
    for (i = 0; i <= 4; i++) {
      canvas = document.createElement('canvas');
      canvas.id = this.id + '-' + i;
      DOMid.appendChild(canvas);
      this.canvasId[i] = canvas.id;
    }

    h = w = Math.min(DOMid.clientHeight, DOMid.clientWidth); // Get smallest square container size
    this.gaugeRadius = options.radius || this.theme.radius || 0.95;
    this.gaugeRadius = this.gaugeRadius * w / 2; //         Set px radius based off dimension
    this.showDigits = typeof options.showDigits === 'boolean' ? options.showDigits : false;

    this.width = w;
    this.height = h;

    this.context = []; //                                   Define context elements
    this.canvas = []; //                                    Get the canvas elements
    this.cachedCanvas = []; //                              For image pointers
    myZ = z; //                                             Get deepest z-index (we need to stack the canvases)

    for (i = 0; i < this.canvasId.length; i++) { //         Iterate over canvas DOM ids
      this.canvas[i] = document.getElementById(this.canvasId[i]);

      this.canvas[i].setAttribute('width', w); //           Make each canvas the same requested size.
      this.canvas[i].setAttribute('height', h);
      myZ += 1; //                                          Increment z-index and set canvas layer's style
      style = 'position:absolute;top:0;left:0;z-index:' + myZ + ';';
      this.canvas[i].setAttribute('style', style);

      this.context[i] = this.canvas[i].getContext('2d'); // Initialise each canvas context
      this.context[i].translate(w / 2, h / 2); //           Move origin to canvas centre
    }

    //                                                      If there are any image pointers or shadows, cache them.
    if (this.theme.pointer instanceof Array) {
      for (i = 0; i < this.theme.pointer.length; i++) {
        this.__registerImages(i);
      }
    } else {
      this.__registerImages();
    }
    //                                                      Set up hidden canvas for double-buffering of pointers
    this.pointerCanvas = document.createElement('canvas');
    this.pointerCanvas.setAttribute('height', this.height);
    this.pointerCanvas.setAttribute('width', this.width);
    this.pointerContext = this.pointerCanvas.getContext('2d');
    this.pointerContext.translate(w / 2, h / 2); //         Move origin to canvas centre
    this.lastValue = null;
    this.initialised = false;
    this.animating = false; //                              Used for stopping an active requestAnimationFrame
    return this;
  },

  /** easing is an array of four waypoints (t,v): [[t0,v0],[t1,v1],[t2,v2],[t3,v3]]
   *  which form the control points of a cubic Beziér Curve.
   *  under normal circumstances, the first point will be [0,0] and the fourth will be [1,1]:
   *  you may use http://matthewlein.com/ceaser/ to generate the remaining four points t1, v1, t2, v2.
   * t is a time marker (0=start, 1=end)
   * v is the relative value at that time
   * tWay is in the range 0..1 and is the time waypoint for which a relative value is to be computed.
   * It corresponds to a proportion of distance along the Beziér curve.
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

  __clear: function(c) {
    'use strict';
    this.context[c].clearRect(-this.width / 2, -this.height / 2, this.width, this.height);
  },

  __outerArc: function() { //                               Draws the outer bound of the scale
    'use strict';
    var angle0,
      angle1,
      ctx,
      radius,
      radScale;
    if (('outer' in this.theme) && ('range' in this.theme)) {
      ctx = this.context[1];
      ctx.save();
      ctx.globalAlpha = ('alpha' in this.theme.outer) ? this.theme.outer.alpha : 0;
      ctx.lineWidth = ('lineWidth' in this.theme.outer) ? this.theme.outer.lineWidth : 1;
      ctx.beginPath();

      radScale = ('radius' in this.theme.outer) ? this.theme.outer.radius : 0;
      radius = this.gaugeRadius * radScale - ctx.lineWidth / 2;
      ctx.strokeStyle = this.theme.outer.color;

      if (('startAngle' in this.theme.range) && ('sweep' in this.theme.range)) {
        angle0 = this.theme.range.startAngle * Math.PI / 180.0 - Math.PI / 2;
        angle1 = angle0 + Math.abs(this.theme.range.sweep) * Math.PI / 180.0;
        if (radius > 0) {
          ctx.arc(0, 0, radius, angle0, angle1, false);
        }
        ctx.stroke();
      }
      ctx.restore();
    }
  },

  __colorBand: function() { //                              Draws a colour band on the scale
    'use strict';
    var angle0,
      angle1,
      ctx,
      i,
      radius,
      thisBand;
    if (('range' in this.theme) && ('colorBand' in this.theme.range)) {
      ctx = this.context[1];
      ctx.save();
      for (i in this.theme.range.colorBand) {
        thisBand = this.theme.range.colorBand[i];
        ctx.lineWidth = this.gaugeRadius * Math.abs((thisBand.endAt - thisBand.startAt));
        radius = this.gaugeRadius * Math.abs((thisBand.endAt + thisBand.startAt)) / 2;
        ctx.strokeStyle = thisBand.color;
        angle0 = this.__scaleValue(thisBand.from) - Math.PI / 2.0;
        angle1 = this.__scaleValue(thisBand.to) - Math.PI / 2.0;
        ctx.beginPath();
        ctx.arc(0, 0, radius, angle0, angle1, false);
        ctx.stroke();
      }
      ctx.restore();
    }
  },

  __text: function(ctx, theText, x, y) { //                 Draw some text centered vertically and horizontally
    'use strict';
    var tArray = ('' + theText).split('\n');
    var myY = y;
    for (var t in tArray) {
      var tSize = this.context[ctx].measureText(tArray[t]);
      this.context[ctx].fillText(tArray[t], x - tSize.width / 2, myY);
      myY += 12; //                                         Should use line height here
    }
  },

  __scaleValue: function(plotValue) { //                    Get the angle in radians from a (pointer) value
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
      range = max - min;
      if ('sweep' in this.theme.range) {
        sweep = this.theme.range.sweep;
      }
      if ('startAngle' in this.theme.range) {
        startAngle = this.theme.range.startAngle;
      }
    }
    return Math.PI * (startAngle + ((plotValue - min) * Math.abs(sweep) / parseFloat(range))) / 180.0;
  },

  __drawTick: function(tickValue, tick) { //                Draw a scale tick mark
    'use strict';
    var angle,
      ctx,
      radius,
      sweep,
      t,
      tl,
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

    angle = this.__scaleValue(tickValue);
    sweep = 360;
    if (('range' in this.theme) && ('sweep' in this.theme.range)) {
      sweep = this.theme.range.sweep;
    }
    xDirection = (sweep < 0) ? -1 : 1;
    x0 = xDirection * Math.sin(angle) * this.gaugeRadius * tick.startAt;
    y0 = -Math.cos(angle) * this.gaugeRadius * tick.startAt;
    x1 = xDirection * Math.sin(angle) * this.gaugeRadius * tick.endAt;
    y1 = -Math.cos(angle) * this.gaugeRadius * tick.endAt;
    ctx.beginPath();
    if ((typeof x0 === 'number') && (typeof y0 === 'number') && (typeof x1 === 'number') && (typeof y1 === 'number')) {
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
    }

    if (tick.legend) {
      if (('tick' in this.theme) && ('major' in this.theme.tick) && ('legend' in this.theme.tick.major)) {
        tl = this.theme.tick.major.legend;
        radius = this.gaugeRadius * tick.startAt;
        x0 = xDirection * Math.sin(angle) * this.gaugeRadius * tl.radius;
        y0 = -Math.cos(angle) * this.gaugeRadius * tl.radius;
        ctx.save();
        ctx.fillStyle = tl.color;
        ctx.font = tl.font;
        if (tl.callback) {
          t = tl.callback(tickValue);
        } else {
          t = tickValue;
        }
        this.__text(1, t, x0, y0 + 5);
        ctx.restore();
      }
    }
    ctx.restore();
  },

  __registerImages: function(p) {
    'use strict';
    var bgimg,
      fgimg,
      context,
      pp,
      self = this,
      sweep,
      themePointer = this.theme.pointer,
      xDirection;

    if (typeof p === 'undefined') {
      p = 0;
    } else {
      themePointer = this.theme.pointer[p];
    }

    if (('image' in themePointer) || ('shadow' in themePointer)) {
      self.cachedCanvas[p] = {
        image: document.createElement('canvas'),
        imageContext: null,
        shadow: document.createElement('canvas'),
        shadowContext: null
      };
      pp = self.cachedCanvas[p];
      pp.image.setAttribute('height', self.height);
      pp.image.setAttribute('width', self.width);
      pp.imageContext = self.cachedCanvas[p].image.getContext('2d');
      pp.shadow.setAttribute('height', self.height);
      pp.shadow.setAttribute('width', self.width);
      pp.shadowContext = self.cachedCanvas[p].shadow.getContext('2d');
      if (('shadow' in themePointer) && ('name' in themePointer.shadow)) {
        sweep = 360;
        if (('range' in self.theme) && ('sweep' in self.theme.range)) {
          sweep = self.theme.range.sweep;
        }
        xDirection = (sweep < 0) ? -1 : 1;
        bgimg = new Image();
        bgimg.src = themePointer.shadow.name;
        bgimg.onload = function() {
          pp.shadowContext.drawImage(bgimg, 0, 0);
          context = self.context[3]; //                     We need to draw an initial position, so that
          //                                                there is something to see prior to first update
          context.save();
          context.translate(themePointer.shadowX, themePointer.shadowY);
          context.rotate((xDirection * self.__scaleValue(self.theme.range.min)) - Math.PI / 2);
          context.translate(-themePointer.shadow.xOffset, -themePointer.shadow.yOffset);
          context.drawImage(bgimg, 0, 0);
          context.restore();
        };
      }
      if (('image' in themePointer) && ('name' in themePointer.image)) {
        fgimg = new Image();
        fgimg.src = themePointer.image.name;
        fgimg.onload = function() {
          pp.imageContext.drawImage(fgimg, 0, 0);
          context = self.context[3]; //                     We need to draw an initial position, so that
          //                                                there is something to see prior to first update
          context.save();
          context.rotate((xDirection * self.__scaleValue(self.theme.range.min)) - Math.PI / 2);
          context.translate(-themePointer.image.xOffset, -themePointer.image.yOffset);
          context.drawImage(fgimg, 0, 0);
          context.restore();
        };
      }
    }
  },

  __drawPointer: function(p, pointerValue) { //             Draws a pointer into the hidden canvas
    'use strict';
    var angle,
      context,
      deltaR,
      i,
      pp,
      Radius,
      self = this,
      sweep,
      theta,
      themePointer,
      x,
      xy,
      xDirection,
      y;
    if (!('render' in this.theme) || this.theme.render) {
      angle = self.__scaleValue(pointerValue);
      Radius = self.gaugeRadius;

      if (!('pointer' in self.theme)) return;
      themePointer = self.theme.pointer;
      if (themePointer instanceof Array) {
        themePointer = self.theme.pointer[p];
      }

      sweep = 360;
      if (('range' in self.theme) && ('sweep' in self.theme.range)) {
        sweep = self.theme.range.sweep;
      }
      xDirection = (sweep < 0) ? -1 : 1;

      //                                                      Pointer & shadow come from images
      if (('shadow' in themePointer) || ('image' in themePointer)) {
        pp = self.cachedCanvas[p];
        if (('shadow' in themePointer) && ('name' in themePointer.shadow)) {
          context = self.pointerContext;
          context.save();
          context.translate(themePointer.shadowX, themePointer.shadowY);
          context.rotate((xDirection * angle) - Math.PI / 2);
          context.translate(-themePointer.shadow.xOffset, -themePointer.shadow.yOffset);
          context.drawImage(pp.shadow, 0, 0); //              Image comes from canvas cache
          context.restore();
        }
        if (('image' in themePointer) && ('name' in themePointer.image)) {
          context = self.pointerContext;
          context.save();
          context.rotate((xDirection * angle) - Math.PI / 2);
          context.translate(-themePointer.image.xOffset, -themePointer.image.yOffset);
          context.drawImage(pp.image, 0, 0); //               Image comes from canvas cache
          context.restore();
        }
      } else { //                                             Pointer & shadow are rendered
        self.pointerContext.save();
        if ('alpha' in themePointer) {
          self.pointerContext.globalAlpha = themePointer.alpha;
        }
        if ('color' in themePointer) {
          self.pointerContext.strokeStyle = themePointer.color;
        }
        if ('lineWidth' in themePointer) {
          self.pointerContext.lineWidth = themePointer.lineWidth;
        }
        if ('fillColor' in themePointer) {
          self.pointerContext.fillStyle = themePointer.fillColor;
        }
        if ('shadowX' in themePointer) {
          self.pointerContext.shadowOffsetX = themePointer.shadowX;
        }
        if ('shadowY' in themePointer) {
          self.pointerContext.shadowOffsetY = themePointer.shadowY;
        }
        if ('shadowBlur' in themePointer) {
          self.pointerContext.shadowBlur = themePointer.shadowBlur;
        }
        if ('shadowColor' in themePointer) {
          self.pointerContext.shadowColor = themePointer.shadowColor;
        }

        self.pointerContext.beginPath();
        for (i in themePointer.points) {
          xy = themePointer.points[i];
          x = xy[0] * self.gaugeRadius;
          y = xy[1] * self.gaugeRadius;
          deltaR = Math.sqrt(x * x + y * y);
          theta = Math.atan2(y, x);
          x = xDirection * Math.sin(angle + theta) * deltaR;
          y = -Math.cos(angle + theta) * deltaR;
          if (+i === 0) {
            self.pointerContext.moveTo(x, y);
          } else {
            self.pointerContext.lineTo(x, y);
          }
        }
        self.pointerContext.closePath();
        if (themePointer.lineWidth) {
          self.pointerContext.stroke();
        }
        if (themePointer.fillColor) {
          self.pointerContext.fill();
        }
        self.pointerContext.restore();
      }
    }
  },

  __update: function(pointerValue) {
    'use strict';
    var i;
    var pValue;
    if (!('render' in this.theme) || this.theme.render) {
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
        this.__clear(2);
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

      //                                                      Draw the pointer(s) on the hidden canvas
      if (this.theme.pointer) {
        this.pointerContext.clearRect(-this.width / 2, -this.height / 2, this.width, this.height);
        this.pointerContext.save();
        if (pValue instanceof Array) {
          var l = pValue.length;
          for (var p = 0; p < l; p++) {
            this.__drawPointer(p, pValue[p]);
          }
        } else {
          this.__drawPointer(0, pValue);
        }
        this.pointerContext.restore();
        //                                                    Overwrite the visible canvas with the hidden
        this.__clear(3);
        this.context[3].drawImage(this.pointerCanvas, -this.width / 2, -this.height / 2);
      }
    }
  },

  __animate: function(value) {
    'use strict';
    var started = false;
    var wrap = ('callback' in this.theme) ? 'wrap' in this.theme.callback : false;
    var last = this.__clone(this.lastValue);
    var self = this;
    var done;

    if (('events' in this.theme) && ('onPointerStart' in this.theme.events)) {
      if ('function' === typeof this.theme.events.onPointerStart) {
        this.theme.events.onPointerStart(this.theme, value);
      }
    }

    function step(timestamp) {
      var i, v, t, ti, tt;
      if (!started) {
        started = timestamp; //                             May be a hi-res timestamp
      }
      t = timestamp - started; //                           0..duration
      if (value instanceof Array) {
        v = [];
        ti = [];
        tt = 0;
        for (i = 0; i < value.length; i++) {
          if (wrap && Math.abs(value[i] - self.theme.range.min) < 1e-3) {
            last[i] = self.theme.range.min - 1;
          }
          ti[i] = t / self.theme.pointer[i].dynamics.duration;
          v[i] = last[i] + (value[i] - last[i]) * self.__tween(ti[i], self.theme.pointer[i].dynamics.easing);
        }
        done = ti[0] > 1;
        for (i = 1; i < value.length; i++) {
          done = done && (ti[i] > 1);
        }
      } else {
        if (wrap && Math.abs(value - self.theme.range.min) < 1e-3) {
          last = self.theme.range.min - 1;
        }
        tt = t / self.theme.pointer.dynamics.duration;
        v = last + (value - last) * self.__tween(tt, self.theme.pointer.dynamics.easing);
        done = (tt > 1);
      }
      self.__update(v);
      if (done) {
        self.lastValue = self.__clone(v);
        if (('events' in self.theme) && ('onPointerStop' in self.theme.events)) {
          if ('function' === typeof self.theme.events.onPointerStop) {
            self.theme.events.onPointerStop(self.theme, v);
          }
        }
        self.animating = false;
      } else {
        if (('events' in self.theme) && ('onPointerSweep' in self.theme.events)) {
          if ('function' === typeof self.theme.events.onPointerSweep) {
            self.theme.events.onPointerSweep(self.theme, v);
          }
        }
        self.animating = window.requestAnimationFrame(step);
      }
    }
    this.animating = window.requestAnimationFrame(step);
  },

  __render: function(pointerValue) {
    'use strict';
    var pValue,
      self,
      selfLeft,
      selfTop,
      thbgimg,
      thfgimg;

    this.context[0].save();
    this.__clear(0);
    if (('background' in this.theme) && ('image' in this.theme.background)) {
      thbgimg = new Image();
      self = this;
      selfLeft = this.theme.background.left || -this.width / 2;
      selfTop = this.theme.background.top || -this.height / 2;
      thbgimg.onload = function() {
        self.context[0].drawImage(thbgimg, selfLeft, selfTop);
        self.__renderScale();
      };
      thbgimg.src = this.theme.background.image;
    } else {
      this.__renderScale();
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

  __renderScale: function() {
    'use strict';
    var a,
      finish,
      first,
      i,
      interval,
      last,
      start,
      majorFirst,
      majorInterval,
      majorLast,
      minorFirst,
      minorInterval,
      minorLast;

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
      //interval = Math.min(minorInterval, majorInterval);
      if ('minor' in this.theme.tick) {
        for (i = minorFirst; i<=minorLast; i+=minorInterval) {
          this.__drawTick(i, this.theme.tick.minor);
        }
      }
      if ('major' in this.theme.tick) {
        for (i = majorFirst; i<=majorLast; i+=majorInterval) {
          this.__drawTick(i, this.theme.tick.major);
        }
      }
    }
    this.context[0].restore();
  },

  set: function(value) {
    'use strict';
    var i,
      match,
      self = this,
      pointerValue;
    if (!this.animating) {
      window.requestAnimationFrame(function(t) { //           Will only run if in focus
        if (self.initialised) {
          self.pointerValue = value;
          if (self.theme.callback && self.theme.callback.pointer) {
            pointerValue = self.theme.callback.pointer(value);
          } else {
            pointerValue = value;
          }
          self.pointerValue = value;
          if (self.lastValue !== null) {
            if (pointerValue instanceof Array) {
              match = true;
              for (i = 0; i < pointerValue.length; i++) {
                if (pointerValue[i] !== self.lastValue[i]) {
                  match = false;
                  break;
                }
              }
              if (match) return;
            } else if (self.lastValue === pointerValue) {
              return;
            }
            self.__animate(pointerValue);
          } else {
            self.__update(pointerValue);
            if (pointerValue instanceof Array) {
              self.lastValue = [];
              for (i = 0; i < pointerValue.length; i++) {
                self.lastValue[i] = pointerValue[i];
              }
            } else {
              self.lastValue = pointerValue;
            }
          }
        } else {
          self.initialised = true;
          if (!('render' in self.theme) || self.theme.render) {
            self.__render(value);
          }
        }
      });
    }
  },

  get: function() {
    'use strict';
    return this.lastValue;
  },

  getTheme: function() {
    'use strict';
    return this.theme;
  },

  redraw: function(value) {
    'use strict';
    this.theme.render = true;
    if ('undefined' === typeof value) {
      this.__render(this.lastValue);
    } else {
      this.__render(value);
    }
  }
};

