"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var globals_1 = require("./globals");
var sprite_1 = require("./base/sprite");
var IMG_SRC = 'asset/image/cloud.png';
var WIDTH = 46;
var HEIGHT = 14;
var MAX_SKY_LEVEL = 30;
var MIN_SKY_LEVEL = 71;
var MAX_CLOUD_GAP = 400;
var MIN_CLOUD_GAP = 100;
/**
* Cloud background item.
* Similar to an obstacle object but without collision boxes.
*/
var Cloud = /** @class */ (function (_super) {
    __extends(Cloud, _super);
    function Cloud(canvas, containerWidth) {
        var _this = _super.call(this, IMG_SRC, WIDTH, HEIGHT) || this;
        _this.canvas = canvas;
        _this.containerWidth = containerWidth;
        _this.remove = false;
        _this.cloudGap = globals_1.getRandomNum(MIN_CLOUD_GAP, MAX_CLOUD_GAP);
        _this.canvasCtx = _this.canvas.getContext('2d');
        _this.x = containerWidth;
        _this.y = globals_1.getRandomNum(MAX_SKY_LEVEL, MIN_SKY_LEVEL);
        return _this;
    }
    Cloud.prototype.update = function (speed) {
        if (!this.remove) {
            this.x -= Math.ceil(speed);
            this.drawToCanvas(this.canvasCtx);
            // Mark as removeable if no longer in the canvas.
            if (!this.isVisible()) {
                this.remove = true;
            }
        }
    };
    Cloud.prototype.isVisible = function () {
        return this.x + WIDTH > 0;
    };
    Cloud.prototype.needNextCloud = function (containerWidth) {
        return containerWidth - this.x > this.cloudGap;
    };
    return Cloud;
}(sprite_1["default"]));
exports["default"] = Cloud;
