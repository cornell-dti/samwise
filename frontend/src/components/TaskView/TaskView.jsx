// @flow strict

import React from 'react';
import type { Node } from 'react';
import { Icon } from 'semantic-ui-react';
import FocusView from './FocusView';
import FutureView, { futureViewConfigProvider } from './FutureView';
import styles from './TaskView.css';
import { useMappedWindowSize } from '../../hooks/window-size-hook';

const FocusPanel = (): Node => <div className={styles.FocusPanel}><FocusView /></div>;

export default function TaskView(): Node {
  const [
    doesShowFocusViewInWideScreen, setDoesShowFocusViewInWideScreen,
  ] = React.useState(false);
  const [
    doesShowFutureViewInSmallScreen, setDoesShowFutureViewInSmallScreen,
  ] = React.useState(false);
  const [config, setConfig] = React.useState(futureViewConfigProvider.initialValue);

  const screenIsSmall = useMappedWindowSize(size => size.width <= 768);
  const toggleFocusViewInWideScreen = () => setDoesShowFocusViewInWideScreen(prev => !prev);
  const switchView = () => setDoesShowFutureViewInSmallScreen(prev => !prev);

  const FuturePanel = ({ children }: {| +children?: Node; |}): Node => {
    const onChange = (c) => { setConfig(c); };
    return (
      <div className={styles.FuturePanel}>
        {children}
        <FutureView config={config} onConfigChange={onChange} />
      </div>
    );
  };
  FuturePanel.defaultProps = { children: null };

  if (screenIsSmall) {
    return (
      <div className={styles.TaskView}>
        {doesShowFutureViewInSmallScreen ? <FuturePanel /> : <FocusPanel />}
        <Icon
          name={doesShowFutureViewInSmallScreen ? 'bookmark' : 'calendar'}
          className={styles.ViewSwitcher}
          onClick={switchView}
        />
      </div>
    );
  }
  const inNDaysView = futureViewConfigProvider.isInNDaysView(config);
  const showFocusView = inNDaysView || doesShowFocusViewInWideScreen;

  const WideScreenFocusViewToggle = (): Node => {
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
  return (
    <div className={styles.TaskView}>
      {showFocusView && <FocusPanel />}
      <FuturePanel>
        {inNDaysView && <WideScreenFocusViewToggle />}
      </FuturePanel>
    </div>
  );
}
