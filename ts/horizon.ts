import { IHashMap, getRandomNum, arrayClone } from "./globals";
import HorizonLine from "./horizonLine";
import Obstacle from "./obstacle";
import Cloud from "./cloud";

/**
* Horizon contains clouds, obstacles and the ground.
*/
export default class Horizon {
    private canvasCtx: CanvasRenderingContext2D;
    private config: IHashMap<number> = {
        BG_CLOUD_SPEED: 0.2,
        BUMPY_THRESHOLD: .3,
        CLOUD_FREQUENCY: .5,
        HORIZON_HEIGHT: 16,
        MAX_CLOUDS: 6
    };
    public obstacles: Obstacle[] = [];
    private cloudFrequency: number;
    private runningTime: number;
    // Cloud
    private clouds: Cloud[] = [];
    private cloudSpeed = this.config.BG_CLOUD_SPEED;
    // Horizon
    private horizonLine: HorizonLine = null;
    constructor(private canvas: HTMLCanvasElement, private dimensions: any) {
        this.canvasCtx = this.canvas.getContext('2d');
        this.cloudFrequency = this.config.CLOUD_FREQUENCY;
        // Cloud
        this.clouds = [];
        this.cloudSpeed = this.config.BG_CLOUD_SPEED;
        // Horizon
        this.horizonLine = null;
        this.init();
    }

    /**
      * Initialise the horizon. Just add the line and a cloud. No obstacles.
      */
    private init() {
        this.addCloud();
        this.horizonLine = new HorizonLine(this.canvas, this.dimensions);
    }
    /**
     * @param {number} deltaTime
     * @param {number} currentSpeed
     * @param {boolean} updateObstacles Used as an override to prevent
     * the obstacles from being updated / added. This happens in the
     * ease in section.
     */
    public update(deltaTime: number, currentSpeed: number, updateObstacles: boolean) {
        this.runningTime += deltaTime;
        this.horizonLine.update(deltaTime, currentSpeed);
        this.updateClouds(deltaTime, currentSpeed);
        if (updateObstacles) {
            this.updateObstacles(deltaTime, currentSpeed);
        }
    }

    private updateClouds(deltaTime: number, speed: number) {
        var cloudSpeed = this.cloudSpeed / 1000 * deltaTime * speed;
        var numClouds = this.clouds.length;
        if (numClouds) {
            for (var i = numClouds - 1; i >= 0; i--) {
                this.clouds[i].update(cloudSpeed);
            }
            var lastCloud = this.clouds[numClouds - 1];
            // Check for adding a new cloud.
            if (numClouds < this.config.MAX_CLOUDS &&
                lastCloud.needNextCloud(this.dimensions.WIDTH) &&
                this.cloudFrequency > Math.random()) {
                this.addCloud();
            }
            // Remove expired clouds.
            this.clouds = this.clouds.filter(cloud => !cloud.remove);
        }
    }

    private updateObstacles(deltaTime:number, currentSpeed:number) {
        // Obstacles, move to Horizon layer.
        this.obstacles.forEach(obstacle => obstacle.update(deltaTime, currentSpeed));
        this.obstacles = this.obstacles.filter(obstacle => !obstacle.remove);
        if (this.obstacles.length > 0) {
            var lastObstacle = this.obstacles[this.obstacles.length - 1];
            if (lastObstacle.isNextObstacleNeeded(this.dimensions.WIDTH)) {
                this.addNewObstacle(currentSpeed);
                lastObstacle.followingObstacleCreated = true;// TODO: remove if flag if possible.
            }
        } else {
            // Create new obstacles.
            this.addNewObstacle(currentSpeed);
        }
    }

    private addNewObstacle(currentSpeed: number) {
        this.obstacles.push(Obstacle.randomCreate(this.canvasCtx, this.dimensions, currentSpeed));
    }
    /**
     * Reset the horizon layer.
     * Remove existing obstacles and reposition the horizon line.
     */
    public reset() {
        this.obstacles = [];
        this.horizonLine.reset();
    }
    /**
     * Add a new cloud to the horizon.
     */
    private addCloud() {
        this.clouds.push(new Cloud(this.canvas, this.dimensions.WIDTH));
    }
}