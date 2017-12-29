"use strict";
exports.__esModule = true;
var resources_1 = require("./resources");
var ImageLoader = /** @class */ (function () {
    function ImageLoader() {
        this.images = {};
    }
    ImageLoader.prototype.load = function (id, src) {
        if (this.images[id])
            return; // Skip if already loaded.
        var image = new Image();
        image.src = resources_1["default"][src];
        this.images[id] = image;
    };
    ImageLoader.prototype.get = function (id) {
        return this.images[id];
    };
    return ImageLoader;
}());
exports["default"] = new ImageLoader();
