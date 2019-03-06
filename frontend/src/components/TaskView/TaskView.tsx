import React, { ReactElement, ReactNode } from 'react';
import { Icon } from 'semantic-ui-react';
import Calendar from '../../assets/svgs/dark.svg';
import PinFilled from '../../assets/svgs/pin-2-light-filled.svg';
import FocusView from './FocusView';
import FutureView, { futureViewConfigProvider, FutureViewConfig } from './FutureView';
import styles from './TaskView.css';
import { useMappedWindowSize } from '../../hooks/window-size-hook';

const FocusPanel = (): ReactElement => <div className={styles.FocusPanel}><FocusView /></div>;

export default function TaskView(): ReactElement {
  const [
    doesShowFocusViewInWideScreen, setDoesShowFocusViewInWideScreen,
  ] = React.useState(false);
  const [
    doesShowFutureViewInSmallScreen, setDoesShowFutureViewInSmallScreen,
  ] = React.useState(false);
  const [config, setConfig] = React.useState<FutureViewConfig>(
    futureViewConfigProvider.initialValue,
  );

  const screenIsSmall = useMappedWindowSize(size => size.width <= 768);
  const toggleFocusViewInWideScreen = () => setDoesShowFocusViewInWideScreen(prev => !prev);
  const switchView = () => setDoesShowFutureViewInSmallScreen(prev => !prev);

  const FuturePanel = ({ children }: { readonly children?: ReactNode }): ReactElement => {
    const onChange = (c: FutureViewConfig) => { setConfig(c); };
    return (
      <div className={styles.FuturePanel}>
        {children}
        <FutureView config={config} onConfigChange={onChange} />
      </div>
    );
  };
  FuturePanel.defaultProps = { children: null };

  if (screenIsSmall) {
    return doesShowFutureViewInSmallScreen
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
  }
  const inNDaysView = futureViewConfigProvider.isInNDaysView(config);
  const showFocusView = inNDaysView || doesShowFocusViewInWideScreen;

  const WideScreenFocusViewToggle = (): ReactElement => {
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
        {!inNDaysView && <WideScreenFocusViewToggle />}
      </FuturePanel>
    </div>
  );
}
