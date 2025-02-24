import { ExtensionRequest } from "./messages";

function onClickAction(tab: chrome.tabs.Tab) {
    const tabId = tab.id;
    if (tabId == null) {
        console.error("No tab id");
        return;
    }

    chrome.tabs.captureVisibleTab({ format: "png" }, async (dataUrl: string) => {

        await chrome.scripting.executeScript({
            target: { tabId },
            files: ["contentScript.js"],
        });

        await sendMessage(tabId, { type: "detect", dataUrl });

        //     await sendMessage(tabId, { type: "close" });


    });

}

async function sendMessage(tabId: number, request: ExtensionRequest): Promise<void> {
    await chrome.tabs.sendMessage(tabId, request);
}


chrome.action.onClicked.addListener(onClickAction);