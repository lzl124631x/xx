import { getRandomNum, IS_HIDPI } from "./globals";
import Sprite from "./base/sprite";

const IMG_SRC = 'asset/image/cloud.png'
const WIDTH   = 46
const HEIGHT  = 14
const MAX_SKY_LEVEL = 30;
const MIN_SKY_LEVEL = 71;
const MAX_CLOUD_GAP = 400;
const MIN_CLOUD_GAP = 100;
/**
* Cloud background item.
* Similar to an obstacle object but without collision boxes.
*/
export default class Cloud extends Sprite {
    private canvasCtx: CanvasRenderingContext2D
    public remove: boolean = false;
    public cloudGap = getRandomNum(MIN_CLOUD_GAP, MAX_CLOUD_GAP);
    constructor(private canvas: HTMLCanvasElement, private image: HTMLImageElement, private containerWidth: number) {
        super(IMG_SRC, WIDTH, HEIGHT);
        this.canvasCtx = this.canvas.getContext('2d');
        this.x = containerWidth;
        this.y = getRandomNum(MAX_SKY_LEVEL, MIN_SKY_LEVEL);
    }

    public update(speed: number) {
        if (!this.remove) {
            this.x -= Math.ceil(speed);
            this.drawToCanvas(this.canvasCtx);
            // Mark as removeable if no longer in the canvas.
            if (!this.isVisible()) {
                this.remove = true;
            }
        }
    }

    private isVisible(): boolean {
        return this.x + WIDTH > 0;
    }

    public needNextCloud(containerWidth: number): boolean {
        return containerWidth - this.x > this.cloudGap;
    }
}