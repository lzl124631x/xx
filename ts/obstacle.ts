import { getRandomNum, IHashMap, FPS } from "./globals";
import CollisionBox from "./collisionBox";
import ImageLoader from "./imageLoader";

interface ObstacleType {
    type: string,
    className: string,
    width: number,
    height: number,
    yPos: number,
    multipleSpeed: number,
    minGap: number,
    collisionBoxes: CollisionBox[]
}

// This value should be grow smaller as game goes on to increase difficulty.
const GAP_COEFFICIENT = 0.6;

export default class Obstacle {
    private static readonly imageSources = {
      'CACTUS_LARGE': 'obstacle-large',
      'CACTUS_SMALL': 'obstacle-small'
    };
    /**
    * Coefficient for calculating the maximum gap.
    */
    private static readonly MAX_GAP_COEFFICIENT = 1.5;
    /**
     * Maximum obstacle grouping count.
     */
    private static readonly MAX_OBSTACLE_LENGTH = 3;
    /**
     * Obstacle definitions.
     * minGap: minimum pixel space betweeen obstacles.
     * multipleSpeed: Speed at which multiples are allowed.
     */
    public static readonly types: ObstacleType[] = [{
        type: 'CACTUS_SMALL',
        className: ' cactus cactus-small ',
        width: 17,
        height: 35,
        yPos: 105,
        multipleSpeed: 3,
        minGap: 120,
        collisionBoxes: [
            new CollisionBox(0, 7, 5, 27),
            new CollisionBox(4, 0, 6, 34),
            new CollisionBox(10, 4, 7, 14)
        ]
    },
    {
        type: 'CACTUS_LARGE',
        className: ' cactus cactus-large ',
        width: 25,
        height: 50,
        yPos: 90,
        multipleSpeed: 6,
        minGap: 120,
        collisionBoxes: [
            new CollisionBox(0, 12, 7, 38),
            new CollisionBox(8, 0, 7, 49),
            new CollisionBox(13, 10, 10, 38)
        ]
    }
    ];
    // The count of cactus in one group
    public size: number = getRandomNum(1, Obstacle.MAX_OBSTACLE_LENGTH);
    public xPos: number = 0;
    public yPos: number = 0;
    public collisionBoxes: CollisionBox[] = [];
    public gap = 0;
    private width: number;

    private static _constructor = (() => {
        Object.keys(Obstacle.imageSources).forEach(key => {
            ImageLoader.get(Obstacle.imageSources[key]);
        });
    })();

    constructor(private canvasCtx: CanvasRenderingContext2D, private typeConfig: ObstacleType, private dimensions: IHashMap<number>, speed: number) {
        this.yPos = this.typeConfig.yPos + this.dimensions.HEIGHT - 150;
        this.init(speed);
    }

    public static randomCreate(canvasCtx: CanvasRenderingContext2D, dimensions: IHashMap<number>, speed: number) {
        let type = Obstacle.types[getRandomNum(0, Obstacle.types.length - 1)]
        return new Obstacle(canvasCtx, type, dimensions, speed);
    }

    /**
      * Initialise the DOM for the obstacle.
      * @param {number} speed
      */
    private init(speed: number) {
        this.cloneCollisionBoxes();
        // Only allow sizing if we're at the right speed.
        if (this.size > 1 && this.typeConfig.multipleSpeed > speed) {
            this.size = 1;
        }
        this.width = this.typeConfig.width * this.size;
        this.xPos = this.dimensions.WIDTH - this.width;
        // Make collision box adjustments,
        // Central box is adjusted to the size as one box.
        // ____ ______ ________
        // _| |-| _| |-| _| |-|
        // | |<->| | | |<--->| | | |<----->| |
        // | | 1 | | | | 2 | | | | 3 | |
        // |_|___|_| |_|_____|_| |_|_______|_|
        //
        if (this.size > 1) {
            this.collisionBoxes[1].width = this.width - this.collisionBoxes[0].width -
                this.collisionBoxes[2].width;
            this.collisionBoxes[2].x = this.width - this.collisionBoxes[2].width;
        }
        this.gap = this.getGap(speed);
    }
    /**
     * Draw and crop based on size.
     */
    public render() {
        var sourceWidth = this.typeConfig.width;
        var sourceHeight = this.typeConfig.height;
        // Sprite
        var sourceX = (sourceWidth * this.size) * (0.5 * (this.size - 1));

        this.canvasCtx.drawImage(
            ImageLoader.get(Obstacle.imageSources[this.typeConfig.type]),
            sourceX, 0,
            sourceWidth * this.size, sourceHeight,
            this.xPos, this.yPos,
            this.typeConfig.width * this.size, this.typeConfig.height);
    }
    /**
     * Obstacle frame update.
     */
    public update(deltaTime: number, speed: number) {
        this.xPos -= Math.floor((speed * FPS / 1000) * deltaTime);
    }
    /**
     * Calculate a random gap size.
     * - Minimum gap gets wider as speed increses
     * @return {number} The gap size.
     */
    private getGap(speed: number) {
        var minGap = Math.round(this.width * speed +
            this.typeConfig.minGap * GAP_COEFFICIENT);
        var maxGap = Math.round(minGap * Obstacle.MAX_GAP_COEFFICIENT);
        return getRandomNum(minGap, maxGap);
    }
    /**
     * Check if obstacle is visible.
     * @return {boolean} Whether the obstacle is in the game area.
     */
    public isVisible() {
        return this.xPos + this.width > 0;
    }
    /**
     * Make a copy of the collision boxes, since these will change based on
     * obstacle type and size.
     */
    private cloneCollisionBoxes() {
        var collisionBoxes = this.typeConfig.collisionBoxes;
        for (var i = collisionBoxes.length - 1; i >= 0; i--) {
            this.collisionBoxes[i] = new CollisionBox(collisionBoxes[i].x,
                collisionBoxes[i].y, collisionBoxes[i].width,
                collisionBoxes[i].height);
        }
    }

    public needNextObstacle(width: number): boolean {
        return this.isVisible() &&
                (this.xPos + this.width + this.gap) < width;
    }

    public getCollisionBox(): CollisionBox {
        // Adjustments are made to the bounding box as there is a 1 pixel white border around
        return new CollisionBox(
        this.xPos + 1,
        this.yPos + 1,
        this.typeConfig.width * this.size - 2,
        this.typeConfig.height - 2);
    }
}