import { Printer } from './print';
import { Monochrome } from './monochrome';
import { decodeImage, encodeCanvasImage } from './image';
import { detectQR, drawQR, QR } from './qr';
import { ContentInjector } from './contentInjector';
import { Highlighter } from './highlighter';

function onClickAction(tab: chrome.tabs.Tab) {
    chrome.tabs.captureVisibleTab({ format: "png" }, async (dataUrl: string) => {
        const tabId = tab.id;
        if (tabId == null) {
            console.error("No tab id");
            return;
        }

        const contentInjector = new ContentInjector(tabId);

        const image = await decodeImage(dataUrl);
        const monochrome = new Monochrome(image);
        const qrs = detectQR(monochrome);

        highlightQRs(contentInjector, qrs);

        const [qr] = qrs;
        if (qr && qr.valid) {
            printQR(contentInjector, qr.modules);
        }

    });
}

function highlightQRs(contentInjector: ContentInjector, qrs: ReadonlyArray<QR>): void {
    const highlighter = new Highlighter(contentInjector);

    for (const { valid, grid: { top, left, bottom, right } } of qrs) {
        highlighter.highligtSolid(
            valid ? "#00ff00a0" : "#ff0000a0",
            { width: right - left + 1, height: bottom - top + 1 },
            { position: { top, left } });
    }
}

async function printQR(contentInjector: ContentInjector, modules: QR['modules']) {
    const canvas = new OffscreenCanvas(192, 192);
    drawQR(modules, canvas);
    const data = await encodeCanvasImage(canvas);

    const printer = new Printer(contentInjector);
    printer.print(data, "2.25in", "2.25in");
}

chrome.action.onClicked.addListener(onClickAction);