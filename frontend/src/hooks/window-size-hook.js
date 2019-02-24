// @flow strict

import { useState, useEffect, useMemo } from 'react';
import type { Node } from 'react';

export type WindowSize = {| +width: number; +height: number; |};
type Listener = (WindowSize) => void;

const getWindowSize = (): WindowSize => ({ width: window.innerWidth, height: window.innerHeight });

let cachedWindowSize: WindowSize = { width: 0, height: 0 };
let hasUnreportedChange: boolean = false;
const listeners = new Map<number, Listener>();
let listenerSize = 0;

const windowSizeListener = () => {
  const newSize = getWindowSize();
  if (newSize.width === cachedWindowSize.width && newSize.height === cachedWindowSize.height) {
    return;
  }
  cachedWindowSize = newSize;
  hasUnreportedChange = true;
};

const notifyAll = () => {
  if (hasUnreportedChange) {
    listeners.forEach(l => l(cachedWindowSize));
    hasUnreportedChange = false;
  }
};

const bindListener = (listener: Listener): () => void => {
  const id = listenerSize;
  listeners.set(id, listener);
  listenerSize += 1;
  return () => {
    listeners.delete(id);
  };
};

if (cachedWindowSize.width === 0) {
  window.addEventListener('resize', windowSizeListener);
  setInterval(notifyAll, 100);
}

/**
 * A hook for window size.
 */
export function useWindowSize(onChange: ?() => void): WindowSize {
  const [size, setSize] = useState(getWindowSize);
  useEffect(() => {
    const l = bindListener(setSize);
    if (onChange) {
      onChange();
    }
    return l;
  });
  return size;
}

/**
 * A hook for computed value based on window size and memoized rendering.
 * You can use this hook to implement efficient breakpoint logic.
 *
 * @param {function(WindowSize): T} f a function that computes the value given a window size.
 * @return {T} the computed value.
 */
export function useMappedWindowSize<T>(f: (WindowSize) => T): T {
  return f(useWindowSize());
}

/**
 * A hook for computed value based on window size and memoized rendering.
 * You can use this hook to implement efficient breakpoint logic.
 *
 * @param {function(WindowSize): T} f a function that computes the value given a window size.
 * @param {function(T): Node} render a function that renders a component given the computed value.
 * @return {T} the computed value.
 */
export function useMemoizedMappedWindowSize<T>(f: (WindowSize) => T, render: (T) => Node): Node {
  const value = f(useWindowSize());
  return useMemo(() => render(value), [value]);
}
