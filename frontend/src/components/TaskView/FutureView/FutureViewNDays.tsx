import React, { ReactElement } from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import FutureViewDay from './FutureViewDay';
import styles from './FutureViewNDays.module.css';
import { SimpleDate } from './future-view-types';
import { editMainTask } from '../../../firebase/actions';

type Props = {
  readonly days: readonly SimpleDate[];
  readonly doesShowCompletedTasks: boolean;
};

/**
 * The component used to contain all the backlog days in n-days mode.
 */
export default function FutureViewNDays(
  { days, doesShowCompletedTasks }: Props,
): ReactElement {
  const nDays = days.length;
  const containerStyle = { gridTemplateColumns: `repeat(${nDays}, minmax(0, 1fr))` };

  const onDragEnd = (result: DropResult): void => {
    const { source, destination, draggableId } = result;
    if (destination == null) {
      // invalid drop, skip
      return;
    }
    // dragging to a different day
    if (source.droppableId !== destination.droppableId) {
      editMainTask(
        draggableId,
        null,
        { date: new Date(destination.droppableId) },
      );
    } else {

    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className={styles.FutureViewNDays} style={containerStyle}>
        {days.map((date: SimpleDate, index: number) => {
          const taskEditorPosition = index < (nDays / 2) ? 'right' : 'left';
          return (
            <div key={date.text} className={styles.Column}>
              <FutureViewDay
                inNDaysView
                calendarPosition="bottom"
                taskEditorPosition={taskEditorPosition}
                doesShowCompletedTasks={doesShowCompletedTasks}
                date={date}
              />
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
