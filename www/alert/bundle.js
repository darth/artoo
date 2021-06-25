(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],2:[function(require,module,exports){
(function (setImmediate,clearImmediate){(function (){
var nextTick = require('process/browser.js').nextTick;
var apply = Function.prototype.apply;
var slice = Array.prototype.slice;
var immediateIds = {};
var nextImmediateId = 0;

// DOM APIs, for completeness

exports.setTimeout = function() {
  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
};
exports.setInterval = function() {
  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
};
exports.clearTimeout =
exports.clearInterval = function(timeout) { timeout.close(); };

function Timeout(id, clearFn) {
  this._id = id;
  this._clearFn = clearFn;
}
Timeout.prototype.unref = Timeout.prototype.ref = function() {};
Timeout.prototype.close = function() {
  this._clearFn.call(window, this._id);
};

// Does not start the time, just sets up the members needed.
exports.enroll = function(item, msecs) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = msecs;
};

exports.unenroll = function(item) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = -1;
};

exports._unrefActive = exports.active = function(item) {
  clearTimeout(item._idleTimeoutId);

  var msecs = item._idleTimeout;
  if (msecs >= 0) {
    item._idleTimeoutId = setTimeout(function onTimeout() {
      if (item._onTimeout)
        item._onTimeout();
    }, msecs);
  }
};

// That's not how node.js implements it but the exposed api is the same.
exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function(fn) {
  var id = nextImmediateId++;
  var args = arguments.length < 2 ? false : slice.call(arguments, 1);

  immediateIds[id] = true;

  nextTick(function onNextTick() {
    if (immediateIds[id]) {
      // fn.call() is faster so we optimize for the common use-case
      // @see http://jsperf.com/call-apply-segu
      if (args) {
        fn.apply(null, args);
      } else {
        fn.call(null);
      }
      // Prevent ids from leaking
      exports.clearImmediate(id);
    }
  });

  return id;
};

exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function(id) {
  delete immediateIds[id];
};
}).call(this)}).call(this,require("timers").setImmediate,require("timers").clearImmediate)
},{"process/browser.js":1,"timers":2}],3:[function(require,module,exports){
(function (setImmediate){(function (){
"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
/*
 * Javascript WaitQueue Object
 * https://github.com/flarestart/wait-queue
 */
var LinkedList_1 = __importDefault(require("./libs/LinkedList"));
var nextLoop = (function () {
    if (typeof setImmediate === 'function') {
        return setImmediate;
    }
    /* istanbul ignore next */
    return function (fn) { return setTimeout(fn, 0); };
})();
var WaitQueue = /** @class */ (function () {
    function WaitQueue() {
        this.queue = new LinkedList_1.default();
        this.listeners = new LinkedList_1.default();
    }
    Object.defineProperty(WaitQueue.prototype, "length", {
        get: function () {
            return this.queue.length;
        },
        enumerable: true,
        configurable: true
    });
    WaitQueue.prototype.empty = function () {
        this.queue = new LinkedList_1.default();
    };
    WaitQueue.prototype.clear = function () {
        this.queue = new LinkedList_1.default();
    };
    WaitQueue.prototype.clearListeners = function () {
        var e_1, _a;
        try {
            for (var _b = __values(this.listeners), _c = _b.next(); !_c.done; _c = _b.next()) {
                var listener = _c.value;
                listener(new Error('Clear Listeners'));
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        this.listeners = new LinkedList_1.default();
    };
    WaitQueue.prototype.unshift = function () {
        var _a;
        var items = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            items[_i] = arguments[_i];
        }
        (_a = this.queue).unshift.apply(_a, __spread(items));
        this._flush();
        return this.length;
    };
    WaitQueue.prototype.push = function () {
        var _a;
        var items = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            items[_i] = arguments[_i];
        }
        (_a = this.queue).push.apply(_a, __spread(items));
        this._flush();
        return this.length;
    };
    WaitQueue.prototype.shift = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (_this.queue.length > 0) {
                return resolve(_this.queue.shift());
            }
            else {
                _this.listeners.push(function (err) {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(_this.queue.shift());
                });
            }
        });
    };
    WaitQueue.prototype.pop = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (_this.queue.length > 0) {
                return resolve(_this.queue.pop());
            }
            else {
                _this.listeners.push(function (err) {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(_this.queue.pop());
                });
            }
        });
    };
    WaitQueue.prototype._flush = function () {
        if (this.queue.length > 0 && this.listeners.length > 0) {
            var listener = this.listeners.shift();
            listener.call(this);
            // delay next loop
            nextLoop(this._flush.bind(this));
        }
    };
    return WaitQueue;
}());
if (typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol') {
    WaitQueue.prototype[Symbol.iterator] = function () {
        var node = this.queue._front;
        return {
            next: function () {
                if (node === null) {
                    return { value: null, done: true };
                }
                else {
                    var r = { value: node.item, done: false };
                    node = node._next;
                    return r;
                }
            },
        };
    };
}
module.exports = WaitQueue;

}).call(this)}).call(this,require("timers").setImmediate)
},{"./libs/LinkedList":4,"timers":2}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function createNode(item) {
    return {
        _next: null,
        _prev: null,
        item: item
    };
}
var LinkedList = /** @class */ (function () {
    function LinkedList() {
        this._length = 0;
        this._front = null;
        this._end = null;
    }
    Object.defineProperty(LinkedList.prototype, "length", {
        get: function () {
            return this._length;
        },
        enumerable: true,
        configurable: true
    });
    LinkedList.prototype.empty = function () {
        this._length = 0;
        this._front = null;
        this._end = null;
    };
    LinkedList.prototype.push = function () {
        var _this = this;
        var items = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            items[_i] = arguments[_i];
        }
        items.forEach(function (item) {
            var node = createNode(item);
            if (_this._front && _this._end) {
                _this._end._next = node;
                node._prev = _this._end;
                _this._end = node;
            }
            else {
                _this._front = node;
                _this._end = node;
            }
            _this._length++;
        });
        return this._length;
    };
    LinkedList.prototype.shift = function () {
        var item = this._front;
        if (item === null) {
            return null;
        }
        if (item._next != null) {
            this._front = item._next;
            this._front._prev = null;
        }
        else {
            this._front = null;
            this._end = null;
        }
        item._next = null;
        this._length--;
        return item.item;
    };
    LinkedList.prototype.unshift = function () {
        var _this = this;
        var items = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            items[_i] = arguments[_i];
        }
        items.forEach(function (item) {
            var node = createNode(item);
            if (_this._front === null) {
                _this._front = node;
                _this._end = node;
            }
            else {
                node._next = _this._front;
                _this._front._prev = node;
                _this._front = node;
            }
            _this._length++;
        });
        return this._length;
    };
    LinkedList.prototype.pop = function () {
        var item = this._end;
        if (item === null) {
            return null;
        }
        if (item._prev != null) {
            this._end = item._prev;
            this._end._next = null;
        }
        else {
            this._front = null;
            this._end = null;
        }
        this._length--;
        item._prev = null;
        return item.item;
    };
    return LinkedList;
}());
/* istanbul ignore next */
if (typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol') {
    LinkedList.prototype[Symbol.iterator] = function () {
        var node = this._front;
        return {
            next: function () {
                if (node === null) {
                    return { value: null, done: true };
                }
                var r = { value: node.item, done: false };
                node = node._next;
                return r;
            }
        };
    };
}
exports.default = LinkedList;

},{}],5:[function(require,module,exports){
const WaitQueue = require("wait-queue");

const wq = new WaitQueue();

const handle = async msg => {
  const div = document.getElementById("alert");
  const img = document.getElementById("img");
  const text = document.getElementById("text");
  img.src = "pics/" + msg.img;
  text.textContent = msg.text;
  div.style.display = "flex";
  const sound = document.createElement("audio");
  sound.id = "sound";
  sound.src = "sounds/" + msg.sound;
  sound.type = "audio/mpeg";
  sound.autoplay = true;
  div.appendChild(sound);
  setTimeout(async () => {
    div.style.display = "none";
    div.removeChild(sound);
    setTimeout(() => {
      wq.shift().then(handle);
    }, msg.pause * 1000);
  }, msg.duration * 1000);
};

wq.shift().then(handle);
const socket = io();
socket.on("alert", function (msg) {
  wq.push(msg);
});

},{"wait-queue":3}]},{},[5]);
