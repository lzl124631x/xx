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
var IMG_SRC = "./asset/image/horizon-line.png";
var WIDTH = window.innerWidth;
var HEIGHT = 12;
/**
 * Horizon Line.
 * Consists of two connecting lines. Randomly assigns a flat / bumpy horizon.
 */
var HorizonLine = /** @class */ (function (_super) {
    __extends(HorizonLine, _super);
    function HorizonLine(canvas, image, dimensions) {
        var _this = _super.call(this, IMG_SRC, WIDTH, HEIGHT, 0, dimensions.HEIGHT - 20) || this;
        _this.canvas = canvas;
        _this.image = image;
        _this.bumpThreshold = 0.5;
        _this.canvasCtx = canvas.getContext('2d');
        _this.draw();
        return _this;
    }
    /**
     * Return the crop x position of a type.
     */
    HorizonLine.prototype.getRandomType = function () {
        return Math.random() > this.bumpThreshold ? this.width : 0;
    };
    /**
     * Draw the horizon line.
     */
    HorizonLine.prototype.draw = function () {
        this.canvasCtx.drawImage(this.image, 0, 0, this.width, this.height, this.x, this.y, this.width, this.height);
        // If thix.x > 0, this segment is leftmost, with x = this.x - this.width.
        // Otherwise, this segment is rightmost, with x = this.x + this.width.
        this.canvasCtx.drawImage(this.image, WIDTH, 0, this.width, this.height, this.x > 0 ? this.x - this.width : this.x + this.width, this.y, this.width, this.height);
    };
    // TODO: make this impl. the same as the original.
    HorizonLine.prototype.updateXPos = function (increment) {
        this.x -= increment;
        if (this.x <= -this.width) {
            this.x = this.width;
        }
    };
    /**
     * Update the horizon line.
     * @param {number} deltaTime
     * @param {number} speed
     */
    HorizonLine.prototype.update = function (deltaTime, speed) {
        var increment = Math.floor(speed * (globals_1.FPS / 1000) * deltaTime);
        this.updateXPos(increment);
        this.draw();
    };
    /**
     * Reset horizon to the starting position.
     */
    HorizonLine.prototype.reset = function () {
        this.x = 0;
    };
    return HorizonLine;
}(sprite_1["default"]));
exports["default"] = HorizonLine;
