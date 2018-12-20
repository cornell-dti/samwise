// @flow strict

import React from 'react';
import type { Node } from 'react';
import { Icon } from 'semantic-ui-react';
import FocusView from './FocusView/FocusView';
import FutureView, { futureViewConfigProvider } from './FutureView/FutureView';
import styles from './TaskView.css';
import windowSizeConnect from '../Util/Responsive/WindowSizeConsumer';
import type { WindowSize } from '../Util/Responsive/window-size-context';
import type { FutureViewConfig } from './FutureView/FutureView';

type Props = {|
  +windowSize: WindowSize;
|};
type State = {|
  +doesShowFocusView: boolean;
  +futureViewConfig: FutureViewConfig;
|};

class TaskView extends React.PureComponent<Props, State> {
  state: State = {
    doesShowFocusView: true,
    futureViewConfig: futureViewConfigProvider.initialValue,
  };

  /**
   * Handler for toggling the focus view. In n-days mode, it cannot be toggled.
   */
  toggleFocusView = () => this.setState((state: State) => ({
    doesShowFocusView: !state.doesShowFocusView,
  }));

  /**
   * Handle when future view config changes.
   *
   * @param {FutureViewConfig} futureViewConfig the new future view config.
   */
  futureViewConfigOnChange = (futureViewConfig: FutureViewConfig) => this.setState({
    futureViewConfig,
  });

  /**
   * Render the toggle for focus view, for wide screen.
   *
   * @return {Node} the rendered component.
   */
  renderWideScreenFocusViewToggleComponent = (): Node => {
    const { doesShowFocusView, futureViewConfig } = this.state;
    if (futureViewConfigProvider.isInNDaysView(futureViewConfig)) {
      return null;
    }
    const wrapperStyle = doesShowFocusView ? { left: '-5em' } : { left: '-1em' };
    const buttonStyle = doesShowFocusView ? { left: '2em' } : {};
    const iconName = doesShowFocusView ? 'chevron left' : 'chevron right';
    const iconClass = doesShowFocusView
      ? styles.FocusViewToggleIconFocusViewShow
      : styles.FocusViewToggleIconFocusViewHide;
    return (
      <div className={styles.FocusViewToggleWrapper} style={wrapperStyle}>
        <div
          role="button"
          tabIndex={-1}
          className={styles.FocusViewToggle}
          style={buttonStyle}
          onClick={this.toggleFocusView}
          onKeyDown={this.toggleFocusView}
        >
          <Icon name={iconName} className={iconClass} />
        </div>
      </div>
    );
  };

  render(): Node {
    const { windowSize } = this.props;
    const { doesShowFocusView, futureViewConfig } = this.state;
    return (
      <div className={styles.TaskView}>
        {doesShowFocusView && (
          <div className={styles.FocusPanel}>
            <h3 className={styles.ControlTitle}>Focus</h3>
            <FocusView />
          </div>
        )}
        <div className={styles.FuturePanel}>
          {this.renderWideScreenFocusViewToggleComponent()}
          <FutureView
            windowSize={windowSize}
            config={futureViewConfig}
            onConfigChange={this.futureViewConfigOnChange}
          />
        </div>
      </div>
    );
  }
}

const ConnectedTaskView = windowSizeConnect<Props>(TaskView);
export default ConnectedTaskView;
