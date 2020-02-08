import React, { ReactElement } from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import FutureViewDay from './FutureViewDay';
import styles from './FutureViewNDays.module.css';
import { SimpleDate } from './future-view-types';
import { applyReorder, editMainTask } from '../../../firebase/actions';
import { computeReorderMap } from 'common/lib/util/order-util';
import {connect} from "react-redux";
import {State} from "common/lib/types/store-types";
import {createGetIdOrderListByDate, createGetIdOrderListForDays} from "../../../store/selectors";

type IdOrder = { readonly id: string; readonly order: number };

type Props = {
  readonly days: readonly SimpleDate[];
  readonly doesShowCompletedTasks: boolean;
  readonly idOrderList: IdOrder[][];
};

type OwnProps = {
  days: SimpleDate[];
}

/**
 * The component used to contain all the backlog days in n-days mode.
 */
function FutureViewNDays(
  { days, doesShowCompletedTasks, idOrderList }: Props,
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
    }
    console.log(idOrderList);
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

const Connected = connect(
  (state: State, { days }: OwnProps) => createGetIdOrderListForDays(days)(state),
)(FutureViewNDays);
export default Connected;
