/* eslint-disable react/jsx-props-no-spreading */
import React, { ReactElement, useState, ReactNode } from 'react';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { connect } from 'react-redux';
import { computeReorderMap } from 'common/util/order-util';
import styles from './index.module.scss';
import ClearFocus from './ClearFocus';
import CompletedSeparator from './CompletedSeparator';
import FocusTask from './FocusTask';
import { applyReorder, completeTaskInFocus } from '../../../firebase/actions';
import { getFocusViewProps, FocusViewTaskMetaData, FocusViewProps } from '../../../store/selectors';

const focusViewNotCompletedDroppableId = 'focus-view-not-completed-droppable';
const focusViewCompletedDroppableId = 'focus-view-completed-droppable';

type IdOrder = { readonly id: string; readonly order: number };

function renderTaskList(list: IdOrder[], filterCompleted: boolean): ReactNode {
  return list.map(({ id }, index) => (
    <FocusTask key={id} id={id} order={index} filterCompleted={filterCompleted} />
  ));
}

/**
 * The focus view component.
 */
function FocusView({ tasks, progress }: FocusViewProps): ReactElement {
  const [doesShowCompletedTasks, setDoesShowCompletedTasks] = useState(true);
  const localCompletedList: IdOrder[] = [];
  const localUncompletedList: IdOrder[] = [];
  tasks.forEach(({ id, order, inFocusView, inCompleteFocusView }: FocusViewTaskMetaData) => {
    if (!inFocusView) {
      return;
    }
    const idOrder = { id, order };
    if (inCompleteFocusView) {
      localCompletedList.push(idOrder);
    } else {
      localUncompletedList.push(idOrder);
    }
  });
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
      (source.droppableId === focusViewCompletedDroppableId &&
        destination.droppableId === focusViewCompletedDroppableId) ||
      (source.droppableId === focusViewNotCompletedDroppableId &&
        destination.droppableId === focusViewNotCompletedDroppableId)
    ) {
      // drag and drop completely with in completed/uncompleted region
      const reorderMap = computeReorderMap(tasks, sourceOrder, destinationOrder);
      applyReorder('tasks', reorderMap);
    } else if (
      source.droppableId === focusViewNotCompletedDroppableId &&
      destination.droppableId === focusViewCompletedDroppableId
    ) {
      // drag from not completed and drop to completed.
      completeTaskInFocus(localUncompletedList[source.index]);
    } else if (
      source.droppableId === focusViewCompletedDroppableId &&
      destination.droppableId === focusViewNotCompletedDroppableId
    ) {
      // drag from completed and drop to not completed.
      // do not support this case because the intuition is currently unclear
    } else {
      throw new Error('Impossible');
    }
  };

  const onDoesShowCompletedTasksChange = (): void => setDoesShowCompletedTasks((prev) => !prev);

  return (
    <div className={styles.FocusView}>
      <div className={styles.ControlBlock}>
        <h3 className={styles.Title}>Focus</h3>
        <span className={styles.Padding} />
        <ClearFocus />
      </div>
      <div className={styles.FocusTaskContainer}>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId={focusViewNotCompletedDroppableId}>
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {renderTaskList(localUncompletedList, false)}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
          <Droppable droppableId={focusViewCompletedDroppableId}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                className={styles.Droppable}
                {...provided.droppableProps}
              >
                <CompletedSeparator
                  count={progress.completedTasksCount}
                  doesShowCompletedTasks={doesShowCompletedTasks}
                  onDoesShowCompletedTasksChange={onDoesShowCompletedTasksChange}
                />
                {doesShowCompletedTasks && renderTaskList(localCompletedList, true)}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
}

const Connected = connect(getFocusViewProps)(FocusView);
export default Connected;
