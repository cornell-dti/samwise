import React, { ReactElement } from 'react';
import { SimpleDate } from './future-view-types';
import { CalendarPosition, FloatingPosition } from '../../Util/TaskEditors/editors-types';
import styles from './FutureViewDay.module.scss';
import { day2String, getTodayAtZeroAM } from '../../../util/datetime-util';
import FutureViewDayTaskContainer from './FutureViewDayTaskContainer';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { computeReorderMap, getReorderedList } from 'util/order-util';
import { applyReorder } from 'firebase/actions';

type Props = {
  readonly date: SimpleDate;
  readonly inNDaysView: boolean;
  readonly taskEditorPosition: FloatingPosition;
  readonly calendarPosition: CalendarPosition;
  readonly doesShowCompletedTasks: boolean;
  readonly inMainList: boolean;
  readonly onHeightChange: (doesOverflow: boolean, tasksHeight: number) => void;
};

type IdOrder = { readonly id: string; readonly order: number };

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
  }: Props,
): ReactElement {  
  const containerStyle = (inNDaysView && inMainList) ? { paddingTop: '1em' } : {};
  const isToday: boolean = getTodayAtZeroAM().toDateString() === date.text;
  
  const onDragEnd = (result: DropResult): void => {
    const { source, destination } = result;
    if (destination == null) {
      // invalid drop, skip
      return;
    }
    let sourceOrder: number;
    let destinationOrder: number;
    
    sourceOrder = source.index;
    const dest = destination.index;
    destinationOrder = dest == null ? sourceOrder : 0;

    // const reorderMap = computeReorderMap(localTasks, sourceOrder, destinationOrder);
    // setLocalTasks(getReorderedList(localTasks, reorderMap));
    // applyReorder('tasks', reorderMap);
  };
  return (
    <>
    <DragDropContext onDragEnd={onDragEnd}>
      <div className={styles.DateInfo} style={containerStyle}>
        <div className={styles.DateInfoDay}>
          {isToday ? 'TODAY' : day2String(date.day)}
        </div>
        <div className={styles.DateNum}>{date.date}</div>
      </div>
      <Droppable droppableId={date.date.toString()}>
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps} {...provided.droppableProps}>
            <FutureViewDayTaskContainer
              date={date.text}
              inNDaysView={inNDaysView}
              taskEditorPosition={taskEditorPosition}
              calendarPosition={calendarPosition}
              doesShowCompletedTasks={doesShowCompletedTasks}
              isInMainList={inMainList}
              onHeightChange={onHeightChange}
            />
          </div>
        )}
      </Droppable>
    </DragDropContext>
    </>
  );
}

const Memoized = React.memo(FutureViewDayContent);
export default Memoized;
