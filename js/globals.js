"use strict";
exports.__esModule = true;
exports.IS_IOS = window.navigator.userAgent.indexOf('UIWebViewForStaticFileContent') > -1;
exports.FPS = 60;
exports.IS_HIDPI = window.devicePixelRatio > 1;
function getTimeStamp() {
    return exports.IS_IOS ? new Date().getTime() : performance.now();
}
exports.getTimeStamp = getTimeStamp;
function getRandomNum(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
exports.getRandomNum = getRandomNum;
function arrayClone(array) {
    return array.slice(0);
}
exports.arrayClone = arrayClone;
