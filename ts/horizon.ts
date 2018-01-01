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

    public render() {
        this.horizonLine.render();
        this.clouds.forEach(c => c.render());
        this.obstacles.forEach(o => o.render());
    }

    private updateClouds(deltaTime: number, speed: number) {
        var cloudSpeed = this.cloudSpeed / 1000 * deltaTime * speed;
        this.clouds.forEach(c => c.update(cloudSpeed));
        this.clouds = this.clouds.filter(cloud => cloud.isVisible());
        // Add new cloud if needed.
        let len = this.clouds.length;
        if (!len ||
            (len < this.config.MAX_CLOUDS &&
            this.clouds[len - 1].needNextCloud(this.dimensions.WIDTH) &&
            this.cloudFrequency > Math.random())) {
            this.addCloud();
        }
    }

    private addCloud() {
        this.clouds.push(new Cloud(this.canvas, this.dimensions.WIDTH));
    }

    private updateObstacles(deltaTime:number, currentSpeed:number) {
        // Obstacles, move to Horizon layer.
        this.obstacles.forEach(obstacle => obstacle.update(deltaTime, currentSpeed));
        this.obstacles = this.obstacles.filter(obstacle => obstacle.isVisible());
        // Add new obstacle if needed.
        let len = this.obstacles.length;
        if (!len || this.obstacles[len - 1].needNextObstacle(this.dimensions.WIDTH)) {
            this.addObstacle(currentSpeed);
        }
    }

    private addObstacle(currentSpeed: number) {
        this.obstacles.push(Obstacle.randomCreate(this.canvasCtx, this.dimensions, currentSpeed));
    }

    public reset() {
        this.obstacles = [];
        this.horizonLine.reset();
    }
}