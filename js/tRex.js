"use strict";
exports.__esModule = true;
var collisionBox_1 = require("./collisionBox");
var globals_1 = require("./globals");
var Trex = /** @class */ (function () {
    function Trex(canvas, image, height) {
        this.canvas = canvas;
        this.image = image;
        this.xPos = 0;
        this.yPos = 0;
        // Position when on the ground.
        this.groundYPos = 0;
        this.currentFrame = 0;
        this.currentAnimFrames = [];
        this.blinkDelay = 0;
        this.animStartTime = 0;
        this.timer = 0;
        this.msPerFrame = 1000 / globals_1.FPS;
        this.config = Trex.config;
        // Current status.
        this.status = Trex.status.WAITING;
        this.jumping = false;
        this.jumpVelocity = 0;
        this.reachedMinHeight = false;
        this.speedDrop = false;
        this.jumpCount = 0;
        this.jumpspotX = 0;
        this.playingIntro = false;
        this.midair = false;
        this.init(height);
    }
    ;
    /**
     * T-rex player initaliser.
     * Sets the t-rex to blink at random intervals.
     */
    Trex.prototype.init = function (height) {
        this.canvasCtx = this.canvas.getContext('2d');
        this.setBlinkDelay();
        this.groundYPos = height - this.config.HEIGHT - 10; // 10 is an adjustment.
        this.yPos = this.groundYPos;
        this.minJumpHeight = this.groundYPos - this.config.MIN_JUMP_HEIGHT;
        this.draw(0, 0);
        this.update(0, Trex.status.WAITING);
    };
    /**
     * Setter for the jump velocity.
     * The approriate drop velocity is also set.
     */
    Trex.prototype.setJumpVelocity = function (setting) {
        this.config.INIITAL_JUMP_VELOCITY = -setting;
        this.config.DROP_VELOCITY = -setting / 2;
    };
    /**
     * Set the animation status.
     * @param {!number} deltaTime
     * @param {Trex.status} status Optional status to switch to.
     */
    Trex.prototype.update = function (deltaTime, opt_status) {
        this.timer += deltaTime;
        // Update the status.
        if (opt_status) {
            this.status = opt_status;
            this.currentFrame = 0;
            this.msPerFrame = Trex.animFrames[opt_status].msPerFrame;
            this.currentAnimFrames = Trex.animFrames[opt_status].frames;
            if (opt_status == Trex.status.WAITING) {
                this.animStartTime = globals_1.getTimeStamp();
                this.setBlinkDelay();
            }
        }
        // Game intro animation, T-rex moves in from the left.
        if (this.playingIntro && this.xPos < this.config.START_X_POS) {
            this.xPos += Math.round((this.config.START_X_POS / this.config.INTRO_DURATION) * deltaTime);
        }
        if (this.status == Trex.status.WAITING) {
            this.blink(globals_1.getTimeStamp());
        }
        else {
            this.draw(this.currentAnimFrames[this.currentFrame], 0);
        }
        // Update the frame position.
        if (this.timer >= this.msPerFrame) {
            this.currentFrame = this.currentFrame ==
                this.currentAnimFrames.length - 1 ? 0 : this.currentFrame + 1;
            this.timer = 0;
        }
    };
    /**
     * Draw the t-rex to a particular position.
     * @param {number} x
     * @param {number} y
     */
    Trex.prototype.draw = function (x, y) {
        var sourceX = x;
        var sourceY = y;
        var sourceWidth = this.config.WIDTH;
        var sourceHeight = this.config.HEIGHT;
        if (globals_1.IS_HIDPI) {
            sourceX *= 2;
            sourceY *= 2;
            sourceWidth *= 2;
            sourceHeight *= 2;
        }
        this.canvasCtx.drawImage(this.image, sourceX, sourceY, sourceWidth, sourceHeight, this.xPos, this.yPos, this.config.WIDTH, this.config.HEIGHT);
    };
    /**
     * Sets a random time for the blink to happen.
     */
    Trex.prototype.setBlinkDelay = function () {
        this.blinkDelay = Math.ceil(Math.random() * Trex.BLINK_TIMING);
    };
    /**
     * Make t-rex blink at random intervals.
     * @param {number} time Current time in milliseconds.
     */
    Trex.prototype.blink = function (time) {
        var deltaTime = time - this.animStartTime;
        if (deltaTime >= this.blinkDelay) {
            this.draw(this.currentAnimFrames[this.currentFrame], 0);
            if (this.currentFrame == 1) {
                // Set new random delay to blink.
                this.setBlinkDelay();
                this.animStartTime = time;
            }
        }
    };
    /**
     * Initialise a jump.
     */
    Trex.prototype.startJump = function () {
        if (!this.jumping) {
            this.update(0, Trex.status.JUMPING);
            this.jumpVelocity = this.config.INIITAL_JUMP_VELOCITY;
            this.jumping = true;
            this.reachedMinHeight = false;
            this.speedDrop = false;
        }
    };
    /**
     * Jump is complete, falling down.
     */
    Trex.prototype.endJump = function () {
        if (this.reachedMinHeight &&
            this.jumpVelocity < this.config.DROP_VELOCITY) {
            this.jumpVelocity = this.config.DROP_VELOCITY;
        }
    };
    /**
     * Update frame for a jump.
     * @param {number} deltaTime
     */
    Trex.prototype.updateJump = function (deltaTime) {
        var msPerFrame = Trex.animFrames[this.status].msPerFrame;
        var framesElapsed = deltaTime / msPerFrame;
        // Speed drop makes Trex fall faster.
        if (this.speedDrop) {
            this.yPos += Math.round(this.jumpVelocity *
                this.config.SPEED_DROP_COEFFICIENT * framesElapsed);
        }
        else {
            this.yPos += Math.round(this.jumpVelocity * framesElapsed);
        }
        this.jumpVelocity += this.config.GRAVITY * framesElapsed;
        // Minimum height has been reached.
        if (this.yPos < this.minJumpHeight || this.speedDrop) {
            this.reachedMinHeight = true;
        }
        // Reached max height
        if (this.yPos < this.config.MAX_JUMP_HEIGHT || this.speedDrop) {
            this.endJump();
        }
        // Back down at ground level. Jump completed.
        if (this.yPos > this.groundYPos) {
            this.reset();
            this.jumpCount++;
        }
        this.update(deltaTime);
    };
    /**
     * Set the speed drop. Immediately cancels the current jump.
     */
    Trex.prototype.setSpeedDrop = function () {
        this.speedDrop = true;
        this.jumpVelocity = 1;
    };
    /**
     * Reset the t-rex to running at start of game.
     */
    Trex.prototype.reset = function () {
        this.yPos = this.groundYPos;
        this.jumpVelocity = 0;
        this.jumping = false;
        this.update(0, Trex.status.RUNNING);
        this.midair = false;
        this.speedDrop = false;
        this.jumpCount = 0;
    };
    Trex.prototype.getCollisionBox = function () {
        // Adjustments are made to the bounding box as there is a 1 pixel white border around
        return new collisionBox_1["default"](this.xPos + 1, this.yPos + 1, this.config.WIDTH - 2, this.config.HEIGHT - 2);
    };
    /**
     * T-rex player config.
     */
    Trex.config = {
        DROP_VELOCITY: -5,
        GRAVITY: 0.6,
        HEIGHT: 47,
        INIITAL_JUMP_VELOCITY: -10,
        INTRO_DURATION: 1500,
        MAX_JUMP_HEIGHT: 30,
        MIN_JUMP_HEIGHT: 30,
        SPEED_DROP_COEFFICIENT: 3,
        SPRITE_WIDTH: 262,
        START_X_POS: 50,
        WIDTH: 44
    };
    /**
     * Used in collision detection.
     * @type {Array.<CollisionBox>}
     */
    Trex.collisionBoxes = [
        new collisionBox_1["default"](1, -1, 30, 26),
        new collisionBox_1["default"](32, 0, 8, 16),
        new collisionBox_1["default"](10, 35, 14, 8),
        new collisionBox_1["default"](1, 24, 29, 5),
        new collisionBox_1["default"](5, 30, 21, 4),
        new collisionBox_1["default"](9, 34, 15, 4)
    ];
    /**
     * Animation states.
     */
    Trex.status = {
        CRASHED: 'CRASHED',
        JUMPING: 'JUMPING',
        RUNNING: 'RUNNING',
        WAITING: 'WAITING'
    };
    /**
     * Blinking coefficient.
     */
    Trex.BLINK_TIMING = 7000;
    /**
     * Animation config for different states.
     */
    Trex.animFrames = {
        WAITING: {
            frames: [44, 0],
            msPerFrame: 1000 / 3
        },
        RUNNING: {
            frames: [88, 132],
            msPerFrame: 1000 / 12
        },
        CRASHED: {
            frames: [220],
            msPerFrame: 1000 / 60
        },
        JUMPING: {
            frames: [0],
            msPerFrame: 1000 / 60
        }
    };
    return Trex;
}());
exports["default"] = Trex;
