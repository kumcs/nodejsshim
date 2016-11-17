--DO NOT EDIT THIS FILE! This file is generated by running the 'npm run build' command from this repos root. 
SELECT nodejsshim.npm_install('nodejsshim'::text, 'timers'::text, '1.0.0-rc'::text, 'https://github.com/xtuple/qt-script-node-js-shims'::text, $code_body$ 
require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"timers":[function(require,module,exports){
/**
 * This is a shim to add the `clearImmediate`, `clearInterval`, `clearTimeout`,
 * `setImmediate`, `setInterval` and `setTimeout` functions to Qt Scripting.
 * It uses the `QTimer` to do this.
 *
 * To use this in your code, add these lines to the top of the file:
 *
 *  (function _timers() {
 *    var _timers = require("timers");
 *    clearImmediate = _timers.clearImmediate;
 *    clearInterval = _timers.clearInterval;
 *    clearTimeout = _timers.clearTimeout;
 *    setImmediate = _timers.setImmediate;
 *    setInterval = _timers.setInterval;
 *    setTimeout = _timers.setTimeout;
 *  })();
 */

var timers = (function () {
  var activeTimers = {};

  function _handle (cb, ms, args, singleShot) {
    var timer = new QTimer();
    var timerId = timer.timerId();

    timer.interval = ms; // Set the time in milliseconds.
    // `singleShot` is `true` in-case of `setImmediate` and `setTimout` and `false` in-case of `setInterval`.
    timer.singleShot = singleShot;

    timer._called = false;
    timer._idleTimeout = ms;
    timer._idlePrev = timer;
    timer._idleNext = timer;
    timer._idleStart = null;
    timer._onTimeout = null;
    timer._repeat = null;

    timer.timeout.connect(function() {
      if (singleShot && activeTimers[timerId]) {
        activeTimers[timerId].stop();
        delete activeTimers[timerId];
      }

      var length = args.length;

      switch (length) {
        // fast cases
        case 0:
        case 1:
        case 2:
          cb.call(timer);
          break;
        case 3:
          cb.call(timer, args[2]);
          break;
        case 4:
          cb.call(timer, args[2], args[3]);
          break;
        case 5:
          cb.call(timer, args[2], args[3], args[4]);
          break;
        // slow case
        default:
          var shiftArgs = new Array(length - 2);
          for (var i = 2; i < length; i++) {
            shiftArgs[i - 2] = shiftArgs[i];
          }
          cb.apply(timer, shiftArgs);
          break;
      }
    });

    timer.start();
    timerId = timer.timerId();
    activeTimers[timerId] = timer;

    return timer;
  }

  function _clear (timer, singleShot) {
    if (timer) {
      var timerId = timer.timerId();
      if (activeTimers[timerId]) {
        activeTimers[timerId].stop();
        delete activeTimers[timerId];
      }
    }
  }

  /**
   * Emulate Node.js's `clearImmediate(immediateObject)` function.
   * @See: https://nodejs.org/dist/latest-v4.x/docs/api/timers.html#timers_clearimmediate_immediateobject
   *
   * @param {Object} [timer] - The timer to clear.
   */
  function clearImmediate(timer) {
    _clear(timer, false);
  }

  /**
   * Emulate Node.js's `clearInterval(intervalObject)` function.
   * @See: https://nodejs.org/dist/latest-v4.x/docs/api/timers.html#timers_clearinterval_intervalobject
   *
   * @param {Object} [timer] - The timer to clear.
   */
  function clearInterval(timer) {
    _clear(timer, false);
  }

  /**
   * Emulate Node.js's `clearTimeout(timeoutObject)` function.
   * @See: https://nodejs.org/dist/latest-v4.x/docs/api/timers.html#timers_cleartimeout_timeoutobject
   *
   * @param {Object} [timer] - The timer to clear.
   */
  function clearTimeout (timer) {
    _clear(timer, true);
  }

  /**
   * Emulate Node.js's `setImmediate(callback[, arg][, ...])` function.
   * @See: https://nodejs.org/dist/latest-v4.x/docs/api/timers.html#timers_setimmediate_callback_arg
   *
   * @param {Function} [cb] - The function to call when the timeout happens.
   */
  function setImmediate(cb) {
    return _handle(cb, 0, arguments, true);
  }

  /**
   * Emulate Node.js's `setInterval(callback, delay[, arg][, ...])` function.
   * @See: https://nodejs.org/dist/latest-v4.x/docs/api/timers.html#timers_setinterval_callback_delay_arg
   *
   * @param {Function} [cb] - The function to call when the timeout happens.
   * @param {Integer} [ms] - The number of milliseconds to wait before calling the `cb` function.
   */
  function setInterval(cb, ms) {
    return _handle(cb, ms, arguments, false);
  }

  /**
   * Emulate Node.js's `setTimeout(callback, delay[, arg][, ...])` function.
   * @See: https://nodejs.org/dist/latest-v4.x/docs/api/timers.html#timers_settimeout_callback_delay_arg
   *
   * @param {Function} [cb] - The function to call when the timeout happens.
   * @param {Integer} [ms] - The number of milliseconds to wait before calling the `cb` function.
   */
  function setTimeout (cb, ms) {
    return _handle(cb, ms, arguments, true);
  }

  return {
    clearImmediate: clearImmediate,
    clearInterval: clearInterval,
    clearTimeout: clearTimeout,
    setImmediate: setImmediate,
    setInterval: setInterval,
    setTimeout: setTimeout
  }
})();

module.exports = {
  clearImmediate: timers.clearImmediate,
  clearInterval: timers.clearInterval,
  clearTimeout: timers.clearTimeout,
  setImmediate: timers.setImmediate,
  setInterval: timers.setInterval,
  setTimeout: timers.setTimeout
};

},{}]},{},[]); 
$code_body$::text); 
