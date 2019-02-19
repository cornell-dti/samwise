// @flow strict

import React from 'react';
import type { Node } from 'react';
import { Icon } from 'semantic-ui-react';
import Calendar from '../../assets/svgs/dark.svg';
import FocusView from './FocusView/FocusView';
import FutureView, { futureViewConfigProvider } from './FutureView/FutureView';
import styles from './TaskView.css';
import windowSizeConnect from '../Util/Responsive/WindowSizeConsumer';
import type { WindowSize } from '../Util/Responsive/window-size-context';
import type { Task } from '../../store/store-types';

type Props = {|
  +windowSize: WindowSize;
  +fullTasks: Task[];
  +inFocusTasks: Task[];
|};

function TaskView({ windowSize, fullTasks, inFocusTasks }: Props): Node {
  const [
    doesShowFocusViewInWideScreen, setDoesShowFocusViewInWideScreen,
  ] = React.useState(false);
  const [
    doesShowFutureViewInSmallScreen, setDoesShowFutureViewInSmallScreen,
  ] = React.useState(false);
  const [
    futureViewConfig, setFutureViewConfig,
  ] = React.useState(futureViewConfigProvider.initialValue);

  const screenIsSmall = windowSize.width <= 768;
  const toggleFocusViewInWideScreen = () => setDoesShowFocusViewInWideScreen(prev => !prev);
  const switchView = () => setDoesShowFutureViewInSmallScreen(prev => !prev);
  const onConfigChange = (config) => { setFutureViewConfig(config); };

  const renderWideScreenFocusViewToggleComponent = (): Node => {
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
          onClick={toggleFocusViewInWideScreen}
          onKeyDown={toggleFocusViewInWideScreen}
        >
          <Icon name={iconName} className={iconClass} />
        </div>
      </div>
    );
  };

  const renderSmallScreenViewSwitcherComponent = (): Node => {
    if (!screenIsSmall) {
      return null;
    }
    return (doesShowFutureViewInSmallScreen
        ?
        (<Icon
          name="bookmark"
          className={styles.ViewSwitcher}
          onClick={switchView}
        />) : <button onClick={switchView}>
                <img
                  src={Calendar}
                  alt=""
                  className={styles.ViewSwitcher}
              />
            </button>
    );
  };

  if (!screenIsSmall) {
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
          {renderWideScreenFocusViewToggleComponent()}
          <FutureView
            windowSize={windowSize}
            config={futureViewConfig}
            tasks={fullTasks}
            onConfigChange={onConfigChange}
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
          onConfigChange={onConfigChange}
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
      {renderSmallScreenViewSwitcherComponent()}
    </div>
  );
}

const ConnectedTaskView = windowSizeConnect<Props>(TaskView);
export default ConnectedTaskView;
