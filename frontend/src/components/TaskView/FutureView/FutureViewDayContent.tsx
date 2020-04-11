import React, { ReactElement } from 'react';
import { day2String, getTodayAtZeroAM } from 'common/lib/util/datetime-util';
import { Theme } from 'common/lib/types/store-types';
import { Droppable } from 'react-beautiful-dnd';
import { SimpleDate } from './future-view-types';
import { CalendarPosition, FloatingPosition } from '../../Util/TaskEditors/editors-types';
import styles from './FutureViewDay.module.scss';
import FutureViewDayTaskContainer from './FutureViewDayTaskContainer';

type Props = {
  readonly date: SimpleDate;
  readonly inNDaysView: boolean;
  readonly taskEditorPosition: FloatingPosition;
  readonly calendarPosition: CalendarPosition;
  readonly doesShowCompletedTasks: boolean;
  readonly inMainList: boolean;
  readonly onHeightChange: (doesOverflow: boolean, tasksHeight: number) => void;
  readonly theme: Theme;
  readonly containerHeight: number;
};

/**
 * The main content of future view day.
 */
function FutureViewDayContent(
  {
    date,
    inNDaysView,
    taskEditorPosition,
    calendarPosition,
    doesShowCompletedTasks,
    inMainList,
    onHeightChange,
    theme,
    containerHeight,
  }: Props,
): ReactElement {
  const containerStyle = (() => {
    const style = theme === 'dark' ? { color: 'white', opacity: 0.8 } : {};
    return (inNDaysView && inMainList) ? { paddingTop: '1em', ...style } : style;
  })();
  const isToday: boolean = getTodayAtZeroAM().toDateString() === date.text;
  return (
    <>
      <div className={styles.DateInfo} style={containerStyle}>
        <div className={styles.DateInfoDay}>
          {isToday ? 'TODAY' : day2String(date.day)}
        </div>
        <div className={styles.DateNum}>{date.date}</div>
      </div>
      <Droppable droppableId={date.text}>
        {(provided) => (
          // eslint-disable-next-line react/jsx-props-no-spreading
          <div ref={provided.innerRef} {...provided.droppableProps}>
            <FutureViewDayTaskContainer
              date={date.text}
              inNDaysView={inNDaysView}
              taskEditorPosition={taskEditorPosition}
              calendarPosition={calendarPosition}
              doesShowCompletedTasks={doesShowCompletedTasks}
              isInMainList={inMainList}
              onHeightChange={onHeightChange}
              containerHeight={containerHeight}
            />
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </>
  );
}

const Memoized = React.memo(FutureViewDayContent);
export default Memoized;
