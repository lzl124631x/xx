"use strict";
exports.__esModule = true;
var globals_1 = require("./globals");
/**
* Cloud background item.
* Similar to an obstacle object but without collision boxes.
* @param {HTMLCanvasElement} canvas Canvas element.
* @param {Image} cloudImg
* @param {number} containerWidth
*/
var Cloud = /** @class */ (function () {
    function Cloud(canvas, image, containerWidth) {
        this.canvas = canvas;
        this.image = image;
        this.containerWidth = containerWidth;
        this.xPos = 0;
        this.yPos = globals_1.getRandomNum(Cloud.config.MAX_SKY_LEVEL, Cloud.config.MIN_SKY_LEVEL);
        this.remove = false;
        this.cloudGap = globals_1.getRandomNum(Cloud.config.MIN_CLOUD_GAP, Cloud.config.MAX_CLOUD_GAP);
        this.canvasCtx = this.canvas.getContext('2d');
        this.xPos = containerWidth;
        this.init();
    }
    /**
     * Initialise the cloud. Sets the Cloud height.
     */
    Cloud.prototype.init = function () {
        this.draw();
    };
    /**
     * Draw the cloud.
     */
    Cloud.prototype.draw = function () {
        this.canvasCtx.save();
        var sourceWidth = Cloud.config.WIDTH;
        var sourceHeight = Cloud.config.HEIGHT;
        if (globals_1.IS_HIDPI) {
            sourceWidth = sourceWidth * 2;
            sourceHeight = sourceHeight * 2;
        }
        this.canvasCtx.drawImage(this.image, 0, 0, sourceWidth, sourceHeight, this.xPos, this.yPos, Cloud.config.WIDTH, Cloud.config.HEIGHT);
        this.canvasCtx.restore();
    };
    /**
     * Update the cloud position.
     */
    Cloud.prototype.update = function (speed) {
        if (!this.remove) {
            this.xPos -= Math.ceil(speed);
            this.draw();
            // Mark as removeable if no longer in the canvas.
            if (!this.isVisible()) {
                this.remove = true;
            }
        }
    };
    /**
     * Check if the cloud is visible on the stage.
     * @return {boolean}
     */
    Cloud.prototype.isVisible = function () {
        return this.xPos + Cloud.config.WIDTH > 0;
    };
    /**
    * Cloud object config.
    */
    Cloud.config = {
        HEIGHT: 14,
        MAX_CLOUD_GAP: 400,
        MAX_SKY_LEVEL: 30,
        MIN_CLOUD_GAP: 100,
        MIN_SKY_LEVEL: 71,
        WIDTH: 46
    };
    return Cloud;
}());
exports["default"] = Cloud;
