"use strict";
exports.__esModule = true;
exports.IS_IOS = window.navigator.userAgent.indexOf('UIWebViewForStaticFileContent') > -1;
exports.FPS = 60;
// TODO: 2x-horizon is too large (2400x24) that exceeds the MAX_TEXTURE_SIZE 2048.
// Disabled HDPI temporarily.
exports.IS_HIDPI = false; //window.devicePixelRatio > 1;
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
