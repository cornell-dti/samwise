import { useState, useEffect, useMemo, ReactNode } from 'react';

export type WindowSize = { readonly width: number; readonly height: number };
type Listener = (windowSize: WindowSize) => void;

const getWindowSize = (): WindowSize => ({ width: window.innerWidth, height: window.innerHeight });

let cachedWindowSize: WindowSize = { width: 0, height: 0 };
let hasUnreportedChange = false;
const listeners = new Map<number, Listener>();
let listenerSize = 0;

const windowSizeListener = (): void => {
  const newSize = getWindowSize();
  if (newSize.width === cachedWindowSize.width && newSize.height === cachedWindowSize.height) {
    return;
  }
  cachedWindowSize = newSize;
  hasUnreportedChange = true;
};

const notifyAll = (): void => {
  if (hasUnreportedChange) {
    listeners.forEach((l) => l(cachedWindowSize));
    hasUnreportedChange = false;
  }
};

const bindListener = (listener: Listener): (() => void) => {
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
export function useWindowSize(): WindowSize {
  const [size, setSize] = useState(getWindowSize);
  useEffect(() => bindListener(setSize), []);
  return size;
}

/**
 * A hook for window size.
 */
export function useWindowSizeCallback(onChange: (windowSize: WindowSize) => void): void {
  const [size, setSize] = useState(getWindowSize);
  useEffect(() => bindListener(setSize), []);
  useEffect(() => onChange(size));
}

/**
 * A hook for computed value based on window size and memoized rendering.
 * You can use this hook to implement efficient breakpoint logic.
 *
 * @param f a function that computes the value given a window size.
 * @return the computed value.
 */
export function useMappedWindowSize<T>(f: (windowSize: WindowSize) => T): T {
  const [mappedValue, setMappedValue] = useState(() => f(getWindowSize()));
  useEffect(
    () => bindListener((windowSize: WindowSize): void => {
      const newMappedValue = f(windowSize);
      if (newMappedValue !== mappedValue) {
        setMappedValue(newMappedValue);
      }
    }),
    [f, mappedValue],
  );
  return mappedValue;
}

/**
 * A hook for computed value based on window size and memoized rendering.
 * You can use this hook to implement efficient breakpoint logic.
 *
 * @param f a function that computes the value given a window size.
 * @param render a function that renders a component given the computed value.
 * @return the memoized rendered value.
 */
export function useMemoizedMappedWindowSize<T>(
  f: (windowSize: WindowSize) => T,
  render: (t: T) => ReactNode,
): ReactNode {
  const value = f(useWindowSize());
  return useMemo(() => render(value), [render, value]);
}
