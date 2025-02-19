export class Monochrome {

    readonly width: number;
    readonly height: number;
    readonly #pixels: ReadonlyArray<ReadonlyArray<boolean>> = [];

    constructor(image: ImageBitmap) {
        const { width, height } = image;
        this.width = width;
        this.height = height;

        const canvas = new OffscreenCanvas(width, height);
        const context = canvas.getContext('2d');
        if (context == null) {
            throw new Error("No 2d context?");
        }
        context.drawImage(image, 0, 0);

        const rgba = context.getImageData(0, 0, width, height).data;
        let i = 0;
        const pixels = [];
        for (let y = 0; y < height; y++) {
            const row: Array<boolean> = [];
            pixels.push(row);
            for (let x = 0; x < width; x++) {
                row.push(0.299 * rgba[i] + 0.587 * rgba[i + 1] + 0.114 * rgba[i + 2] <= 128);
                i += 4;
            }
        }
        this.#pixels = pixels;
    }

    row(y: number): ReadonlyArray<boolean> {
        return this.#pixels[y];
    }

    column(x: number): ReadonlyArray<boolean> {
        return this.#pixels.map(row => row[x]);
    }

    get(x: number, y: number): boolean {
        return this.#pixels[y][x];
    }
}