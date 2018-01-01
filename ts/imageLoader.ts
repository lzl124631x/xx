import { IHashMap } from "./globals";

class ImageLoader {
    private images: IHashMap<HTMLImageElement> = {};
    public get(id: string): HTMLImageElement {
        let image = this.images[id];
        if (!image) {
            image = new Image();
            image.src = `asset/image/${id}.png`;
            this.images[id] = image;
        }
        return image;
    }
}

export default new ImageLoader();