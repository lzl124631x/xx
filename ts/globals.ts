export const IS_IOS =
    window.navigator.userAgent.indexOf('UIWebViewForStaticFileContent') > -1;

export const FPS = 60;
// TODO: 2x-horizon is too large (2400x24) that exceeds the MAX_TEXTURE_SIZE 2048.
// Disabled HDPI temporarily.
export const IS_HIDPI = false;//window.devicePixelRatio > 1;

export interface IHashMap<T> {
    [key: string]: T;
}

export function getTimeStamp(): number {
    return IS_IOS ? new Date().getTime() : performance.now();
}

export function getRandomNum(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function arrayClone(array: any[]) {
    return array.slice(0);
}