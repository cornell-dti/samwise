// @flow strict

import React from 'react';

export type WindowSize = {| +width: number; +height: number; |};
export type WindowSizeProps = {| +windowSize: WindowSize; |};

/**
 * Returns the current window size.
 *
 * @return {WindowSize} the current window size.
 */
export const getWindowSize = (): WindowSize => ({
  width: window.innerWidth, height: window.innerHeight,
});

/**
 * The global window size context.
 * @type {React.Context<WindowSize>}
 */
export const WindowSizeContext = React.createContext<WindowSize>(getWindowSize());
