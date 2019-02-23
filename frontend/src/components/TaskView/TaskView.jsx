// @flow strict

import React from 'react';
import type { ComponentType, Node } from 'react';
import { Icon } from 'semantic-ui-react';
import Calendar from '../../assets/svgs/dark.svg';
import PinFilled from '../../assets/svgs/pin-2-light-filled.svg';
import FocusView from './FocusView/FocusView';
import FutureView, { futureViewConfigProvider } from './FutureView/FutureView';
import styles from './TaskView.css';
import windowSizeConnect from '../Util/Responsive/WindowSizeConsumer';
import type { WindowSize } from '../Util/Responsive/window-size-context';
import type { Task } from '../../store/store-types';
import SquareTextButton from '../UI/SquareTextButton';
import { clearFocus } from '../../firebase/actions';

type OwnProps = {| +fullTasks: Task[]; +inFocusTasks: Task[]; |};
type Props = {| ...OwnProps; +windowSize: WindowSize; |};

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
      ? (
        <PinFilled
          className={styles.ViewSwitcher}
          onClick={switchView}
        />
      )
      : (
        <Calendar
          onClick={switchView}
          className={styles.ViewSwitcher}
        />
      )
    );
  };

  const FocusPanel = (): Node => (
    <div className={styles.FocusPanel}>
      <FocusView tasks={inFocusTasks} />
    </div>
  );

  const FuturePanel = ({ children }: {| +children?: Node |}): Node => (
    <div className={styles.FuturePanel}>
      {children}
      <FutureView
        windowSize={windowSize}
        config={futureViewConfig}
        tasks={fullTasks}
        onConfigChange={onConfigChange}
      />
    </div>
  );
  FuturePanel.defaultProps = { children: null };

  if (screenIsSmall) {
    return (
      <div className={styles.TaskView}>
        {doesShowFutureViewInSmallScreen ? <FuturePanel /> : <FocusPanel />}
        {renderSmallScreenViewSwitcherComponent()}
      </div>
    );
  }
  const showFocusView = futureViewConfigProvider.isInNDaysView(futureViewConfig)
    || doesShowFocusViewInWideScreen;
  return (
    <div className={styles.TaskView}>
      {showFocusView && <FocusPanel inFocusTasks={inFocusTasks} />}
      <FuturePanel>
        {renderWideScreenFocusViewToggleComponent()}
      </FuturePanel>
    </div>
  );
}

const ConnectedTaskView: ComponentType<OwnProps> = windowSizeConnect(TaskView);
export default ConnectedTaskView;
