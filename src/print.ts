export async function print(dataUrl: string, width: string, height: string) {
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
    html, body, img {
        border: 0;
        height: ${height};
        margin: 0;
        overflow: hidden;
        padding: 0;
        width: ${width};
    }
    </style>
    </head>
    <body>
    <img src="${dataUrl}"/>
    </body>
    </html>
    `;

    document.body.appendChild(frame);
}
