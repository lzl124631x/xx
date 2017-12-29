import { IHashMap, IS_HIDPI, FPS } from "./globals";

/**
 * Horizon Line.
 * Consists of two connecting lines. Randomly assigns a flat / bumpy horizon.
 */
export default class HorizonLine {
    private static defaultDimensions: IHashMap<number> = {
        WIDTH: 0,
        HEIGHT: 12,
        YPOS: 127
    };

    private canvasCtx: CanvasRenderingContext2D;
    private sourceDimensions: IHashMap<number> = {};
    private dimensions = HorizonLine.defaultDimensions;
    private sourceXPos: number[] = [0, 600];// TODO: this 600 is dependent to image size.
    private xPos: number[] = [];
    private yPos: number = 0;
    private bumpThreshold: number = 0.5;
    constructor(private canvas: HTMLCanvasElement, private image: HTMLImageElement, dimensions: any) {
        this.canvasCtx = canvas.getContext('2d');
        this.dimensions.WIDTH = dimensions.WIDTH;
        this.dimensions.YPOS = dimensions.HEIGHT - 20;// TODO: this 20 is dependent to outer settings.
        this.setSourceDimensions();
        this.draw();
    }

    /**
      * Set the source dimensions of the horizon line.
      */
    private setSourceDimensions() {
        for (var dimension in HorizonLine.defaultDimensions) {
            if (IS_HIDPI) {
                if (dimension != 'YPOS') {
                    this.sourceDimensions[dimension] =
                        HorizonLine.defaultDimensions[dimension] * 2;
                }
            } else {
                this.sourceDimensions[dimension] =
                    HorizonLine.defaultDimensions[dimension];
            }
            this.dimensions[dimension] = HorizonLine.defaultDimensions[dimension];
        }
        this.xPos = [0, this.dimensions.WIDTH];
        this.yPos = this.dimensions.YPOS;
    }

    /**
     * Return the crop x position of a type.
     */
    private getRandomType() {
        return Math.random() > this.bumpThreshold ? this.dimensions.WIDTH : 0;
    }
    /**
     * Draw the horizon line.
     */
    private draw() {
        this.canvasCtx.drawImage(this.image, this.sourceXPos[0], 0,
            this.sourceDimensions.WIDTH, this.sourceDimensions.HEIGHT,
            this.xPos[0], this.yPos,
            this.dimensions.WIDTH, this.dimensions.HEIGHT);
        this.canvasCtx.drawImage(this.image, this.sourceXPos[1], 0,
            this.sourceDimensions.WIDTH, this.sourceDimensions.HEIGHT,
            this.xPos[1], this.yPos,
            this.dimensions.WIDTH, this.dimensions.HEIGHT);
    }
    /**
     * Update the x position of an indivdual piece of the line.
     * @param {number} pos Line position.
     * @param {number} increment
     */
    private updateXPos(pos: number, increment: number) {
        var line1 = pos;
        var line2 = pos == 0 ? 1 : 0;
        this.xPos[line1] -= increment;
        this.xPos[line2] = this.xPos[line1] + this.dimensions.WIDTH;
        if (this.xPos[line1] <= -this.dimensions.WIDTH) {
            this.xPos[line1] += this.dimensions.WIDTH * 2;
            this.xPos[line2] = this.xPos[line1] - this.dimensions.WIDTH;
            this.sourceXPos[line1] = this.getRandomType();
        }
    }
    /**
     * Update the horizon line.
     * @param {number} deltaTime
     * @param {number} speed
     */
    public update(deltaTime: number, speed: number) {
        var increment = Math.floor(speed * (FPS / 1000) * deltaTime);
        if (this.xPos[0] <= 0) {
            this.updateXPos(0, increment);
        } else {
            this.updateXPos(1, increment);
        }
        this.draw();
    }
    /**
     * Reset horizon to the starting position.
     */
    public reset() {
        this.xPos[0] = 0;
        this.xPos[1] = this.dimensions.WIDTH;
    }
}