/**
 * Generate a random id to make React happy.
 *
 * @return {number} a random id.
 */
export declare const randomId: () => string;
/**
 * The identity function.
 */
export declare function identity<T>(t: T): T;
/**
 * An empty function used to ignore promise.
 */
export declare const ignore: () => void;
/**
 * Throw an error. Useful when want to use this as an expression.
 *
 * @param {?string} message an optional message.
 */
export declare const error: (message?: string | undefined) => never;
declare type StringKeyObj = {
    readonly [k: string]: any;
};
/**
 * Shallowly check equality of two objects.
 *
 * @param a object a.
 * @param b object b.
 */
export declare const shallowEqual: (a: StringKeyObj, b: StringKeyObj) => boolean;
/**
 * Shallowly check equality of two arrays.
 *
 * @param a array a.
 * @param b array b.
 */
export declare const shallowArrayEqual: (a: readonly StringKeyObj[], b: readonly StringKeyObj[]) => boolean;
export {};
