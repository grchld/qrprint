import { ContentInjector } from "./contentInjector";
import { encodeCanvasImage } from "./image";


export type HighlighterOptions = Readonly<{
    position: { top: number, left: number },
    timeout?: number,
}>;


export class Highlighter {

    readonly contentInjector: ContentInjector;

    constructor(contentInjector: ContentInjector) {
        this.contentInjector = contentInjector;
    }

    async highlightCanvas(canvas: OffscreenCanvas, options: HighlighterOptions) {
        const dataUrl = await encodeCanvasImage(canvas);
        await this.contentInjector.inject(highligherInjection, dataUrl, canvas.width, canvas.height, options);
    }

    async highligtSolid(color: string, size: { width: number, height: number }, options: HighlighterOptions) {
        const { width, height } = size;
        const canvas = new OffscreenCanvas(width, height);
        const c = canvas.getContext('2d');
        if (!c) {
            throw new Error("No 2d context?");
        }
        c.fillStyle = color;
        c.fillRect(0, 0, width, height);
        await this.highlightCanvas(canvas, options);
    }
}


async function highligherInjection(dataUrl: string, width: number, height: number, options: HighlighterOptions) {
    const delay = (timeout: number) => new Promise(resolve => setTimeout(resolve, timeout));
    const nextFrame = () => new Promise(resolve => requestAnimationFrame(resolve));

    const { top, left } = options.position;
    const timeout = options.timeout ?? 3000;
    const img = document.createElement('img');
    const { style } = img;
    style.top = `${top / devicePixelRatio}px`;
    style.left = `${left / devicePixelRatio}px`;
    style.width = `${width / devicePixelRatio}px`;
    style.height = `${height / devicePixelRatio}px`;
    style.border = "0";
    style.position = "fixed";
    style.zIndex = "10000";
    style.transition = `opacity ${timeout}ms ease-out`;
    img.src = dataUrl;
    document.body.appendChild(img);
    await nextFrame();
    await nextFrame();
    img.style.opacity = "0";
    await delay(timeout);
    document.body.removeChild(img);
}