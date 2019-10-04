import React, { ReactElement, ReactNode, useState } from 'react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { useMappedWindowSize } from '../../hooks/window-size-hook';
import FocusView from './FocusView';
import FutureView, { futureViewConfigProvider, FutureViewConfig } from './FutureView';
import ProgressTracker from './ProgressTracker';
import styles from './index.module.css';
import SamwiseIcon from '../UI/SamwiseIcon';

const FocusPanel = (): ReactElement => <div className={styles.FocusPanel}><FocusView /></div>;

const classNames = (...names: readonly string[]): string => names.join(' ');

type Props = { readonly className: string };

export default function TaskView({ className }: Props): ReactElement {
  const [doesShowFocusViewInWideScreen, setDoesShowFocusViewInWideScreen] = useState(true);
  const [doesShowFutureViewInSmallScreen, setDoesShowFutureViewInSmallScreen] = useState(false);
  const [config, setConfig] = useState<FutureViewConfig>(futureViewConfigProvider.initialValue);

  const screenIsSmall = useMappedWindowSize((size) => size.width <= 840);
  const toggleFocusViewInWideScreen = (): void => setDoesShowFocusViewInWideScreen((prev) => !prev);
  const switchView = (): void => setDoesShowFutureViewInSmallScreen((prev) => !prev);

  const FuturePanel = ({ children }: { readonly children?: ReactNode }): ReactElement => {
    const onChange = (c: FutureViewConfig): void => { setConfig(c); };
    return (
      <div className={classNames(className, styles.FuturePanel)}>
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
        <div className={classNames(className, styles.TaskView)}>
          <FuturePanel />
          <SamwiseIcon
            iconName="pin-dark-filled"
            className={styles.ViewSwitcher}
            onClick={switchView}
          />
        </div>
      ) : (
        <div className={classNames(className, styles.TaskView)}>
          <FocusPanel />
          <SamwiseIcon
            iconName="calendar-dark"
            className={styles.ViewSwitcher}
            onClick={switchView}
          />
        </div>
      );
    return (
      <>
        {taskView}
        <ProgressTracker inMobileView />
      </>
    );
  }

  const WideScreenFocusViewToggle = (): ReactElement => {
    const wrapperStyle = doesShowFocusViewInWideScreen ? { left: '-4em' } : { left: '0' };
    const buttonStyle = doesShowFocusViewInWideScreen ? { left: '2em' } : {};
    const iconName = doesShowFocusViewInWideScreen ? faChevronLeft : faChevronRight;
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
          <Icon icon={iconName} className={iconClass} />
        </div>
      </div>
    );
  };

  return (
    <>
      <div className={classNames(className, styles.TaskView)}>
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
