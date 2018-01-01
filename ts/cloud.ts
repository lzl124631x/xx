import { getRandomNum } from "./globals";
import Sprite from "./base/sprite";

const IMG_ID = "cloud";
const WIDTH = 46;
const HEIGHT = 14;
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
    public cloudGap = getRandomNum(MIN_CLOUD_GAP, MAX_CLOUD_GAP);
    constructor(private canvas: HTMLCanvasElement, private containerWidth: number) {
        super(IMG_ID, WIDTH, HEIGHT);
        this.canvasCtx = this.canvas.getContext("2d");
        this.x = containerWidth;
        this.y = getRandomNum(MAX_SKY_LEVEL, MIN_SKY_LEVEL);
    }

    public update(speed: number) {
        this.x -= Math.ceil(speed);
    }

    public render() {
        this.drawToCanvas(this.canvasCtx);
    }

    public isVisible(): boolean {
        return this.x + WIDTH > 0;
    }

    public needNextCloud(containerWidth: number): boolean {
        return containerWidth - this.x > this.cloudGap;
    }
}