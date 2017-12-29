"use strict";
exports.__esModule = true;
var globals_1 = require("./globals");
/**
* Game over panel.
* @param {!HTMLCanvasElement} canvas
* @param {!HTMLImage} textSprite
* @param {!HTMLImage} restartImg
* @param {!Object} dimensions Canvas dimensions.
* @constructor
*/
var GameOverPanel = /** @class */ (function () {
    function GameOverPanel(canvas, textSprite, restartImg, canvasDimensions) {
        this.canvas = canvas;
        this.textSprite = textSprite;
        this.restartImg = restartImg;
        this.canvasDimensions = canvasDimensions;
        this.canvasCtx = canvas.getContext('2d');
        this.draw();
    }
    /**
     * Update the panel dimensions.
     * @param {number} width New canvas width.
     * @param {number} height Optional new canvas height.
     */
    GameOverPanel.prototype.updateDimensions = function (width, height) {
        this.canvasDimensions.WIDTH = width;
        if (height) {
            this.canvasDimensions.HEIGHT = height;
        }
    };
    /**
     * Draw the panel.
     */
    GameOverPanel.prototype.draw = function () {
        var dimensions = GameOverPanel.dimensions;
        var centerX = this.canvasDimensions.WIDTH / 2;
        // Game over text.
        var textSourceX = dimensions.TEXT_X;
        var textSourceY = dimensions.TEXT_Y;
        var textSourceWidth = dimensions.TEXT_WIDTH;
        var textSourceHeight = dimensions.TEXT_HEIGHT;
        var textTargetX = Math.round(centerX - (dimensions.TEXT_WIDTH / 2));
        var textTargetY = Math.round((this.canvasDimensions.HEIGHT - 25) / 3);
        var textTargetWidth = dimensions.TEXT_WIDTH;
        var textTargetHeight = dimensions.TEXT_HEIGHT;
        var restartSourceWidth = dimensions.RESTART_WIDTH;
        var restartSourceHeight = dimensions.RESTART_HEIGHT;
        var restartTargetX = centerX - (dimensions.RESTART_WIDTH / 2);
        var restartTargetY = this.canvasDimensions.HEIGHT / 2;
        if (globals_1.IS_HIDPI) {
            textSourceY *= 2;
            textSourceX *= 2;
            textSourceWidth *= 2;
            textSourceHeight *= 2;
            restartSourceWidth *= 2;
            restartSourceHeight *= 2;
        }
        // Game over text from sprite.
        this.canvasCtx.drawImage(this.textSprite, textSourceX, textSourceY, textSourceWidth, textSourceHeight, textTargetX, textTargetY, textTargetWidth, textTargetHeight);
        // Restart button.
        this.canvasCtx.drawImage(this.restartImg, 0, 0, restartSourceWidth, restartSourceHeight, restartTargetX, restartTargetY, dimensions.RESTART_WIDTH, dimensions.RESTART_HEIGHT);
    };
    /**
     * Dimensions used in the panel.
     * @enum {number}
     */
    GameOverPanel.dimensions = {
        TEXT_X: 0,
        TEXT_Y: 13,
        TEXT_WIDTH: 191,
        TEXT_HEIGHT: 11,
        RESTART_WIDTH: 36,
        RESTART_HEIGHT: 32
    };
    return GameOverPanel;
}());
exports["default"] = GameOverPanel;
