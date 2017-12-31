"use strict";
exports.__esModule = true;
/// <reference path="./wx.d.ts"/>
var globals_1 = require("./globals");
var tRex_1 = require("./tRex");
var horizon_1 = require("./horizon");
var distanceMeter_1 = require("./distanceMeter");
var gameOverPanel_1 = require("./gameOverPanel");
var collision_1 = require("./collision");
var resources_1 = require("./resources");
var sound_1 = require("./sound");
var DEFAULT_WIDTH = 600;
/**
 * Vibrate on mobile devices.
 * @param {number} duration Duration of the vibration in milliseconds.
 */
function vibrate(duration) {
    if (window.navigator.vibrate) {
        window.navigator.vibrate(duration);
    }
    if (wx && wx.vibrateLong) {
        wx.vibrateLong();
    }
}
/**
 * Decodes the base 64 audio to ArrayBuffer used by Web Audio.
 */
function decodeBase64ToArrayBuffer(base64String) {
    var len = (base64String.length / 4) * 3;
    var str = atob(base64String);
    var arrayBuffer = new ArrayBuffer(len);
    var bytes = new Uint8Array(arrayBuffer);
    for (var i = 0; i < len; i++) {
        bytes[i] = str.charCodeAt(i);
    }
    return bytes.buffer;
}
var Runner = /** @class */ (function () {
    function Runner() {
        this.horizon = null;
        this.config = Runner.config;
        this.dimensions = { WIDTH: 0, HEIGHT: 0 };
        this.canvas = null;
        this.canvasCtx = null;
        this.tRex = null;
        this.distanceMeter = null;
        this.distanceRan = 0;
        this.highestScore = 0;
        this.time = 0;
        this.runningTime = 0;
        this.msPerFrame = 1000 / globals_1.FPS;
        this.currentSpeed = Runner.config.SPEED;
        this.obstacles = [];
        this.started = false;
        this.activated = false;
        this.crashed = false;
        this.paused = false;
        this.resizeTimerId_ = null;
        this.playCount = 0;
        this.gameOverPanel = null;
        this.playingIntro = false;
        this.drawPending = false;
        this.raqId = 0;
        // Sound
        this.sound = new sound_1["default"]();
        // Images.
        this.images = {};
        this.imagesLoaded = 0;
    }
    Runner.prototype.start = function (canvas) {
        this.canvas = canvas;
        this.canvasCtx = canvas.getContext('2d');
        this.loadImages();
        this.init();
    };
    /**
     * Load and cache the image assets from the page.
     */
    Runner.prototype.loadImages = function () {
        var _this = this;
        var imageSources = globals_1.IS_HIDPI ? Runner.imageSources.HDPI : Runner.imageSources.LDPI;
        imageSources.forEach(function (img) {
            var image = new Image();
            image.src = resources_1["default"][img.id];
            _this.images[img.name] = image;
        });
    };
    /**
     * Game initialiser.
     */
    Runner.prototype.init = function () {
        this.dimensions.WIDTH = this.canvas.width;
        this.dimensions.HEIGHT = this.canvas.height - Runner.config.BOTTOM_PAD;
        // Horizon contains clouds, obstacles and the ground.
        this.horizon = new horizon_1["default"](this.canvas, this.images, this.dimensions, this.config.GAP_COEFFICIENT);
        // Distance meter
        this.distanceMeter = new distanceMeter_1["default"](this.canvas, this.images.TEXT_SPRITE, this.dimensions.WIDTH);
        // Draw t-rex
        this.tRex = new tRex_1["default"](this.canvas, this.images.TREX, this.dimensions.HEIGHT);
        this.startListening();
        this.raq();
    };
    /**
     * Setting individual settings for debugging.
     * @param {string} setting
     * @param {*} value
     */
    Runner.prototype.updateConfigSetting = function (setting, value) {
        if (setting in this.config && value != undefined) {
            this.config[setting] = value;
            switch (setting) {
                case 'GRAVITY':
                case 'MIN_JUMP_HEIGHT':
                    this.tRex.config[setting] = value;
                    break;
                case 'INITIAL_JUMP_VELOCITY':
                    this.tRex.setJumpVelocity(value);
                    break;
                case 'SPEED':
                    this.currentSpeed = value;
                    break;
            }
        }
    };
    /**
     * Play the game intro.
     * Canvas container width expands out to the full width.
     */
    Runner.prototype.playIntro = function () {
        if (!this.started && !this.crashed) {
            this.playingIntro = true;
            this.tRex.playingIntro = true;
            this.activated = true;
            this.started = true;
            setTimeout(this.startGame.bind(this), 1000);
        }
        else if (this.crashed) {
            this.restart();
        }
    };
    /**
     * Update the game status to started.
     */
    Runner.prototype.startGame = function () {
        this.runningTime = 0;
        this.playingIntro = false;
        this.tRex.playingIntro = false;
        this.playCount++;
    };
    Runner.prototype.clearCanvas = function () {
        this.canvasCtx.fillStyle = "#fff";
        this.canvasCtx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    };
    /**
     * Update the game frame.
     */
    Runner.prototype.update = function () {
        this.drawPending = false;
        var now = globals_1.getTimeStamp();
        var deltaTime = now - (this.time || now);
        this.time = now;
        if (this.activated) {
            this.clearCanvas();
            if (this.tRex.jumping) {
                this.tRex.updateJump(deltaTime);
            }
            this.runningTime += deltaTime;
            var hasObstacles = this.runningTime > this.config.CLEAR_TIME;
            // First jump triggers the intro.
            if (this.tRex.jumpCount == 1 && !this.playingIntro) {
                this.playIntro();
            }
            // The horizon doesn't move until the intro is over.
            if (this.playingIntro) {
                this.horizon.update(0, this.currentSpeed, hasObstacles);
            }
            else {
                deltaTime = !this.started ? 0 : deltaTime;
                this.horizon.update(deltaTime, this.currentSpeed, hasObstacles);
            }
            // Check for collisions.
            var collision = hasObstacles &&
                collision_1.checkForCollision(this.horizon.obstacles[0], this.tRex);
            if (!collision) {
                this.distanceRan += this.currentSpeed * deltaTime / this.msPerFrame;
                if (this.currentSpeed < this.config.MAX_SPEED) {
                    this.currentSpeed += this.config.ACCELERATION;
                }
            }
            else {
                this.gameOver();
            }
            if (this.distanceMeter.getActualDistance(this.distanceRan) >
                this.distanceMeter.maxScore) {
                this.distanceRan = 0;
            }
            var playAcheivementSound = this.distanceMeter.update(deltaTime, Math.ceil(this.distanceRan));
            if (playAcheivementSound) {
                this.sound.play(sound_1.SoundId.SCORE_REACHED);
            }
        }
        if (!this.crashed) {
            this.tRex.update(deltaTime);
            this.raq();
        }
    };
    Runner.prototype.startListening = function () {
        this.canvas.addEventListener(Runner.events.TOUCHSTART, this.onTouchStart.bind(this));
        this.canvas.addEventListener(Runner.events.TOUCHEND, this.onTouchEnd.bind(this));
    };
    Runner.prototype.stopListening = function () {
        this.canvas.removeEventListener(Runner.events.TOUCHSTART, this.onTouchStart);
        this.canvas.removeEventListener(Runner.events.TOUCHEND, this.onTouchEnd);
    };
    Runner.prototype.onTouchStart = function (e) {
        if (this.crashed) {
            this.restart();
        }
        else {
            if (!this.activated) {
                this.activated = true;
            }
            if (!this.tRex.jumping) {
                this.sound.play(sound_1.SoundId.JUMP);
                this.tRex.startJump();
            }
        }
    };
    Runner.prototype.onTouchEnd = function (e) {
        if (this.isRunning()) {
            this.tRex.endJump();
        }
        else if (this.crashed) {
            // Check that enough time has elapsed before allowing jump key to restart.
            var deltaTime = globals_1.getTimeStamp() - this.time;
            if (deltaTime >= this.config.GAMEOVER_CLEAR_TIME) {
                this.restart();
            }
        }
        else if (this.paused) {
            this.play();
        }
    };
    /**
     * RequestAnimationFrame wrapper.
     */
    Runner.prototype.raq = function () {
        if (!this.drawPending) {
            this.drawPending = true;
            this.raqId = requestAnimationFrame(this.update.bind(this));
        }
    };
    Runner.prototype.isRunning = function () {
        return !!this.raqId;
    };
    Runner.prototype.gameOver = function () {
        this.sound.play(sound_1.SoundId.CRASH);
        vibrate(200);
        this.stop();
        this.crashed = true;
        this.distanceMeter.acheivement = false;
        this.tRex.update(100, tRex_1["default"].status.CRASHED);
        // Game over panel.
        if (!this.gameOverPanel) {
            this.gameOverPanel = new gameOverPanel_1["default"](this.canvas, this.images.TEXT_SPRITE, this.images.RESTART, this.dimensions);
        }
        else {
            this.gameOverPanel.draw();
        }
        // Update the high score.
        if (this.distanceRan > this.highestScore) {
            this.highestScore = Math.ceil(this.distanceRan);
            this.distanceMeter.setHighScore(this.highestScore);
        }
        // Reset the time clock.
        this.time = globals_1.getTimeStamp();
    };
    Runner.prototype.stop = function () {
        this.activated = false;
        this.paused = true;
        cancelAnimationFrame(this.raqId);
        this.raqId = 0;
    };
    Runner.prototype.play = function () {
        if (!this.crashed) {
            this.activated = true;
            this.paused = false;
            this.tRex.update(0, tRex_1["default"].status.RUNNING);
            this.time = globals_1.getTimeStamp();
            this.update();
        }
    };
    Runner.prototype.restart = function () {
        if (!this.raqId) {
            this.playCount++;
            this.runningTime = 0;
            this.activated = true;
            this.crashed = false;
            this.distanceRan = 0;
            this.time = globals_1.getTimeStamp();
            this.clearCanvas();
            this.distanceMeter.reset(); // TODO: original code is (this.highestScore)
            this.horizon.reset();
            this.tRex.reset();
            this.update();
        }
    };
    Runner.config = {
        ACCELERATION: 0.001,
        BG_CLOUD_SPEED: 0.2,
        BOTTOM_PAD: 50,
        CLEAR_TIME: 3000,
        CLOUD_FREQUENCY: 0.5,
        GAMEOVER_CLEAR_TIME: 750,
        GAP_COEFFICIENT: 0.6,
        GRAVITY: 0.6,
        INITIAL_JUMP_VELOCITY: 12,
        MAX_CLOUDS: 6,
        MAX_OBSTACLE_LENGTH: 3,
        MAX_SPEED: 12,
        MIN_JUMP_HEIGHT: 35,
        MOBILE_SPEED_COEFFICIENT: 1.2,
        RESOURCE_TEMPLATE_ID: 'audio-resources',
        SPEED: 6
    };
    /**
     * Image source urls.
     * @enum {array.<object>}
     */
    Runner.imageSources = {
        LDPI: [
            { name: 'CLOUD', id: '1x-cloud' },
            { name: 'HORIZON', id: '1x-horizon' },
            { name: 'RESTART', id: '1x-restart' },
            { name: 'TEXT_SPRITE', id: '1x-text' },
            { name: 'TREX', id: '1x-trex' }
        ],
        HDPI: [
            { name: 'CLOUD', id: '2x-cloud' },
            { name: 'HORIZON', id: '2x-horizon' },
            { name: 'RESTART', id: '2x-restart' },
            { name: 'TEXT_SPRITE', id: '2x-text' },
            { name: 'TREX', id: '2x-trex' }
        ]
    };
    /**
     * Sound FX. Reference to the ID of the audio tag on interstitial page.
     * @enum {string}
     */
    Runner.sounds = {
        BUTTON_PRESS: 'offline-sound-press',
        HIT: 'offline-sound-hit',
        SCORE: 'offline-sound-reached'
    };
    /**
     * Key code mapping.
     * @enum {object}
     */
    Runner.keycodes = {
        JUMP: { '38': 1, '32': 1 },
        DUCK: { '40': 1 },
        RESTART: { '13': 1 } // Enter
    };
    /**
     * Runner event names.
     * @enum {string}
     */
    Runner.events = {
        ANIM_END: 'webkitAnimationEnd',
        CLICK: 'click',
        KEYDOWN: 'keydown',
        KEYUP: 'keyup',
        MOUSEDOWN: 'mousedown',
        MOUSEUP: 'mouseup',
        RESIZE: 'resize',
        TOUCHEND: 'touchend',
        TOUCHSTART: 'touchstart',
        VISIBILITY: 'visibilitychange',
        BLUR: 'blur',
        FOCUS: 'focus',
        LOAD: 'load'
    };
    return Runner;
}());
exports["default"] = Runner;
