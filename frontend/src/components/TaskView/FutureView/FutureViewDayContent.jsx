// @flow strict

import React from 'react';
import type { ComponentType, Node } from 'react';
import type { SimpleDate } from './future-view-types';
import type { FloatingPosition } from '../../Util/TaskEditors/editors-types';
import styles from './FutureViewDay.module.css';
import { day2String, getTodayAtZeroAM } from '../../../util/datetime-util';
import FutureViewDayTaskContainer from './FutureViewDayTaskContainer';

type Props = {|
  +date: SimpleDate;
  +inNDaysView: boolean;
  +taskEditorPosition: FloatingPosition;
  +doesShowCompletedTasks: boolean;
  +date: SimpleDate;
  +inMainList: boolean;
  +onHeightChange: (doesOverflow: boolean, tasksHeight: number) => void;
|};

/**
 * The main content of future view day.
 */
function FutureViewDayContent(
  {
    date,
    inNDaysView,
    taskEditorPosition,
    doesShowCompletedTasks,
    inMainList,
    onHeightChange,
  }: Props,
): Node {
  const dateNumCssClass = inNDaysView
    ? styles.DateNumNDaysView
    : styles.DateNumOtherViews;
  const containerStyle = (inNDaysView && inMainList) ? { paddingTop: '1em' } : {};
  const isToday: boolean = getTodayAtZeroAM().toDateString() === date.text;
  return (
    <>
      <div className={styles.DateInfo} style={containerStyle}>
        {inNDaysView && (
          <div className={styles.DateInfoDay}>
            {isToday ? 'TODAY' : day2String(date.day)}
          </div>
        )}
        <div className={dateNumCssClass}>{date.date}</div>
      </div>
      <FutureViewDayTaskContainer
        date={date.text}
        inNDaysView={inNDaysView}
        taskEditorPosition={taskEditorPosition}
        doesShowCompletedTasks={doesShowCompletedTasks}
        isInMainList={inMainList}
        onHeightChange={onHeightChange}
      />
    </>
  );
}

const Memoized: ComponentType<Props> = React.memo(FutureViewDayContent);
export default Memoized;
