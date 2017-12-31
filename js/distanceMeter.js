"use strict";
exports.__esModule = true;
var globals_1 = require("./globals");
var imageLoader_1 = require("./imageLoader");
var config = {
    // Number of digits.
    MAX_DISTANCE_UNITS: 5,
    // Distance that causes achievement animation.
    ACHIEVEMENT_DISTANCE: 100,
    // Used for conversion from pixel distance to a scaled unit.
    COEFFICIENT: 0.025,
    // Flash duration in milliseconds.
    FLASH_DURATION: 1000 / 4,
    // Flash iterations for achievement animation.
    FLASH_ITERATIONS: 3
};
/**
* Handles displaying the distance meter.
*/
var DistanceMeter = /** @class */ (function () {
    function DistanceMeter(canvas, canvasWidth) {
        this.canvas = canvas;
        this.x = 0;
        this.y = 5;
        this.currentDistance = 0;
        // Maximum displayable score
        this.maxScore = 0;
        this.highScore = [];
        this.container = null;
        this.digits = [];
        this.acheivement = false;
        this.defaultString = '';
        this.flashTimer = 0;
        this.flashIterations = 0;
        this.canvasCtx = canvas.getContext('2d');
        imageLoader_1["default"].load("text");
        this.init(canvasWidth);
    }
    /**
      * Initialise the distance meter to '00000'.
      * @param {number} width Canvas width in px.
      */
    DistanceMeter.prototype.init = function (width) {
        var maxDistanceStr = '';
        this.calcXPos(width);
        for (var i = 0; i < config.MAX_DISTANCE_UNITS; i++) {
            this.draw(i, 0);
            this.defaultString += '0';
            maxDistanceStr += '9';
        }
        this.maxScore = parseInt(maxDistanceStr);
    };
    /**
     * Calculate the xPos in the canvas.
     * @param {number} canvasWidth
     */
    DistanceMeter.prototype.calcXPos = function (canvasWidth) {
        this.x = canvasWidth - (DistanceMeter.dimensions.DEST_WIDTH *
            (config.MAX_DISTANCE_UNITS + 1));
    };
    /**
     * Draw a digit to canvas.
     * @param {number} digitPos Position of the digit.
     * @param {number} value Digit value 0-9.
     * @param {boolean?} opt_highScore Whether drawing the high score.
     */
    DistanceMeter.prototype.draw = function (digitPos, value, opt_highScore) {
        var sourceWidth = DistanceMeter.dimensions.WIDTH;
        var sourceHeight = DistanceMeter.dimensions.HEIGHT;
        var sourceX = DistanceMeter.dimensions.WIDTH * value;
        var targetX = digitPos * DistanceMeter.dimensions.DEST_WIDTH;
        var targetY = this.y;
        var targetWidth = DistanceMeter.dimensions.WIDTH;
        var targetHeight = DistanceMeter.dimensions.HEIGHT;
        // For high DPI we 2x source values.
        if (globals_1.IS_HIDPI) {
            sourceWidth *= 2;
            sourceHeight *= 2;
            sourceX *= 2;
        }
        this.canvasCtx.save();
        if (opt_highScore) {
            // Left of the current score.
            var highScoreX = this.x - (config.MAX_DISTANCE_UNITS * 2) *
                DistanceMeter.dimensions.WIDTH;
            this.canvasCtx.translate(highScoreX, this.y);
        }
        else {
            this.canvasCtx.translate(this.x, this.y);
        }
        this.canvasCtx.drawImage(imageLoader_1["default"].get("text"), sourceX, 0, sourceWidth, sourceHeight, targetX, targetY, targetWidth, targetHeight);
        this.canvasCtx.restore();
    };
    /**
     * Covert pixel distance to a 'real' distance.
     * @param {number} distance Pixel distance ran.
     * @return {number} The 'real' distance ran.
     */
    DistanceMeter.prototype.getActualDistance = function (distance) {
        return distance ?
            Math.round(distance * config.COEFFICIENT) : 0;
    };
    /**
     * Update the distance meter.
     * @param {number} deltaTime
     * @param {number} distance
     * @return {boolean} Whether the acheivement sound fx should be played.
     */
    DistanceMeter.prototype.update = function (deltaTime, distance) {
        var paint = true;
        var playSound = false;
        if (!this.acheivement) {
            distance = this.getActualDistance(distance);
            if (distance > 0) {
                // Acheivement unlocked
                if (distance % config.ACHIEVEMENT_DISTANCE == 0) {
                    // Flash score and play sound.
                    this.acheivement = true;
                    this.flashTimer = 0;
                    playSound = true;
                }
                // Create a string representation of the distance with leading 0.
                var distanceStr = (this.defaultString +
                    distance).substr(-config.MAX_DISTANCE_UNITS);
                this.digits = distanceStr.split('');
            }
            else {
                this.digits = this.defaultString.split('');
            }
        }
        else {
            // Control flashing of the score on reaching acheivement.
            if (this.flashIterations <= config.FLASH_ITERATIONS) {
                this.flashTimer += deltaTime;
                if (this.flashTimer < config.FLASH_DURATION) {
                    paint = false;
                }
                else if (this.flashTimer >
                    config.FLASH_DURATION * 2) {
                    this.flashTimer = 0;
                    this.flashIterations++;
                }
            }
            else {
                this.acheivement = false;
                this.flashIterations = 0;
                this.flashTimer = 0;
            }
        }
        // Draw the digits if not flashing.
        if (paint) {
            for (var i = this.digits.length - 1; i >= 0; i--) {
                this.draw(i, parseInt(this.digits[i]));
            }
        }
        this.drawHighScore();
        return playSound;
    };
    /**
     * Draw the high score.
     */
    DistanceMeter.prototype.drawHighScore = function () {
        this.canvasCtx.save();
        this.canvasCtx.globalAlpha = .8;
        for (var i = this.highScore.length - 1; i >= 0; i--) {
            this.draw(i, parseInt(this.highScore[i], 10), true);
        }
        this.canvasCtx.restore();
    };
    /**
     * Set the highscore as a array string.
     * Position of char in the sprite: H - 10, I - 11.
     * @param {number} distance Distance ran in pixels.
     */
    DistanceMeter.prototype.setHighScore = function (distance) {
        distance = this.getActualDistance(distance);
        var highScoreStr = (this.defaultString +
            distance).substr(-config.MAX_DISTANCE_UNITS);
        this.highScore = ['10', '11', ''].concat(highScoreStr.split(''));
    };
    /**
     * Reset the distance meter back to '00000'.
     */
    DistanceMeter.prototype.reset = function () {
        this.update(0);
        this.acheivement = false;
    };
    DistanceMeter.dimensions = {
        WIDTH: 10,
        HEIGHT: 13,
        DEST_WIDTH: 11
    };
    /**
     * Y positioning of the digits in the sprite sheet.
     * X position is always 0.
     */
    DistanceMeter.yPos = [0, 13, 27, 40, 53, 67, 80, 93, 107, 120];
    return DistanceMeter;
}());
exports["default"] = DistanceMeter;
