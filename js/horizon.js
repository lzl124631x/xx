"use strict";
exports.__esModule = true;
var horizonLine_1 = require("./horizonLine");
var obstacle_1 = require("./obstacle");
var cloud_1 = require("./cloud");
/**
* Horizon background class.
* @constructor
*/
var Horizon = /** @class */ (function () {
    function Horizon(canvas, images, dimensions, gapCoefficient) {
        this.canvas = canvas;
        this.dimensions = dimensions;
        this.gapCoefficient = gapCoefficient;
        this.config = Horizon.config;
        this.obstacles = [];
        this.horizonOffsets = [0, 0];
        // Cloud
        this.clouds = [];
        this.cloudSpeed = Horizon.config.BG_CLOUD_SPEED;
        this.horizonLine = null;
        this.canvasCtx = this.canvas.getContext('2d');
        this.cloudFrequency = this.config.CLOUD_FREQUENCY;
        // Cloud
        this.clouds = [];
        this.cloudImg = images.CLOUD;
        this.cloudSpeed = this.config.BG_CLOUD_SPEED;
        // Horizon
        this.horizonImg = images.HORIZON;
        this.horizonLine = null;
        // Obstacles
        this.obstacleImgs = {
            CACTUS_SMALL: images.CACTUS_SMALL,
            CACTUS_LARGE: images.CACTUS_LARGE
        };
        this.init();
    }
    /**
      * Initialise the horizon. Just add the line and a cloud. No obstacles.
      */
    Horizon.prototype.init = function () {
        this.addCloud();
        this.horizonLine = new horizonLine_1["default"](this.canvas, this.horizonImg, this.dimensions);
    };
    /**
     * @param {number} deltaTime
     * @param {number} currentSpeed
     * @param {boolean} updateObstacles Used as an override to prevent
     * the obstacles from being updated / added. This happens in the
     * ease in section.
     */
    Horizon.prototype.update = function (deltaTime, currentSpeed, updateObstacles) {
        this.runningTime += deltaTime;
        this.horizonLine.update(deltaTime, currentSpeed);
        this.updateClouds(deltaTime, currentSpeed);
        if (updateObstacles) {
            this.updateObstacles(deltaTime, currentSpeed);
        }
    };
    Horizon.prototype.updateClouds = function (deltaTime, speed) {
        var cloudSpeed = this.cloudSpeed / 1000 * deltaTime * speed;
        var numClouds = this.clouds.length;
        if (numClouds) {
            for (var i = numClouds - 1; i >= 0; i--) {
                this.clouds[i].update(cloudSpeed);
            }
            var lastCloud = this.clouds[numClouds - 1];
            // Check for adding a new cloud.
            if (numClouds < this.config.MAX_CLOUDS &&
                lastCloud.needNextCloud(this.dimensions.WIDTH) &&
                this.cloudFrequency > Math.random()) {
                this.addCloud();
            }
            // Remove expired clouds.
            this.clouds = this.clouds.filter(function (cloud) { return !cloud.remove; });
        }
    };
    Horizon.prototype.updateObstacles = function (deltaTime, currentSpeed) {
        // Obstacles, move to Horizon layer.
        this.obstacles.forEach(function (obstacle) { return obstacle.update(deltaTime, currentSpeed); });
        this.obstacles = this.obstacles.filter(function (obstacle) { return !obstacle.remove; });
        if (this.obstacles.length > 0) {
            var lastObstacle = this.obstacles[this.obstacles.length - 1];
            if (lastObstacle.isNextObstacleNeeded(this.dimensions.WIDTH)) {
                this.addNewObstacle(currentSpeed);
                lastObstacle.followingObstacleCreated = true; // TODO: remove if flag if possible.
            }
        }
        else {
            // Create new obstacles.
            this.addNewObstacle(currentSpeed);
        }
    };
    Horizon.prototype.addNewObstacle = function (currentSpeed) {
        this.obstacles.push(obstacle_1["default"].randomCreate(this.canvasCtx, this.dimensions, this.gapCoefficient, currentSpeed));
    };
    /**
     * Reset the horizon layer.
     * Remove existing obstacles and reposition the horizon line.
     */
    Horizon.prototype.reset = function () {
        this.obstacles = [];
        this.horizonLine.reset();
    };
    /**
     * Add a new cloud to the horizon.
     */
    Horizon.prototype.addCloud = function () {
        this.clouds.push(new cloud_1["default"](this.canvas, this.cloudImg, this.dimensions.WIDTH));
    };
    /**
     * Horizon config.
     */
    Horizon.config = {
        BG_CLOUD_SPEED: 0.2,
        BUMPY_THRESHOLD: .3,
        CLOUD_FREQUENCY: .5,
        HORIZON_HEIGHT: 16,
        MAX_CLOUDS: 6
    };
    return Horizon;
}());
exports["default"] = Horizon;
