import React, { ReactElement } from 'react';
import { SimpleDate } from './future-view-types';
import { CalendarPosition, FloatingPosition } from '../../Util/TaskEditors/editors-types';
import styles from './FutureViewDay.module.scss';
import { day2String, getTodayAtZeroAM } from '../../../util/datetime-util';
import FutureViewDayTaskContainer from './FutureViewDayTaskContainer';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { applyReorder, completeTaskInFocus } from '../../../firebase/actions';
import { computeReorderMap } from 'util/order-util';

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
  const localCompletedList: IdOrder[] = [];
  const localUncompletedList: IdOrder[] = [];
  const focusViewNotCompletedDroppableId = 'focus-view-not-completed-droppable';
  const focusViewCompletedDroppableId = 'focus-view-completed-droppable';
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
    if (source.droppableId === focusViewCompletedDroppableId) {
      sourceOrder = localCompletedList[source.index].order;
    } else if (source.droppableId === focusViewNotCompletedDroppableId) {
      sourceOrder = localUncompletedList[source.index].order;
    } else {
      return;
    }
    if (destination.droppableId === focusViewCompletedDroppableId) {
      const dest = localCompletedList[destination.index];
      destinationOrder = dest == null ? sourceOrder : dest.order;
    } else if (destination.droppableId === focusViewNotCompletedDroppableId) {
      const dest = localUncompletedList[destination.index];
      destinationOrder = dest == null ? sourceOrder : dest.order;
    } else {  
      return;
    }

    if (
      (source.droppableId === focusViewCompletedDroppableId
        && destination.droppableId === focusViewCompletedDroppableId)
      || (source.droppableId === focusViewNotCompletedDroppableId
        && destination.droppableId === focusViewNotCompletedDroppableId)
    ) {
      // drag and drop completely with in completed/uncompleted region
      // TODO
    } else if (
      source.droppableId === focusViewNotCompletedDroppableId
      && destination.droppableId === focusViewCompletedDroppableId
    ) {
      // drag from not completed and drop to completed.
      const completedTaskIdOrder: IdOrder = localUncompletedList[source.index];
      // TODO

    } else if (
      source.droppableId === focusViewCompletedDroppableId
      && destination.droppableId === focusViewNotCompletedDroppableId
    ) {
      // drag from completed and drop to not completed.
      // do not support this case because the intuition is currently unclear
    } else {
      throw new Error('Impossible');
    }
  };
  const onDragStart = (): void => {
    
  };
  return (
    <>
    <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
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
