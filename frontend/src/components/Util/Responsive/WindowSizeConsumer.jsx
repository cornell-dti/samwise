// @flow strict

import React from 'react';
import type { Node, AbstractComponent } from 'react';
import { WindowSizeContext } from './window-size-context';
import type { WindowSize, WindowSizeProps } from './window-size-context';

export type PropsWithoutWindowSize<Props> = $Diff<Props, WindowSizeProps>;

type FullProps<OP> = {| ...$Exact<OP>; ...WindowSizeProps |}
type UnconnectedCom<OP> = AbstractComponent<FullProps<OP>>;

/**
 * The connect function to create a component that automatically subscribed to the latest window
 * size.
 * This is a higher order component. You can create and use a connected component by:
 * ```jsx
 * const ConnectedDialog = windowSizeConnect(Dialog);
 * <ConnectedDialog {...props} />
 * ```
 * Type Param: OP. The own props of the component, excluding the subscribed WindowSize.
 */
export default function windowSizeConnect<OP>(
  UnconnectedComponent: UnconnectedCom<OP>,
): AbstractComponent<$Exact<OP>, void> {
  return (props): Node => (
    <WindowSizeContext.Consumer>
      {(windowSize: WindowSize) => <UnconnectedComponent windowSize={windowSize} {...props} />}
    </WindowSizeContext.Consumer>
  );
}
