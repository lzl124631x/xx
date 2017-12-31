import { IHashMap } from "./globals";

class ImageLoader {
    private images: IHashMap<HTMLImageElement> = {};
    public load(id: string): void {
        if (this.images[id]) return; // Skip if already loaded.
        let image = new Image();
        image.src = `./asset/image/${id}.png`;
        this.images[id] = image;
    }

    public get(id: string): HTMLImageElement {
        return this.images[id];
    }
}

export default new ImageLoader();