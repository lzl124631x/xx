"use strict";
exports.__esModule = true;
exports.IS_IOS = window.navigator.userAgent.indexOf('UIWebViewForStaticFileContent') > -1;
exports.IS_MOBILE = false;
exports.FPS = 60;
exports.IS_HIDPI = window.devicePixelRatio > 1;
/**
 * Return the current timestamp.
 */
function getTimeStamp() {
    return exports.IS_IOS ? new Date().getTime() : performance.now();
}
exports.getTimeStamp = getTimeStamp;
/**
 * Get random number.
 * @param {number} min
 * @param {number} max
 * @param {number}
 */
function getRandomNum(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
exports.getRandomNum = getRandomNum;
