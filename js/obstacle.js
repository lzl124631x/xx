"use strict";
exports.__esModule = true;
var globals_1 = require("./globals");
var collisionBox_1 = require("./collisionBox");
var imageLoader_1 = require("./imageLoader");
/**
* Obstacle.
* @param {HTMLCanvasCtx} canvasCtx
* @param {Obstacle.type} type
* @param {image} obstacleImg Image sprite.
* @param {Object} dimensions
* @param {number} gapCoefficient Mutipler in determining the gap.
* @param {number} speed
*/
var Obstacle = /** @class */ (function () {
    function Obstacle(canvasCtx, typeConfig, dimensions, gapCoefficient, speed) {
        this.canvasCtx = canvasCtx;
        this.typeConfig = typeConfig;
        this.dimensions = dimensions;
        this.gapCoefficient = gapCoefficient;
        // The count of cactus in one group
        this.size = globals_1.getRandomNum(1, Obstacle.MAX_OBSTACLE_LENGTH);
        this.remove = false;
        this.xPos = 0;
        this.yPos = 0;
        this.collisionBoxes = [];
        this.gap = 0;
        this.followingObstacleCreated = false;
        var typeName = typeConfig.type;
        imageLoader_1["default"].load(typeName, Obstacle.imageSources["LDPI"][typeName]); // TODO: enable LDPI and HDPI.
        this.yPos = this.typeConfig.yPos + this.dimensions.HEIGHT - 150;
        this.init(speed);
    }
    Obstacle.randomCreate = function (canvasCtx, dimensions, gapCoefficient, speed) {
        var type = Obstacle.types[globals_1.getRandomNum(0, Obstacle.types.length - 1)];
        return new Obstacle(canvasCtx, type, dimensions, gapCoefficient, speed);
    };
    /**
      * Initialise the DOM for the obstacle.
      * @param {number} speed
      */
    Obstacle.prototype.init = function (speed) {
        this.cloneCollisionBoxes();
        // Only allow sizing if we're at the right speed.
        if (this.size > 1 && this.typeConfig.multipleSpeed > speed) {
            this.size = 1;
        }
        this.width = this.typeConfig.width * this.size;
        this.xPos = this.dimensions.WIDTH - this.width;
        this.draw();
        // Make collision box adjustments,
        // Central box is adjusted to the size as one box.
        // ____ ______ ________
        // _| |-| _| |-| _| |-|
        // | |<->| | | |<--->| | | |<----->| |
        // | | 1 | | | | 2 | | | | 3 | |
        // |_|___|_| |_|_____|_| |_|_______|_|
        //
        if (this.size > 1) {
            this.collisionBoxes[1].width = this.width - this.collisionBoxes[0].width -
                this.collisionBoxes[2].width;
            this.collisionBoxes[2].x = this.width - this.collisionBoxes[2].width;
        }
        this.gap = this.getGap(this.gapCoefficient, speed);
    };
    /**
     * Draw and crop based on size.
     */
    Obstacle.prototype.draw = function () {
        var sourceWidth = this.typeConfig.width;
        var sourceHeight = this.typeConfig.height;
        if (globals_1.IS_HIDPI) {
            sourceWidth = sourceWidth * 2;
            sourceHeight = sourceHeight * 2;
        }
        // Sprite
        var sourceX = (sourceWidth * this.size) * (0.5 * (this.size - 1));
        this.canvasCtx.drawImage(imageLoader_1["default"].get(this.typeConfig.type), sourceX, 0, sourceWidth * this.size, sourceHeight, this.xPos, this.yPos, this.typeConfig.width * this.size, this.typeConfig.height);
    };
    /**
     * Obstacle frame update.
     */
    Obstacle.prototype.update = function (deltaTime, speed) {
        if (!this.remove) {
            this.xPos -= Math.floor((speed * globals_1.FPS / 1000) * deltaTime);
            this.draw();
            if (!this.isVisible()) {
                this.remove = true;
            }
        }
    };
    /**
     * Calculate a random gap size.
     * - Minimum gap gets wider as speed increses
     * @return {number} The gap size.
     */
    Obstacle.prototype.getGap = function (gapCoefficient, speed) {
        var minGap = Math.round(this.width * speed +
            this.typeConfig.minGap * gapCoefficient);
        var maxGap = Math.round(minGap * Obstacle.MAX_GAP_COEFFICIENT);
        return globals_1.getRandomNum(minGap, maxGap);
    };
    /**
     * Check if obstacle is visible.
     * @return {boolean} Whether the obstacle is in the game area.
     */
    Obstacle.prototype.isVisible = function () {
        return this.xPos + this.width > 0;
    };
    /**
     * Make a copy of the collision boxes, since these will change based on
     * obstacle type and size.
     */
    Obstacle.prototype.cloneCollisionBoxes = function () {
        var collisionBoxes = this.typeConfig.collisionBoxes;
        for (var i = collisionBoxes.length - 1; i >= 0; i--) {
            this.collisionBoxes[i] = new collisionBox_1["default"](collisionBoxes[i].x, collisionBoxes[i].y, collisionBoxes[i].width, collisionBoxes[i].height);
        }
    };
    Obstacle.prototype.isNextObstacleNeeded = function (width) {
        return !this.followingObstacleCreated && this.isVisible() &&
            (this.xPos + this.width + this.gap) < width;
    };
    Obstacle.prototype.getCollisionBox = function () {
        // Adjustments are made to the bounding box as there is a 1 pixel white border around
        return new collisionBox_1["default"](this.xPos + 1, this.yPos + 1, this.typeConfig.width * this.size - 2, this.typeConfig.height - 2);
    };
    Obstacle.imageSources = {
        LDPI: {
            'CACTUS_LARGE': '1x-obstacle-large',
            'CACTUS_SMALL': '1x-obstacle-small'
        },
        HDPI: {
            'CACTUS_LARGE': '2x-obstacle-large',
            'CACTUS_SMALL': '2x-obstacle-small'
        }
    };
    /**
    * Coefficient for calculating the maximum gap.
    */
    Obstacle.MAX_GAP_COEFFICIENT = 1.5;
    /**
     * Maximum obstacle grouping count.
     */
    Obstacle.MAX_OBSTACLE_LENGTH = 3;
    /**
     * Obstacle definitions.
     * minGap: minimum pixel space betweeen obstacles.
     * multipleSpeed: Speed at which multiples are allowed.
     */
    Obstacle.types = [{
            type: 'CACTUS_SMALL',
            className: ' cactus cactus-small ',
            width: 17,
            height: 35,
            yPos: 105,
            multipleSpeed: 3,
            minGap: 120,
            collisionBoxes: [
                new collisionBox_1["default"](0, 7, 5, 27),
                new collisionBox_1["default"](4, 0, 6, 34),
                new collisionBox_1["default"](10, 4, 7, 14)
            ]
        },
        {
            type: 'CACTUS_LARGE',
            className: ' cactus cactus-large ',
            width: 25,
            height: 50,
            yPos: 90,
            multipleSpeed: 6,
            minGap: 120,
            collisionBoxes: [
                new collisionBox_1["default"](0, 12, 7, 38),
                new collisionBox_1["default"](8, 0, 7, 49),
                new collisionBox_1["default"](13, 10, 10, 38)
            ]
        }
    ];
    return Obstacle;
}());
exports["default"] = Obstacle;
