export class ContentInjector {

    readonly tabId: number;

    constructor(tabId: number) {
        this.tabId = tabId;
    }

    async inject<Args extends any[], Result>(
        func: (...args: Args) => Promise<Result>,
        ...args: Args
    ): Promise<Result | undefined> {
        const results = await chrome.scripting.executeScript({
            target: { tabId: this.tabId },
            func,
            args,
        });
        return await results[0]?.result;
    }

}