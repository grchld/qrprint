function base64ToArrayBuffer(base64: string) {
    const binaryString = atob(base64);

    const { length } = binaryString;
    const bytes = new Uint8Array(length);

    for (let i = 0; i < length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    return bytes.buffer;
}

export async function decodeImage(dataUrl: string): Promise<ImageBitmap> {
    const [type, base64] = dataUrl.split(",");
    const bytes = base64ToArrayBuffer(base64);
    const blob = new Blob([bytes], { type });
    return await createImageBitmap(blob);
}

export async function encodeCanvasImage(canvas: OffscreenCanvas, type: string = "image/png"): Promise<string> {
    const blob = await canvas.convertToBlob({ type });
    const buffer = await blob.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    return `data:${type};base64,` + btoa(String.fromCharCode(...bytes));

}