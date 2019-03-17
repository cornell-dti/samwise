import React, { ReactElement, ReactNode, useState } from 'react';
import { Icon } from 'semantic-ui-react';
import { useMappedWindowSize } from '../../hooks/window-size-hook';
import Calendar from '../../assets/svgs/dark.svg';
import PinFilled from '../../assets/svgs/pin-2-dark-filled.svg';
import FocusView from './FocusView';
import FutureView, { futureViewConfigProvider, FutureViewConfig } from './FutureView';
import ProgressTracker from './ProgressTracker';
import styles from './TaskView.css';

const FocusPanel = (): ReactElement => <div className={styles.FocusPanel}><FocusView /></div>;

export default function TaskView(): ReactElement {
  const [doesShowFocusViewInWideScreen, setDoesShowFocusViewInWideScreen] = useState(false);
  const [doesShowFutureViewInSmallScreen, setDoesShowFutureViewInSmallScreen] = useState(false);
  const [config, setConfig] = useState<FutureViewConfig>(futureViewConfigProvider.initialValue);

  const screenIsSmall = useMappedWindowSize(size => size.width <= 840);
  const toggleFocusViewInWideScreen = (): void => setDoesShowFocusViewInWideScreen(prev => !prev);
  const switchView = (): void => setDoesShowFutureViewInSmallScreen(prev => !prev);

  const FuturePanel = ({ children }: { readonly children?: ReactNode }): ReactElement => {
    const onChange = (c: FutureViewConfig): void => { setConfig(c); };
    return (
      <div className={styles.FuturePanel}>
        <div className={styles.FuturePanelContainer}>
          {children}
          <FutureView config={config} onConfigChange={onChange} />
        </div>
      </div>
    );
  };
  FuturePanel.defaultProps = { children: null };

  const inNDaysView = futureViewConfigProvider.isInNDaysView(config);
  const showFocusView = inNDaysView || doesShowFocusViewInWideScreen;

  if (screenIsSmall) {
    const taskView = doesShowFutureViewInSmallScreen
      ? (
        <div className={styles.TaskView}>
          <FuturePanel />
          <PinFilled className={styles.ViewSwitcher} onClick={switchView} />
        </div>
      ) : (
        <div className={styles.TaskView}>
          <FocusPanel />
          <Calendar onClick={switchView} className={styles.ViewSwitcher} />
        </div>
      );
    return (
      <>
        {taskView}
        <ProgressTracker inMobileView={false} />
      </>
    );
  }

  const WideScreenFocusViewToggle = (): ReactElement => {
    const wrapperStyle = doesShowFocusViewInWideScreen ? { left: '-4em' } : { left: '0' };
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
    <>
      <div className={styles.TaskView}>
        <ProgressTracker inMobileView={false} />
        {showFocusView && <FocusPanel />}
        {showFocusView && <div style={{ width: '2em' }} />}
        <FuturePanel>
          {!inNDaysView && <WideScreenFocusViewToggle />}
        </FuturePanel>
      </div>
    </>
  );
}
