import { ContentInjector } from "./contentInjector";

export class Printer {
    readonly injector: ContentInjector;

    constructor(injector: ContentInjector) {
        this.injector = injector;
    }

    async print(dataUrl: string, width: string, height: string) {
        await this.injector.inject(printerInjection, dataUrl, width, height);
    }
}

async function printerInjection(dataUrl: string, width: string, height: string) {
    const frame = document.createElement("iframe");
    const { style } = frame;
    style.display = "hidden";
    style.top = "0";
    style.left = "0";
    style.width = width;
    style.height = height;
    style.border = "0";

    frame.onload = () => {
        const closePrint = () => document.body.removeChild(frame);
        const { contentWindow } = frame;
        if (contentWindow) {
            contentWindow.onbeforeunload = closePrint;
            contentWindow.onafterprint = closePrint;
            contentWindow.print();
        }
    };

    frame.srcdoc = `
    <html>
    <head>
    <style>    
    body {
        background-image: url("${dataUrl}");
        background-size: contain;
        background-repeat: no-repeat;
        height: ${height};
        margin: 0;
        overflow: hidden;
        width: ${width};
    }
    </style>
    </head>
    <body>
    </body>
    </html>
    `;

    document.body.appendChild(frame);
}
