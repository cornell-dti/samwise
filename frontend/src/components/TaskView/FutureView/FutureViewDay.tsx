import React, { ReactElement } from 'react';
import { connect } from 'react-redux';
import { getTodayAtZeroAM } from 'common/lib/util/datetime-util';
import { State, Theme } from 'common/lib/types/store-types';
import { SimpleDate } from './future-view-types';
import { CalendarPosition, FloatingPosition } from '../../Util/TaskEditors/editors-types';
import styles from './FutureViewDay.module.scss';
import FutureViewDayContent from './FutureViewDayContent';

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
  const [heightInfo, setHeightInfo] = React.useState<HeightInfo>(dummyHeightInfo);
  const componentDivRef = React.useRef<HTMLDivElement>(null);

  const onHeightChange = (doesOverflow: boolean, tasksHeight: number): void => {
    if (heightInfo.tasksHeight !== tasksHeight) {
      setHeightInfo({ doesOverflow, tasksHeight });
    }
  };

  const isToday: boolean = getTodayAtZeroAM().toDateString() === date.text;
  const darkModeStyles = (() => {
    if (theme !== 'dark') {
      return undefined;
    }
    return isToday
      ? {
          background: 'black',
          color: 'white',
        }
      : {
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
  return (
    <div
      className={wrapperCssClass}
      ref={componentDivRef}
      style={{ ...darkModeStyles, overflowY: 'scroll' }}
    >
      <FutureViewDayContent
        inMainList
        onHeightChange={onHeightChange}
        date={date}
        inNDaysView={inNDaysView}
        taskEditorPosition={taskEditorPosition}
        calendarPosition={calendarPosition}
        doesShowCompletedTasks={doesShowCompletedTasks}
        theme={theme}
      />
    </div>
  );
}

const Connected = connect(({ settings: { theme } }: State): { readonly theme: Theme } => ({
  theme,
}))(FutureViewDay);
export default Connected;
