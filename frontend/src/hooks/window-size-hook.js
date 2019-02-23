// @flow strict

import { useState, useEffect, useMemo } from 'react';
import type { Node } from 'react';

export type WindowSize = {| +width: number; +height: number; |};

const getWindowSize = (): WindowSize => ({ width: window.innerWidth, height: window.innerHeight });

/**
 * A hook for window size.
 * @return {WindowSize} the correct value of window size.
 */
export function useWindowSize(): WindowSize {
  const [size, setSize] = useState(getWindowSize);
  useEffect(() => {
    const listener = () => setSize(getWindowSize());
    window.addEventListener('resize', listener);
    return () => window.removeEventListener('resize', listener);
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
