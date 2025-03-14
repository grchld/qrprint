
export const delay = (timeout: number) => new Promise(resolve => setTimeout(resolve, timeout));

export const nextFrame = () => new Promise(resolve => requestAnimationFrame(resolve));

export type Optional<R> = { success: true, result: R } | { success: false };

export function timedPromise<R>(timeout: number, promise: Promise<R>): Promise<Optional<R>> {
    return new Promise((resolve, reject) => {
        let timedOut = false;
        const timer = setTimeout(() => {
            timedOut = true;
            resolve({ success: false });
        }, timeout);
        promise.then(result => {
            if (!timedOut) {
                clearTimeout(timer);
                resolve({ success: true, result });
            }
        });
        promise.catch(e => {
            if (!timedOut) {
                clearTimeout(timer);
                reject(e);
            }
        })
    });
}
