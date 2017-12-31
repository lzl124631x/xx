"use strict";
exports.__esModule = true;
var Sprite = /** @class */ (function () {
    function Sprite(imgSrc, width, height, x, y) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        this.image = new Image();
        this.visible = true;
        this.image.src = imgSrc;
    }
    Sprite.prototype.drawToCanvas = function (ctx) {
        if (!this.visible)
            return;
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    };
    /**
     * 简单的碰撞检测定义：
     * 另一个精灵的中心点处于本精灵所在的矩形内即可
     * @param{Sprite} sp: Sptite的实例
     */
    Sprite.prototype.isCollideWith = function (sp) {
        var spX = sp.x + sp.width / 2;
        var spY = sp.y + sp.height / 2;
        if (!this.visible || !sp.visible)
            return false;
        return !!(spX >= this.x
            && spX <= this.x + this.width
            && spY >= this.y
            && spY <= this.y + this.height);
    };
    return Sprite;
}());
exports["default"] = Sprite;
