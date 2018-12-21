// @flow strict

import React from 'react';
import type { Node, ComponentType } from 'react';
import { WindowSizeContext } from './window-size-context';
import type { WindowSize } from './window-size-context';

type WindowSizeProp = {| windowSize: WindowSize |};
type PropsWithoutWindowSize<Props> = $Diff<Props, WindowSizeProp>;

/**
 * The connect function to create a component that automatically subscribed to the latest window
 * size.
 * This is a higher order component. You can create and use a connected component by:
 * ```jsx
 * const ConnectedDialog = windowSizeConnect(Dialog);
 * <ConnectedDialog {...props} />
 * ```
 * Type Param: Props. The original props.
 *
 * @param {ComponentType<Props>} UnconnectedComponent the unconnected component.
 * @return {ComponentType<PropsWithoutWindowSize<Props>>} the connected component.
 */
// flowlint-next-line unclear-type:off
export default function windowSizeConnect<Props: Object>(
  UnconnectedComponent: ComponentType<Props>,
): ComponentType<PropsWithoutWindowSize<Props>> {
  return (props: PropsWithoutWindowSize<Props>): Node => (
    <WindowSizeContext.Consumer>
      {(windowSize: WindowSize) => {
        const allProps = { ...props, windowSize };
        return <UnconnectedComponent {...allProps} />;
      }}
    </WindowSizeContext.Consumer>
  );
}
