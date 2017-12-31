import { IHashMap } from "./globals";

class ImageLoader {
    private images: IHashMap<HTMLImageElement> = {};
    public load(id: string): HTMLImageElement {
        if (this.images[id]) return this.images[id];
        let image = new Image();
        image.onerror = function (e) {
            console.log("failed", id, JSON.stringify(e))
        }
        image.src = `asset/image/${id}.png`;
        this.images[id] = image;
        return image;
    }

    public get(id: string): HTMLImageElement {
        return this.images[id];
    }
}

export default new ImageLoader();