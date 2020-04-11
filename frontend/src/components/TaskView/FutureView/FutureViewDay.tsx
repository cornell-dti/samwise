import React, { ReactElement } from 'react';
import { connect } from 'react-redux';
import { getTodayAtZeroAM } from 'common/lib/util/datetime-util';
import { error } from 'common/lib/util/general-util';
import { State, Theme } from 'common/lib/types/store-types';
import { SimpleDate } from './future-view-types';
import { CalendarPosition, FloatingPosition } from '../../Util/TaskEditors/editors-types';
import styles from './FutureViewDay.module.scss';
import { headerHeight } from './future-view-css-props';
import { useWindowSize, WindowSize } from '../../../hooks/window-size-hook';
import FutureViewDayContent from './FutureViewDayContent';

type Position = {
  readonly width: number;
  readonly height: number;
  readonly top: number;
  readonly left: number;
};
type PositionStyle = {
  readonly width: string;
  readonly height: string;
  readonly top: string;
  readonly left: string;
};
type PropsForPositionComputation = {
  readonly tasksHeight: number;
  readonly inNDaysView: boolean;
  readonly windowSize: WindowSize;
  readonly mainViewPosition: Position;
};

/**
 * Returns the computed floating view style from some properties.
 *
 * @return the computed style.
 */
const computeFloatingViewStyle = (props: PropsForPositionComputation): PositionStyle => {
  const {
    tasksHeight,
    mainViewPosition: { width },
  } = props;
  // Compute the total height of inner content: the task container for a given day.
  const totalHeight = headerHeight + tasksHeight;

  return {
    width: `${width}px`,
    height: `${totalHeight}px`,
    top: '0',
    left: '0',
  };
};

type Props = {
  readonly date: SimpleDate;
  readonly inNDaysView: boolean;
  readonly taskEditorPosition: FloatingPosition;
  readonly calendarPosition: CalendarPosition;
  readonly doesShowCompletedTasks: boolean;
};

type HeightInfo = { readonly doesOverflow: boolean; readonly tasksHeight: number };
const dummyHeightInfo: HeightInfo = { doesOverflow: false, tasksHeight: 0 };

/**
 * The component that renders all tasks on a certain day.
 */
export function FutureViewDay(props: Props & { readonly theme: Theme }): ReactElement {
  const {
    theme,
    date,
    inNDaysView,
    taskEditorPosition,
    calendarPosition,
    doesShowCompletedTasks,
  } = props;
  const [floatingViewOpened, setFloatingViewOpened] = React.useState(false);
  const [heightInfo, setHeightInfo] = React.useState<HeightInfo>(dummyHeightInfo);
  const windowSize = useWindowSize();
  const componentDivRef = React.useRef<HTMLDivElement>(null);

  const onHeightChange = (doesOverflow: boolean, tasksHeight: number): void => {
    if (heightInfo.tasksHeight !== tasksHeight) {
      setHeightInfo({ doesOverflow, tasksHeight });
    }
  };

  const openFloatingView = (): void => setFloatingViewOpened(true);
  const closeFloatingView = (): void => setFloatingViewOpened(false);

  const isToday: boolean = getTodayAtZeroAM().toDateString() === date.text;
  const darkModeStyles = (() => {
    if (theme !== 'dark') {
      return undefined;
    }
    return isToday ? {
      background: 'black',
      color: 'white',
    } : {
      background: 'rgb(33,33,33)',
      color: 'white',
    };
  })();
  let wrapperCssClass: string;
  if (inNDaysView) {
    wrapperCssClass = isToday ? `${styles.NDaysView} ${styles.Today}` : styles.NDaysView;
  } else {
    wrapperCssClass = isToday ? `${styles.OtherViews} ${styles.Today}` : styles.OtherViews;
  }
  if (!floatingViewOpened) {
    return (
      <div className={wrapperCssClass} ref={componentDivRef} style={darkModeStyles}>
        <FutureViewDayContent
          inMainList
          onHeightChange={onHeightChange}
          date={date}
          inNDaysView={inNDaysView}
          taskEditorPosition={taskEditorPosition}
          calendarPosition={calendarPosition}
          doesShowCompletedTasks={doesShowCompletedTasks}
          theme={theme}
          containerHeight={headerHeight}
        />
        {heightInfo.doesOverflow && (
          <button type="button" className={styles.MoreTasksBar} onClick={openFloatingView} tabIndex={0}>
            More Tasks...
          </button>
        )}
      </div>
    );
  }
  const computeFloatingViewPosition = (): PositionStyle => {
    const componentDiv = componentDivRef.current ?? error();
    const boundingRect = componentDiv.getBoundingClientRect();
    if (!(boundingRect instanceof DOMRect)) {
      throw new Error('Bad boundingRect!');
    }
    const {
      width, height, top, left,
    } = boundingRect;
    const mainViewPosition = {
      width, height, top, left,
    };
    const { tasksHeight } = heightInfo;
    return computeFloatingViewStyle({
      tasksHeight, inNDaysView, mainViewPosition, windowSize,
    });
  };
  return (
    <div className={wrapperCssClass} ref={componentDivRef} style={darkModeStyles}>
      <div className={styles.FloatingViewPrevPadding} />
      <div
        role="presentation"
        className={styles.FloatingBackgroundBlocker}
        onClick={closeFloatingView}
      />
      <div className={styles.FloatingView} style={computeFloatingViewPosition()}>
        <FutureViewDayContent
          inMainList={false}
          onHeightChange={onHeightChange}
          date={date}
          inNDaysView={inNDaysView}
          taskEditorPosition={taskEditorPosition}
          calendarPosition={calendarPosition}
          doesShowCompletedTasks={doesShowCompletedTasks}
          theme={theme}
          containerHeight={heightInfo.tasksHeight + headerHeight}
        />
      </div>
    </div>
  );
}

const Connected = connect(
  ({ settings: { theme } }: State): { readonly theme: Theme } => ({ theme }),
)(FutureViewDay);
export default Connected;
