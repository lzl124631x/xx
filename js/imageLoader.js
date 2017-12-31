"use strict";
exports.__esModule = true;
var ImageLoader = /** @class */ (function () {
    function ImageLoader() {
        this.images = {};
    }
    ImageLoader.prototype.load = function (id) {
        if (this.images[id])
            return; // Skip if already loaded.
        var image = new Image();
        image.src = "./asset/image/" + id + ".png";
        this.images[id] = image;
    };
    ImageLoader.prototype.get = function (id) {
        return this.images[id];
    };
    return ImageLoader;
}());
exports["default"] = new ImageLoader();
