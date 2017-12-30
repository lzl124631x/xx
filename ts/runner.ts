/// <reference path="./wx.d.ts"/>
import { IHashMap, IS_HIDPI, FPS, IS_IOS, getTimeStamp, getRandomNum } from "./globals";
import Trex from "./tRex";
import Horizon from "./horizon";
import DistanceMeter from "./distanceMeter";
import GameOverPanel from "./gameOverPanel";
import { checkForCollision } from "./collision";
import Resources from "./resources";

const DEFAULT_WIDTH = 600;
/**
 * Vibrate on mobile devices.
 * @param {number} duration Duration of the vibration in milliseconds.
 */
function vibrate(duration: number) {
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
function decodeBase64ToArrayBuffer(base64String: string) {
  var len = (base64String.length / 4) * 3;
  var str = atob(base64String);
  var arrayBuffer = new ArrayBuffer(len);
  var bytes = new Uint8Array(arrayBuffer);
  for (var i = 0; i < len; i++) {
    bytes[i] = str.charCodeAt(i);
  }
  return bytes.buffer;
}

interface RunnerConfig {
  ACCELERATION: number,
  BG_CLOUD_SPEED: number,
  BOTTOM_PAD: number,
  CLEAR_TIME: number,
  CLOUD_FREQUENCY: number,
  GAMEOVER_CLEAR_TIME: number,
  GAP_COEFFICIENT: number,
  GRAVITY: number,
  INITIAL_JUMP_VELOCITY: number,
  MAX_CLOUDS: number,
  MAX_OBSTACLE_LENGTH: number,
  MAX_SPEED: number,
  MIN_JUMP_HEIGHT: number,
  MOBILE_SPEED_COEFFICIENT: number,
  RESOURCE_TEMPLATE_ID: string,
  SPEED: number
  [index: string]: string | number;
}

export default class Runner {
  public static readonly config: RunnerConfig = {
    ACCELERATION: 0.001, // Acceleration of T-Rex
    BG_CLOUD_SPEED: 0.2,
    BOTTOM_PAD: 50, // Bottom padding of canvas
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
  private static readonly imageSources = {
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
  private static readonly sounds: any = {
    BUTTON_PRESS: 'offline-sound-press',
    HIT: 'offline-sound-hit',
    SCORE: 'offline-sound-reached'
  };
  /**
   * Key code mapping.
   * @enum {object}
   */
  private static readonly keycodes: any = {
    JUMP: { '38': 1, '32': 1 }, // Up, spacebar
    DUCK: { '40': 1 }, // Down
    RESTART: { '13': 1 } // Enter
  };
  /**
   * Runner event names.
   * @enum {string}
   */
  private static readonly events: any = {
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

  private horizon: Horizon = null;

  private config = Runner.config;
  private dimensions = { WIDTH: 0, HEIGHT: 0 };
  private canvas: HTMLCanvasElement = null;
  private canvasCtx: CanvasRenderingContext2D = null;
  private tRex: Trex = null;
  private distanceMeter: DistanceMeter = null;
  private distanceRan: number = 0;
  private highestScore: number = 0;
  private time: number = 0;
  private runningTime: number = 0;
  private msPerFrame: number = 1000 / FPS;
  private currentSpeed: number = Runner.config.SPEED;
  private obstacles: string[] = [];
  private started: boolean = false;
  private activated: boolean = false;
  private crashed: boolean = false;
  private paused: boolean = false;
  private resizeTimerId_: number = null;
  private playCount: number = 0;
  private gameOverPanel: GameOverPanel = null;
  private playingIntro: boolean = false;
  private drawPending: boolean = false;
  private raqId: number = 0;
  // Sound FX.
  private audioBuffer: AudioBuffer = null;
  private soundFx: IHashMap<AudioBuffer> = {};
  // Global web audio context for playing sounds.
  private audioContext: AudioContext = null;
  // Images.
  private images: IHashMap<HTMLImageElement> = {};
  private imagesLoaded: number = 0;

  public start(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.canvasCtx = canvas.getContext('2d');
    this.loadImages();
    this.init();
  }
  /**
   * Load and cache the image assets from the page.
   */
  private loadImages() {
    var imageSources = IS_HIDPI ? Runner.imageSources.HDPI : Runner.imageSources.LDPI;
    imageSources.forEach((img: any) => {
       let image     = new Image()
        image.src = Resources[img.id]
      this.images[img.name] = image as HTMLImageElement
    });
  }

  /**
   * Game initialiser.
   */
  private init() {
    this.dimensions.WIDTH = this.canvas.width;
    this.dimensions.HEIGHT = this.canvas.height - Runner.config.BOTTOM_PAD;
    // Horizon contains clouds, obstacles and the ground.
    this.horizon = new Horizon(this.canvas, this.images, this.dimensions, this.config.GAP_COEFFICIENT);
    // Distance meter
    this.distanceMeter = new DistanceMeter(this.canvas,
      this.images.TEXT_SPRITE, this.dimensions.WIDTH);
    // Draw t-rex
    this.tRex = new Trex(this.canvas, this.images.TREX, this.dimensions.HEIGHT);

    this.startListening();
    this.raq();
  }

  /**
   * Setting individual settings for debugging.
   * @param {string} setting
   * @param {*} value
   */
  private updateConfigSetting(setting: string, value: any) {
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
  }
  /**
   * Play the game intro.
   * Canvas container width expands out to the full width.
   */
  private playIntro() {
    if (!this.started && !this.crashed) {
      this.playingIntro = true;
      this.tRex.playingIntro = true;
      this.activated = true;
      this.started = true;
      setTimeout(this.startGame.bind(this), 1000);
    } else if (this.crashed) {
      this.restart();
    }
  }
  /**
   * Update the game status to started.
   */
  private startGame() {
    this.runningTime = 0;
    this.playingIntro = false;
    this.tRex.playingIntro = false;
    this.playCount++;
  }

  private clearCanvas() {
    this.canvasCtx.fillStyle = "#fff";
    this.canvasCtx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
  /**
   * Update the game frame.
   */
  private update() {
    this.drawPending = false;
    var now = getTimeStamp();
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
      } else {
        deltaTime = !this.started ? 0 : deltaTime;
        this.horizon.update(deltaTime, this.currentSpeed, hasObstacles);
      }
      // Check for collisions.
      var collision = hasObstacles &&
        checkForCollision(this.horizon.obstacles[0], this.tRex);
      if (!collision) {
        this.distanceRan += this.currentSpeed * deltaTime / this.msPerFrame;
        if (this.currentSpeed < this.config.MAX_SPEED) {
          this.currentSpeed += this.config.ACCELERATION;
        }
      } else {
        this.gameOver();
      }
      if (this.distanceMeter.getActualDistance(this.distanceRan) >
        this.distanceMeter.maxScore) {
        this.distanceRan = 0;
      }
      var playAcheivementSound = this.distanceMeter.update(deltaTime,
        Math.ceil(this.distanceRan));
      // if (playAcheivementSound) {
      //   this.playSound(this.soundFx.SCORE);
      // }
    }
    if (!this.crashed) {
      this.tRex.update(deltaTime);
      this.raq();
    }
  }

  private startListening() {
    this.canvas.addEventListener(Runner.events.TOUCHSTART, this.onTouchStart.bind(this));
    this.canvas.addEventListener(Runner.events.TOUCHEND, this.onTouchEnd.bind(this));
  }

  private stopListening() {
    this.canvas.removeEventListener(Runner.events.TOUCHSTART, this.onTouchStart);
    this.canvas.removeEventListener(Runner.events.TOUCHEND, this.onTouchEnd);
  }

  private onTouchStart(e: KeyboardEvent) {
    if (this.crashed) {
      this.restart();
    } else {
      if (!this.activated) {
        this.activated = true;
      }
      if (!this.tRex.jumping) {
        this.tRex.startJump();
      }
    }
  }

  private onTouchEnd(e: KeyboardEvent) {
    if (this.isRunning()) {
      this.tRex.endJump();
    } else if (this.crashed) {
      // Check that enough time has elapsed before allowing jump key to restart.
      var deltaTime = getTimeStamp() - this.time;
      if (deltaTime >= this.config.GAMEOVER_CLEAR_TIME) {
        this.restart();
      }
    } else if (this.paused) {
      this.play();
    }
  }

  /**
   * RequestAnimationFrame wrapper.
   */
  private raq() {
    if (!this.drawPending) {
      this.drawPending = true;
      this.raqId = requestAnimationFrame(this.update.bind(this));
    }
  }

  private isRunning() {
    return !!this.raqId;
  }

  private gameOver() {
    vibrate(200);
    this.stop();
    this.crashed = true;
    this.distanceMeter.acheivement = false;
    this.tRex.update(100, Trex.status.CRASHED);
    // Game over panel.
    if (!this.gameOverPanel) {
      this.gameOverPanel = new GameOverPanel(this.canvas,
        this.images.TEXT_SPRITE, this.images.RESTART,
        this.dimensions);
    } else {
      this.gameOverPanel.draw();
    }
    // Update the high score.
    if (this.distanceRan > this.highestScore) {
      this.highestScore = Math.ceil(this.distanceRan);
      this.distanceMeter.setHighScore(this.highestScore);
    }
    // Reset the time clock.
    this.time = getTimeStamp();
  }

  private stop() {
    this.activated = false;
    this.paused = true;
    cancelAnimationFrame(this.raqId);
    this.raqId = 0;
  }

  private play() {
    if (!this.crashed) {
      this.activated = true;
      this.paused = false;
      this.tRex.update(0, Trex.status.RUNNING);
      this.time = getTimeStamp();
      this.update();
    }
  }

  private restart() {
    if (!this.raqId) {
      this.playCount++;
      this.runningTime = 0;
      this.activated = true;
      this.crashed = false;
      this.distanceRan = 0;
      this.time = getTimeStamp();
      this.clearCanvas();
      this.distanceMeter.reset(); // TODO: original code is (this.highestScore)
      this.horizon.reset();
      this.tRex.reset();
      this.update();
    }
  }
}