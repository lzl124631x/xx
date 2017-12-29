"use strict";
exports.__esModule = true;
/**
* Collision box object.
*/
var CollisionBox = /** @class */ (function () {
    function CollisionBox(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    CollisionBox.prototype.collideWith = function (target) {
        return (this.x < target.x + target.width &&
            this.x + this.width > target.x &&
            this.y < target.y + target.height &&
            this.height + this.y > target.y);
    };
    return CollisionBox;
}());
exports["default"] = CollisionBox;
