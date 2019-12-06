/**
 * Generate a random id to make React happy.
 *
 * @return {number} a random id.
 */
export const randomId = (): string => String(new Date().getTime());

/**
 * The identity function.
 */
export function identity<T>(t: T): T { return t; }

/**
 * An empty function used to ignore promise.
 */
export const ignore = (): void => {return;};

/**
 * Throw an error. Useful when want to use this as an expression.
 *
 * @param {?string} message an optional message.
 */
export const error = (message?: string): never => { throw new Error(message); };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type StringKeyObj = { readonly [k: string]: any };

/**
 * Shallowly check equality of two objects.
 *
 * @param a object a.
 * @param b object b.
 */
export const shallowEqual = (a: StringKeyObj, b: StringKeyObj): boolean => {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  const l = aKeys.length;
  if (l !== bKeys.length) {
    return false;
  }
  for (let i = 0; i < l; i += 1) {
    const aKey = aKeys[i];
    if (a[aKey] !== b[aKey]) {
      return false;
    }
    const bKey = bKeys[i];
    if (a[bKey] !== b[bKey]) {
      return false;
    }
  }
  return true;
};

/**
 * Shallowly check equality of two arrays.
 *
 * @param a array a.
 * @param b array b.
 */
export const shallowArrayEqual = (
  a: readonly StringKeyObj[], b: readonly StringKeyObj[],
): boolean => {
  const l = a.length;
  if (l !== b.length) {
    return false;
  }
  for (let i = 0; i < l; i += 1) {
    if (!shallowEqual(a[i], b[i])) {
      return false;
    }
  }
  return true;
};
