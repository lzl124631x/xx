/// <reference path="./wx.d.ts"/>
import { IHashMap, FPS, IS_IOS, getTimeStamp, getRandomNum } from "./globals";
import Trex from "./tRex";
import Horizon from "./horizon";
import DistanceMeter from "./distanceMeter";
import GameOverPanel from "./gameOverPanel";
import { checkForCollision } from "./collision";
import SoundLoader, { SoundId } from "./soundLoader";

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

interface RunnerConfig {
  ACCELERATION: number,
  BG_CLOUD_SPEED: number,
  BOTTOM_PAD: number,
  CLEAR_TIME: number,
  CLOUD_FREQUENCY: number,
  GAMEOVER_CLEAR_TIME: number,
  GRAVITY: number,
  INITIAL_JUMP_VELOCITY: number,
  MAX_CLOUDS: number,
  MAX_OBSTACLE_LENGTH: number,
  MAX_SPEED: number,
  MIN_JUMP_HEIGHT: number,
  SPEED: number
  [index: string]: string | number;
}

// Used for conversion from pixel distance to a scaled unit.
const DIST_COEFFICIENT = 0.025;

wx.onShow(() => {
  SoundLoader.play(SoundId.BGM);
});

enum StatusEnum {
  WAITING,
  RUNNING,
  GAMEOVER
}

class Runner {
  /**
   * Runner event names.
   * @enum {string}
   */
  private static readonly events: any = {
    TOUCHEND: 'touchend',
    TOUCHSTART: 'touchstart',
  };

  private horizon: Horizon = null;

  private config: RunnerConfig = {
    ACCELERATION: 0.001, // Acceleration of T-Rex
    BG_CLOUD_SPEED: 0.2,
    BOTTOM_PAD: 50, // Bottom padding of canvas
    CLEAR_TIME: 3000,
    CLOUD_FREQUENCY: 0.5,
    GAMEOVER_CLEAR_TIME: 750,
    GRAVITY: 0.6,
    INITIAL_JUMP_VELOCITY: 12,
    MAX_CLOUDS: 6,
    MAX_OBSTACLE_LENGTH: 3,
    MAX_SPEED: 12,
    MIN_JUMP_HEIGHT: 35,
    SPEED: 6
  };
  private dimensions = { WIDTH: 0, HEIGHT: 0 };
  private canvas: HTMLCanvasElement = null;
  private canvasCtx: CanvasRenderingContext2D = null;
  private tRex: Trex = null;
  private distanceMeter: DistanceMeter = null;
  private distanceInPixel: number = 0;
  // The absolute time of now.
  private time: number = 0;
  // Time since this round of game was started.
  private runningTime: number = 0;
  private msPerFrame: number = 1000 / FPS;
  private currentSpeed: number = this.config.SPEED;
  private obstacles: string[] = [];
  private status: StatusEnum = StatusEnum.WAITING;
  private gameOverPanel: GameOverPanel = null;

  public start(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.canvasCtx = canvas.getContext('2d');
    this.init();
  }

  /**
   * Game initialiser.
   */
  private init() {
    this.dimensions.WIDTH = this.canvas.width;
    this.dimensions.HEIGHT = this.canvas.height - this.config.BOTTOM_PAD;
    this.horizon = new Horizon(this.canvas, this.dimensions);
    this.distanceMeter = new DistanceMeter(this.canvas, this.dimensions.WIDTH);
    this.tRex = new Trex(this.canvas, this.dimensions.HEIGHT);
    this.gameOverPanel = new GameOverPanel(this.canvas, this.dimensions);

    this.startListening();
    this.startLoop();
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
   * Update the game status to started.
   */
  private startGame() {
    this.runningTime = 0;
  }

  private clearCanvas() {
    this.canvasCtx.fillStyle = "#fff";
    this.canvasCtx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private update() {
    // TODO: add drawPending logic.
    var now = getTimeStamp();
    var deltaTime = now - (this.time || now);
    this.time = now;
    if (this.status == StatusEnum.RUNNING) {
      if (this.tRex.jumping) {
        this.tRex.updateJump(deltaTime);
      }
      this.runningTime += deltaTime;
      var hasObstacles = this.runningTime > this.config.CLEAR_TIME;

      this.horizon.update(deltaTime, this.currentSpeed, hasObstacles);

      // Check for collisions.
      var collision = hasObstacles &&
        checkForCollision(this.horizon.obstacles[0], this.tRex);
      if (!collision) {
        this.distanceInPixel += this.currentSpeed * deltaTime / this.msPerFrame;
        if (this.currentSpeed < this.config.MAX_SPEED) {
          this.currentSpeed += this.config.ACCELERATION;
        }
      } else {
        this.gameOver();
      }
      if (this.getDistance() >
        this.distanceMeter.maxScore) {
        this.distanceInPixel = 0;
      }
      this.distanceMeter.update(deltaTime, this.getDistance());
    }
    if (this.status != StatusEnum.GAMEOVER) {
      this.tRex.update(deltaTime);
    }
  }

  private getDistance() {
    return Math.ceil(this.distanceInPixel * DIST_COEFFICIENT);
  }

  private render() {
    this.clearCanvas();
    this.tRex.render();
    this.horizon.render();
    this.distanceMeter.render();
    if (this.status == StatusEnum.GAMEOVER) {
      this.gameOverPanel.render();
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
    if (this.status == StatusEnum.RUNNING) {
      if (!this.tRex.jumping) {
        SoundLoader.play(SoundId.JUMP);
        this.tRex.startJump();
      }
    } else {
      this.restart();
    }
  }

  private onTouchEnd(e: KeyboardEvent) {
    if (this.status == StatusEnum.RUNNING) {
      this.tRex.endJump();
    }
  }

  private loop() {
    this.update();
    this.render();

    if (this.status == StatusEnum.GAMEOVER) {
      return;
    }
    this.startLoop();
  }

  private gameOver() {
    SoundLoader.play(SoundId.CRASH);
    vibrate(200);
    this.status = StatusEnum.GAMEOVER;
    this.tRex.update(100, Trex.status.CRASHED);
    this.distanceMeter.updateHighScore(this.getDistance());
  }

  private restart() {
    this.runningTime = 0;
    this.currentSpeed = this.config.SPEED;
    this.status = StatusEnum.RUNNING;
    this.distanceInPixel = 0;
    this.time = getTimeStamp();
    this.distanceMeter.reset();
    this.horizon.reset();
    this.tRex.reset();
    this.startLoop();
  }

  private startLoop() {
    requestAnimationFrame(this.loop.bind(this));
  }
}

export default new Runner();