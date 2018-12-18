// @flow strict

import React from 'react';
import type { Node } from 'react';

type Props = {| +children: Node |};

type WindowSize = {| +width: number; +height: number; |};
type State = {| +windowSize: WindowSize; |};

const initialWindowSize = { width: window.innerWidth, height: window.innerHeight };

export const WindowSizeContext = React.createContext<WindowSize>(initialWindowSize);

/**
 * Component used to register and update the latest window size.
 */
export default class WindowSizeProvider extends React.PureComponent<Props, State> {
  state: State = { windowSize: initialWindowSize };

  componentDidMount() {
    window.addEventListener('resize', this.reportNewWindowSize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.reportNewWindowSize);
  }

  /**
   * Report new window size.
   */
  reportNewWindowSize = () => this.setState({
    windowSize: { width: window.innerWidth, height: window.innerHeight },
  });

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
