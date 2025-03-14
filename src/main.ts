import { Highlighter } from "./highlighter";
import { decodeImage, encodeCanvasImage } from "./image";
import { Monochrome } from "./monochrome";
import { detectQR, drawQR, QR } from "./qr";
import { print } from "./print";


export async function detect(dataUrl: string): Promise<void> {
    const image = await decodeImage(dataUrl);
    const monochrome = new Monochrome(image);
    const qrs = detectQR(monochrome);

    highlightQRs(qrs);

    const [qr] = qrs;
    if (qr && qr.valid) {
        printQR(qr.modules);
    }
}

function highlightQRs(qrs: ReadonlyArray<QR>): void {
    const highlighter = new Highlighter();

    for (const { valid, grid: { top, left, bottom, right } } of qrs) {
        highlighter.highligtSolid(
            valid ? "#00ff00a0" : "#ff0000a0",
            { width: right - left + 1, height: bottom - top + 1 },
            { position: { top, left } });
    }
}

async function printQR(modules: QR['modules']) {
    const canvas = new OffscreenCanvas(448, 448);
    drawQR(modules, canvas);
    const data = await encodeCanvasImage(canvas);

    print(data, "2.25in", "2.25in");
}
