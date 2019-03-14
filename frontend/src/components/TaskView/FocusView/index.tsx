import React, { ReactElement, useState } from 'react';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { connect } from 'react-redux';
import styles from './FocusView.css';
import ClearFocus from './ClearFocus';
import CompletedSeparator from './CompletedSeparator';
import FocusTask from './FocusTask';
import { reorder } from '../../../firebase/actions';
import { getFocusViewProps, FocusViewProps } from '../../../store/selectors';

const focusViewNotCompletedDroppableId = 'focus-view-not-completed-droppable';
const focusViewCompletedDroppableId = 'focus-view-completed-droppable';

const tasksRenderer = ({ id }: { readonly id: string }, index: number): ReactElement => (
  <FocusTask key={id} id={id} order={index} />
);

type IdOrder = { readonly id: string; readonly order: number };

/**
 * The focus view component.
 */
function FocusView(
  { focusedCompletedIdOrderList, focusedUncompletedIdOrderList, progress }: FocusViewProps,
): ReactElement {
  const [localList, setLocalList] = useState<IdOrder[]>(focusedUncompletedIdOrderList);
  const [doesShowCompletedTasks, setDoesShowCompletedTasks] = useState(false);
  if (localList !== focusedUncompletedIdOrderList) {
    setLocalList(focusedUncompletedIdOrderList);
  }
  const onDragEnd = (result: DropResult): void => {
    const { source, destination } = result;
    if (destination == null || destination.droppableId !== focusViewNotCompletedDroppableId) {
      // drop outside of the list
      return;
    }
    if (source.index === destination.index) {
      // drop at the same place.
      return;
    }
    const sourceOrder = localList[source.index].order;
    const destinationOrder = localList[destination.index].order;
    const newList = reorder('tasks', localList, sourceOrder, destinationOrder);
    setLocalList(newList);
  };

  const onDoesShowCompletedTasksChange = (): void => setDoesShowCompletedTasks(prev => !prev);

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
            {provided => (
              <div
                ref={provided.innerRef}
                className={focusedCompletedIdOrderList.length === 0 ? styles.Droppable : undefined}
                {...provided.droppableProps}
              >
                {localList.map(tasksRenderer)}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
          {focusedCompletedIdOrderList.length > 0 && (
            <Droppable droppableId={focusViewCompletedDroppableId}>
              {provided => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  <CompletedSeparator
                    count={progress.completedTasksCount}
                    doesShowCompletedTasks={doesShowCompletedTasks}
                    onDoesShowCompletedTasksChange={onDoesShowCompletedTasksChange}
                  />
                  {doesShowCompletedTasks && focusedCompletedIdOrderList.map(tasksRenderer)}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          )}
        </DragDropContext>
      </div>
    </div>
  );
}

const Connected = connect(getFocusViewProps)(FocusView);
export default Connected;
