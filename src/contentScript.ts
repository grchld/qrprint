import { detect } from "./main";
import { ExtensionRequest } from "./messages";


function onMessage(message: ExtensionRequest, _sender: unknown, sendResponse: (reply: unknown) => void): boolean {

    switch (message.type) {
        case 'detect':
            detect(message.dataUrl).then(sendResponse);
            return true;
            break;
        case 'close':
            chrome.runtime.onMessage.removeListener(onMessage);
            break;
    }

    return false;
}

if (chrome.runtime.onMessage.hasListeners()) {
    console.log("Content script is already loaded");
} else {
    chrome.runtime.onMessage.addListener(onMessage);
}
