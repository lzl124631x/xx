import { IHashMap } from "./globals";
import Resources from "./resources";

class ImageLoader {
    private images: IHashMap<HTMLImageElement> = {};
    public load(id: string, src: string): void {
        if (this.images[id]) return; // Skip if already loaded.
        let image = new Image();
        image.src = Resources[src];
        this.images[id] = image;
    }

    public get(id: string): HTMLImageElement {
        return this.images[id];
    }
}

export default new ImageLoader();