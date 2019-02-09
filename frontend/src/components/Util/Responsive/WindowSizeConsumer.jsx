// @flow strict

import React from 'react';
import type { Node, AbstractComponent } from 'react';
import { WindowSizeContext } from './window-size-context';
import type { WindowSize, WindowSizeProps } from './window-size-context';

export type PropsWithoutWindowSize<Props> = $Diff<Props, WindowSizeProps>;

/**
 * The connect function to create a component that automatically subscribed to the latest window
 * size.
 * This is a higher order component. You can create and use a connected component by:
 * ```jsx
 * const ConnectedDialog = windowSizeConnect(Dialog);
 * <ConnectedDialog {...props} />
 * ```
 * Type Param: Config. The original component's config.
 *
 * @param {ComponentType<Props>} UnconnectedComponent the unconnected component.
 * @return {ComponentType<PropsWithoutWindowSize<Props>>} the connected component.
 */
export default function windowSizeConnect<Config: Object>(
  UnconnectedComponent: AbstractComponent<Config>,
): AbstractComponent<PropsWithoutWindowSize<Config>, void> {
  return (props: PropsWithoutWindowSize<Config>): Node => (
    <WindowSizeContext.Consumer>
      {(windowSize: WindowSize) => {
        const allProps = { ...props, windowSize };
        return <UnconnectedComponent {...allProps} />;
      }}
    </WindowSizeContext.Consumer>
  );
}
