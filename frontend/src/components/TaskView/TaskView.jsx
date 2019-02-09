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
import type { Task } from '../../store/store-types';

type Props = {|
  +windowSize: WindowSize;
  +fullTasks: Task[];
  +inFocusTasks: Task[];
|};
type State = {|
  +doesShowFocusViewInWideScreen: boolean;
  +doesShowFutureViewInSmallScreen: boolean;
  +futureViewConfig: FutureViewConfig;
|};

class TaskView extends React.PureComponent<Props, State> {
  state: State = {
    doesShowFocusViewInWideScreen: false,
    doesShowFutureViewInSmallScreen: false,
    futureViewConfig: futureViewConfigProvider.initialValue,
  };

  screenIsSmall = (): boolean => {
    const { windowSize: { width } } = this.props;
    return width <= 768;
  };

  toggleFocusViewInWideScreen = () => this.setState((state: State) => ({
    doesShowFocusViewInWideScreen: !state.doesShowFocusViewInWideScreen,
  }));

  switchView = () => this.setState((state: State) => {
    const { doesShowFutureViewInSmallScreen } = state;
    return { doesShowFutureViewInSmallScreen: !doesShowFutureViewInSmallScreen };
  });

  futureViewConfigOnChange = (futureViewConfig: FutureViewConfig) => this.setState({
    futureViewConfig,
  });

  renderWideScreenFocusViewToggleComponent = (): Node => {
    const { doesShowFocusViewInWideScreen, futureViewConfig } = this.state;
    if (futureViewConfigProvider.isInNDaysView(futureViewConfig)) {
      return null;
    }
    const wrapperStyle = doesShowFocusViewInWideScreen ? { left: '-4em' } : { left: '-1em' };
    const buttonStyle = doesShowFocusViewInWideScreen ? { left: '2em' } : {};
    const iconName = doesShowFocusViewInWideScreen ? 'chevron left' : 'chevron right';
    const iconClass = doesShowFocusViewInWideScreen
      ? styles.FocusViewToggleIconFocusViewShow
      : styles.FocusViewToggleIconFocusViewHide;
    return (
      <div className={styles.FocusViewToggleWrapper} style={wrapperStyle}>
        <div
          role="button"
          tabIndex={-1}
          className={styles.FocusViewToggle}
          style={buttonStyle}
          onClick={this.toggleFocusViewInWideScreen}
          onKeyDown={this.toggleFocusViewInWideScreen}
        >
          <Icon name={iconName} className={iconClass} />
        </div>
      </div>
    );
  };

  renderSmallScreenViewSwitcherComponent = (): Node => {
    if (!this.screenIsSmall()) {
      return null;
    }
    const { doesShowFutureViewInSmallScreen } = this.state;
    return (
      <Icon
        name={doesShowFutureViewInSmallScreen ? 'bookmark' : 'calendar'}
        className={styles.ViewSwitcher}
        onClick={this.switchView}
      />
    );
  };

  render(): Node {
    const { windowSize, fullTasks, inFocusTasks } = this.props;
    const {
      doesShowFocusViewInWideScreen, doesShowFutureViewInSmallScreen, futureViewConfig,
    } = this.state;
    if (!this.screenIsSmall()) {
      const showFocusView = futureViewConfigProvider.isInNDaysView(futureViewConfig)
        || doesShowFocusViewInWideScreen;
      return (
        <div className={styles.TaskView}>
          {showFocusView && (
            <div className={styles.FocusPanel}>
              <h3 className={styles.ControlTitle}>Focus</h3>
              <FocusView tasks={inFocusTasks} />
            </div>
          )}
          <div className={styles.FuturePanel}>
            {this.renderWideScreenFocusViewToggleComponent()}
            <FutureView
              windowSize={windowSize}
              config={futureViewConfig}
              tasks={fullTasks}
              onConfigChange={this.futureViewConfigOnChange}
            />
          </div>
        </div>
      );
    }
    const renderedView = doesShowFutureViewInSmallScreen
      ? (
        <div className={styles.FuturePanel}>
          <FutureView
            windowSize={windowSize}
            config={futureViewConfig}
            tasks={fullTasks}
            onConfigChange={this.futureViewConfigOnChange}
          />
        </div>
      ) : (
        <div className={styles.FocusPanel}>
          <h3 className={styles.ControlTitle}>Focus</h3>
          <FocusView tasks={inFocusTasks} />
        </div>
      );
    return (
      <div className={styles.TaskView}>
        {renderedView}
        {this.renderSmallScreenViewSwitcherComponent()}
      </div>
    );
  }
}

const ConnectedTaskView = windowSizeConnect<Props>(TaskView);
export default ConnectedTaskView;
