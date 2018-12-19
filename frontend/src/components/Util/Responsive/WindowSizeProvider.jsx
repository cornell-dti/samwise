// @flow strict

import React from 'react';
import type { Node } from 'react';
import { WindowSizeContext, getWindowSize } from './window-size-context';
import type { WindowSize } from './window-size-context';

type Props = {| +children: Node |};
type State = {| +windowSize: WindowSize; |};

/**
 * Component used to register and update the latest window size.
 * You need to put this provider at top-level or some sub-root where you start to care about
 * window size.
 */
export default class WindowSizeProvider extends React.PureComponent<Props, State> {
  state: State = { windowSize: getWindowSize() };

  componentDidMount() {
    window.addEventListener('resize', this.reportNewWindowSize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.reportNewWindowSize);
  }

  /**
   * Report new window size.
   */
  reportNewWindowSize = () => this.setState({ windowSize: getWindowSize() });

  render() {
    const { children } = this.props;
    const { windowSize } = this.state;
    return (
      <WindowSizeContext.Provider value={windowSize}>
        {children}
      </WindowSizeContext.Provider>
    );
  }
}
