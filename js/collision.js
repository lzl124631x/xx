"use strict";
exports.__esModule = true;
var collisionBox_1 = require("./collisionBox");
var tRex_1 = require("./tRex");
/**
 * Check for a collision.
* @param {Obstacle} obstacle
* @param {Trex} tRex T-rex object.
* @param {CanvasRenderingContext2D?} canvasCtx Optional canvas context for drawing
* collision boxes.
* @return {Array.<CollisionBox>}
*/
function checkForCollision(obstacle, tRex, width, canvasCtx) {
    var obstacleBoxXPos = width + obstacle.xPos;
    // Adjustments are made to the bounding box as there is a 1 pixel white
    // border around the t-rex and obstacles.
    var tRexBox = new collisionBox_1["default"](tRex.xPos + 1, tRex.yPos + 1, tRex.config.WIDTH - 2, tRex.config.HEIGHT - 2);
    var obstacleBox = new collisionBox_1["default"](obstacle.xPos + 1, obstacle.yPos + 1, obstacle.typeConfig.width * obstacle.size - 2, obstacle.typeConfig.height - 2);
    // Debug outer box
    if (canvasCtx) {
        drawCollisionBoxes(canvasCtx, tRexBox, obstacleBox);
    }
    // Simple outer bounds check.
    if (boxCompare(tRexBox, obstacleBox)) {
        var collisionBoxes = obstacle.collisionBoxes;
        var tRexCollisionBoxes = tRex_1["default"].collisionBoxes;
        // Detailed axis aligned box check.
        for (var t = 0; t < tRexCollisionBoxes.length; t++) {
            for (var i = 0; i < collisionBoxes.length; i++) {
                // Adjust the box to actual positions.
                var adjTrexBox = createAdjustedCollisionBox(tRexCollisionBoxes[t], tRexBox);
                var adjObstacleBox = createAdjustedCollisionBox(collisionBoxes[i], obstacleBox);
                var crashed = boxCompare(adjTrexBox, adjObstacleBox);
                // Draw boxes for debug.
                if (canvasCtx) {
                    drawCollisionBoxes(canvasCtx, adjTrexBox, adjObstacleBox);
                }
                if (crashed) {
                    return [adjTrexBox, adjObstacleBox];
                }
            }
        }
    }
    return false;
}
exports.checkForCollision = checkForCollision;
;
/**
 * Adjust the collision box.
 * @param {CollisionBox} box The original box.
 * @param {CollisionBox} adjustment Adjustment box.
 * @return {CollisionBox} The adjusted collision box object.
 */
function createAdjustedCollisionBox(box, adjustment) {
    return new collisionBox_1["default"](box.x + adjustment.x, box.y + adjustment.y, box.width, box.height);
}
;
/**
 * Draw the collision boxes for debug.
 */
function drawCollisionBoxes(canvasCtx, tRexBox, obstacleBox) {
    canvasCtx.save();
    canvasCtx.strokeStyle = '#f00';
    canvasCtx.strokeRect(tRexBox.x, tRexBox.y, tRexBox.width, tRexBox.height);
    canvasCtx.strokeStyle = '#0f0';
    canvasCtx.strokeRect(obstacleBox.x, obstacleBox.y, obstacleBox.width, obstacleBox.height);
    canvasCtx.restore();
}
;
/**
 * Compare two collision boxes for a collision.
 * @return {boolean} Whether the boxes intersected.
 */
function boxCompare(tRexBox, obstacleBox) {
    var crashed = false;
    var tRexBoxX = tRexBox.x;
    var tRexBoxY = tRexBox.y;
    var obstacleBoxX = obstacleBox.x;
    var obstacleBoxY = obstacleBox.y;
    // Axis-Aligned Bounding Box method.
    if (tRexBox.x < obstacleBoxX + obstacleBox.width &&
        tRexBox.x + tRexBox.width > obstacleBoxX &&
        tRexBox.y < obstacleBox.y + obstacleBox.height &&
        tRexBox.height + tRexBox.y > obstacleBox.y) {
        crashed = true;
    }
    return crashed;
}
;
