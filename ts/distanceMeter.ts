import { IHashMap } from "./globals";
import ImageLoader from "./imageLoader";
import SoundLoader, { SoundId } from "./soundLoader";

const config: IHashMap<number> = {
    // Number of digits.
    MAX_DISTANCE_UNITS: 5,
    // Distance that causes achievement animation.
    ACHIEVEMENT_DISTANCE: 100,
    // Flash duration in milliseconds.
    FLASH_DURATION: 1000 / 4,
    // Flash iterations for achievement animation.
    FLASH_ITERATIONS: 3
};

/**
* Handles displaying the distance meter.
*/
export default class DistanceMeter {
    private static readonly dimensions: IHashMap<number> = {
        WIDTH: 10,
        HEIGHT: 13,
        DEST_WIDTH: 11
    };
    /**
     * Y positioning of the digits in the sprite sheet.
     * X position is always 0.
     */
    private static readonly yPos = [0, 13, 27, 40, 53, 67, 80, 93, 107, 120];

    private canvasCtx: CanvasRenderingContext2D;
    private x: number = 0;
    private y: number = 5;
    private currentDistance: number = 0;
    // Maximum displayable score
    public maxScore: number = 0;
    private highScore: number = 0;
    private highScoreChars: string[] = [];
    private container: number = null;
    private digits: string[] = [];
    public achievement: boolean = false;
    private defaultString: string = '';
    private flashTimer: number = 0;
    private flashIterations: number = 0;
    private flashing: boolean = false;

    private static _constructor = (() => {
        ImageLoader.get("text");
    })();

    constructor(private canvas: HTMLCanvasElement, canvasWidth: number) {
        this.canvasCtx = canvas.getContext('2d');
        this.init(canvasWidth);
    }
    /**
      * Initialise the distance meter to '00000'.
      * @param {number} width Canvas width in px.
      */
    private init(width: number) {
        var maxDistanceStr = '';
        this.calcXPos(width);
        for (var i = 0; i < config.MAX_DISTANCE_UNITS; i++) {
            this.draw(i, 0);
            this.defaultString += '0';
            maxDistanceStr += '9';
        }
        this.maxScore = parseInt(maxDistanceStr);
    }
    /**
     * Calculate the xPos in the canvas.
     * @param {number} canvasWidth
     */
    private calcXPos(canvasWidth: number) {
        this.x = canvasWidth - (DistanceMeter.dimensions.DEST_WIDTH *
            (config.MAX_DISTANCE_UNITS + 1));
    }
    /**
     * Draw a digit to canvas.
     * @param {number} digitPos Position of the digit.
     * @param {number} value Digit value 0-9.
     * @param {boolean?} opt_highScore Whether drawing the high score.
     */
    private draw(digitPos: number, value: number, opt_highScore?: boolean) {
        var sourceWidth = DistanceMeter.dimensions.WIDTH;
        var sourceHeight = DistanceMeter.dimensions.HEIGHT;
        var sourceX = DistanceMeter.dimensions.WIDTH * value;
        var targetX = digitPos * DistanceMeter.dimensions.DEST_WIDTH;
        var targetY = this.y;
        var targetWidth = DistanceMeter.dimensions.WIDTH;
        var targetHeight = DistanceMeter.dimensions.HEIGHT;
        this.canvasCtx.save();
        if (opt_highScore) {
            // Left of the current score.
            var highScoreX = this.x - (config.MAX_DISTANCE_UNITS * 2) *
                DistanceMeter.dimensions.WIDTH;
            this.canvasCtx.translate(highScoreX, this.y);
        } else {
            this.canvasCtx.translate(this.x, this.y);
        }
        this.canvasCtx.drawImage(
            ImageLoader.get("text"),
            sourceX,
            0,
            sourceWidth,
            sourceHeight,
            targetX,
            targetY,
            targetWidth,
            targetHeight
        );
        this.canvasCtx.restore();
    }

    /**
     * Update the distance meter.
     * @param {number} deltaTime
     * @param {number} distance
     */
    public update(deltaTime: number, distance?: number) {
        this.flashing = false;
        if (!this.achievement) {
            if (distance > 0) {
                // Achievement unlocked
                if (distance % config.ACHIEVEMENT_DISTANCE == 0) {
                    // Flash score and play sound.
                    this.achievement = true;
                    this.flashTimer = 0;
                    SoundLoader.play(SoundId.SCORE_REACHED);
                }
                // Create a string representation of the distance with leading 0.
                var distanceStr = (this.defaultString +
                    distance).substr(-config.MAX_DISTANCE_UNITS);
                this.digits = distanceStr.split('');
            } else {
                this.digits = this.defaultString.split('');
            }
        } else {
            // Control flashing of the score on reaching achievement.
            if (this.flashIterations <= config.FLASH_ITERATIONS) {
                this.flashTimer += deltaTime;
                if (this.flashTimer < config.FLASH_DURATION) {
                    this.flashing = true;
                } else if (this.flashTimer >
                    config.FLASH_DURATION * 2) {
                    this.flashTimer = 0;
                    this.flashIterations++;
                }
            } else {
                this.achievement = false;
                this.flashIterations = 0;
                this.flashTimer = 0;
            }
        }
    }

    public render() {
        if (!this.flashing) {
            for (var i = this.digits.length - 1; i >= 0; i--) {
                this.draw(i, parseInt(this.digits[i]));
            }
        }
        this.drawHighScore();
    }
    /**
     * Draw the high score.
     */
    private drawHighScore() {
        this.canvasCtx.save();
        this.canvasCtx.globalAlpha = .8;
        for (var i = this.highScoreChars.length - 1; i >= 0; i--) {
            this.draw(i, parseInt(this.highScoreChars[i], 10), true);
        }
        this.canvasCtx.restore();
    }
    /**
     * Set the highscore as a array string.
     * Position of char in the sprite: H - 10, I - 11.
     * @param {number} distance Distance ran in pixels.
     */
    public updateHighScore(distance: number) {
        if (distance <= this.highScore) return;
        this.highScore = distance;
        var highScoreStr = (this.defaultString + distance).substr(-config.MAX_DISTANCE_UNITS);
        this.highScoreChars = ['10', '11', ''].concat(highScoreStr.split(''));
    }
    /**
     * Reset the distance meter back to '00000'.
     */
    public reset() {
        this.update(0);
        this.achievement = false;
    }
}