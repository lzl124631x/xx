"use strict";
exports.__esModule = true;
var globals_1 = require("./globals");
/**
 * Horizon Line.
 * Consists of two connecting lines. Randomly assigns a flat / bumpy horizon.
 * @param {HTMLCanvasElement} canvas
 * @param {HTMLImage} bgImg Horizon line sprite.
 * @constructor
 */
var HorizonLine = /** @class */ (function () {
    function HorizonLine(canvas, image) {
        this.canvas = canvas;
        this.image = image;
        this.sourceDimensions = {};
        this.dimensions = HorizonLine.dimensions;
        this.sourceXPos = [0, HorizonLine.dimensions.WIDTH];
        this.xPos = [];
        this.yPos = 0;
        this.bumpThreshold = 0.5;
        this.canvasCtx = canvas.getContext('2d');
        this.sourceDimensions = {};
        this.dimensions = HorizonLine.dimensions;
        this.sourceXPos = [0, this.dimensions.WIDTH];
        this.xPos = [];
        this.yPos = 0;
        this.bumpThreshold = 0.5;
        this.setSourceDimensions();
        this.draw();
    }
    /**
      * Set the source dimensions of the horizon line.
      */
    HorizonLine.prototype.setSourceDimensions = function () {
        for (var dimension in HorizonLine.dimensions) {
            if (globals_1.IS_HIDPI) {
                if (dimension != 'YPOS') {
                    this.sourceDimensions[dimension] =
                        HorizonLine.dimensions[dimension] * 2;
                }
            }
            else {
                this.sourceDimensions[dimension] =
                    HorizonLine.dimensions[dimension];
            }
            this.dimensions[dimension] = HorizonLine.dimensions[dimension];
        }
        this.xPos = [0, HorizonLine.dimensions.WIDTH];
        this.yPos = HorizonLine.dimensions.YPOS;
    };
    /**
     * Return the crop x position of a type.
     */
    HorizonLine.prototype.getRandomType = function () {
        return Math.random() > this.bumpThreshold ? this.dimensions.WIDTH : 0;
    };
    /**
     * Draw the horizon line.
     */
    HorizonLine.prototype.draw = function () {
        this.canvasCtx.drawImage(this.image, this.sourceXPos[0], 0, this.sourceDimensions.WIDTH, this.sourceDimensions.HEIGHT, this.xPos[0], this.yPos, this.dimensions.WIDTH, this.dimensions.HEIGHT);
        this.canvasCtx.drawImage(this.image, this.sourceXPos[1], 0, this.sourceDimensions.WIDTH, this.sourceDimensions.HEIGHT, this.xPos[1], this.yPos, this.dimensions.WIDTH, this.dimensions.HEIGHT);
    };
    /**
     * Update the x position of an indivdual piece of the line.
     * @param {number} pos Line position.
     * @param {number} increment
     */
    HorizonLine.prototype.updateXPos = function (pos, increment) {
        var line1 = pos;
        var line2 = pos == 0 ? 1 : 0;
        this.xPos[line1] -= increment;
        this.xPos[line2] = this.xPos[line1] + this.dimensions.WIDTH;
        if (this.xPos[line1] <= -this.dimensions.WIDTH) {
            this.xPos[line1] += this.dimensions.WIDTH * 2;
            this.xPos[line2] = this.xPos[line1] - this.dimensions.WIDTH;
            this.sourceXPos[line1] = this.getRandomType();
        }
    };
    /**
     * Update the horizon line.
     * @param {number} deltaTime
     * @param {number} speed
     */
    HorizonLine.prototype.update = function (deltaTime, speed) {
        var increment = Math.floor(speed * (globals_1.FPS / 1000) * deltaTime);
        if (this.xPos[0] <= 0) {
            this.updateXPos(0, increment);
        }
        else {
            this.updateXPos(1, increment);
        }
        this.draw();
    };
    /**
     * Reset horizon to the starting position.
     */
    HorizonLine.prototype.reset = function () {
        this.xPos[0] = 0;
        this.xPos[1] = HorizonLine.dimensions.WIDTH;
    };
    /**
    * Horizon line dimensions.
    * @enum {number}
    */
    HorizonLine.dimensions = {
        WIDTH: 600,
        HEIGHT: 12,
        YPOS: 127
    };
    return HorizonLine;
}());
exports["default"] = HorizonLine;
