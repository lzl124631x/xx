import { IHashMap, FPS } from "./globals";
import Sprite from "./base/sprite";

const IMG_ID = "horizon-line";
const WIDTH = window.innerWidth;
const HEIGHT = 12;

/**
 * Horizon Line.
 * Consists of two connecting lines. Randomly assigns a flat / bumpy horizon.
 */
export default class HorizonLine extends Sprite {
    private canvasCtx: CanvasRenderingContext2D;
    private bumpThreshold: number = 0.5;
    constructor(private canvas: HTMLCanvasElement, dimensions: any) {
        super(IMG_ID, WIDTH, HEIGHT, 0, dimensions.HEIGHT - 20);// TODO: this 20 is dependent to outer settings.
        this.canvasCtx = canvas.getContext('2d');
    }

    /**
     * Return the crop x position of a type.
     */
    private getRandomType() {
        return Math.random() > this.bumpThreshold ? this.width : 0;
    }

    // TODO: make this impl. the same as the original.
    private updateXPos(increment: number) {
        this.x -= increment;
        if (this.x <= -this.width) {
            this.x = this.width;
        }
    }

    public update(deltaTime: number, speed: number) {
        var increment = Math.floor(speed * (FPS / 1000) * deltaTime);
        this.updateXPos(increment);
    }

    public render() {
        this.canvasCtx.drawImage(
            this.image,
            0,
            0,
            this.width,
            this.height,
            this.x,
            this.y,
            this.width,
            this.height);
        // If thix.x > 0, this segment is leftmost, with x = this.x - this.width.
        // Otherwise, this segment is rightmost, with x = this.x + this.width.
        this.canvasCtx.drawImage(
            this.image,
            WIDTH,
            0,
            this.width,
            this.height,
            this.x > 0 ? this.x - this.width : this.x + this.width,
            this.y,
            this.width,
            this.height);
    }

    /**
     * Reset horizon to the starting position.
     */
    public reset() {
        this.x = 0;
    }
}