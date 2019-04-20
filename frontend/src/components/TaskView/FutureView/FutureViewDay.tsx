import React, { ReactElement } from 'react';
import { SimpleDate } from './future-view-types';
import { CalendarPosition, FloatingPosition } from '../../Util/TaskEditors/editors-types';
import styles from './FutureViewDay.module.scss';
import { floatingViewWidth, headerHeight } from './future-view-css-props';
import { getTodayAtZeroAM } from '../../../util/datetime-util';
import { error } from '../../../util/general-util';
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
    tasksHeight, inNDaysView, windowSize,
    mainViewPosition: {
      width, height, top, left,
    },
  } = props;
  // Compute the height of inner content
  const totalHeight = headerHeight + tasksHeight;
  // Decide the maximum allowed height and the actual height
  const maxAllowedHeight = inNDaysView ? 400 : 300;
  const floatingViewHeight = Math.min(totalHeight, maxAllowedHeight);
  // Compute ideal offset
  let topOffset = (height - floatingViewHeight) / 2;
  let leftOffset = (width - floatingViewWidth) / 2;
  // Correct the offsets if they overflow.
  {
    const windowWidth = windowSize.width;
    const windowHeight = windowSize.height;
    const topAbsolutePosition = top + topOffset;
    if (topAbsolutePosition < 0) {
      topOffset -= topAbsolutePosition;
    } else {
      const bottomAbsolutePosition = topAbsolutePosition + floatingViewHeight;
      const diff = bottomAbsolutePosition - windowHeight;
      if (diff > 0) {
        topOffset -= diff;
      }
    }
    const leftAbsolutePosition = left + leftOffset;
    if (leftAbsolutePosition < 0) {
      leftOffset -= leftAbsolutePosition;
    } else {
      const rightAbsolutePosition = leftAbsolutePosition + floatingViewWidth;
      const diff = rightAbsolutePosition - windowWidth;
      if (diff > 0) {
        leftOffset -= diff;
      }
    }
  }
  return {
    width: `${floatingViewWidth}px`,
    height: `${floatingViewHeight}px`,
    top: `${topOffset}px`,
    left: `${leftOffset}px`,
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
export default function FutureViewDay(props: Props): ReactElement {
  const { date, inNDaysView } = props;
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
  let wrapperCssClass: string;
  if (inNDaysView) {
    wrapperCssClass = isToday ? `${styles.NDaysView} ${styles.Today}` : styles.NDaysView;
  } else {
    wrapperCssClass = isToday ? `${styles.OtherViews} ${styles.Today}` : styles.OtherViews;
  }
  if (!floatingViewOpened) {
    return (
      <div className={wrapperCssClass} ref={componentDivRef}>
        <FutureViewDayContent
          inMainList
          onHeightChange={onHeightChange}
          {...props}
        />
        {heightInfo.doesOverflow && (
          <button type="button" className={styles.MoreTasksBar} onClick={openFloatingView}>
            More Tasks...
          </button>
        )}
      </div>
    );
  }
  const computeFloatingViewPosition = (): PositionStyle => {
    const componentDiv = componentDivRef.current || error();
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
    <div className={wrapperCssClass} ref={componentDivRef}>
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
          {...props}
        />
      </div>
    </div>
  );
}
