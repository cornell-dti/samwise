import React, { ReactElement, useState, ReactNode } from 'react';
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

type IdOrder = { readonly id: string; readonly order: number };

const renderTaskList = (
  list: IdOrder[], filterCompleted: boolean,
): ReactNode => list.map(({ id }, index) => (
  <FocusTask key={id} id={id} order={index} filterCompleted={filterCompleted} />
));

type LocalLists = {
  readonly localUncompletedList: IdOrder[];
  readonly localCompletedList: IdOrder[];
};

/**
 * The focus view component.
 */
function FocusView(
  { focusedCompletedIdOrderList, focusedUncompletedIdOrderList, progress }: FocusViewProps,
): ReactElement {
  const [localLists, setLocalLists] = useState<LocalLists>({
    localUncompletedList: focusedUncompletedIdOrderList,
    localCompletedList: focusedCompletedIdOrderList,
  });
  const { localUncompletedList, localCompletedList } = localLists;
  const [doesShowCompletedTasks, setDoesShowCompletedTasks] = useState(false);
  if (localUncompletedList !== focusedUncompletedIdOrderList
    || localCompletedList !== focusedCompletedIdOrderList) {
    setLocalLists({
      localUncompletedList: focusedUncompletedIdOrderList,
      localCompletedList: focusedCompletedIdOrderList,
    });
  }
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
      destinationOrder = localCompletedList[destination.index].order;
    } else if (destination.droppableId === focusViewNotCompletedDroppableId) {
      destinationOrder = localUncompletedList[destination.index].order;
    } else {
      return;
    }
    if (sourceOrder === destinationOrder) {
      // drop at the same place.
      return;
    }
    if (source.droppableId === focusViewCompletedDroppableId
      && destination.droppableId === focusViewCompletedDroppableId) {
      // drag and drop with in completed region
      const newList = reorder('tasks', localCompletedList, sourceOrder, destinationOrder);
      setLocalLists(prev => ({ ...prev, localCompletedList: newList }));
    } else if (source.droppableId === focusViewNotCompletedDroppableId
      && destination.droppableId === focusViewNotCompletedDroppableId) {
      // drag and drop with in uncompleted region
      const newList = reorder('tasks', localUncompletedList, sourceOrder, destinationOrder);
      setLocalLists(prev => ({ ...prev, localCompletedList: newList }));
    } else if (source.droppableId === focusViewNotCompletedDroppableId
      && destination.droppableId === focusViewCompletedDroppableId) {
      // drag from not completed and drop to completed.
      // TODO
    } else if (source.droppableId === focusViewCompletedDroppableId
      && destination.droppableId === focusViewNotCompletedDroppableId) {
      // drag from completed and drop to not completed.
      // do not support this case because the intuition is currently unclear
    } else {
      throw new Error('Impossible');
    }
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
                {renderTaskList(localUncompletedList, false)}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
          {localCompletedList.length > 0 && (
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
                  {doesShowCompletedTasks && renderTaskList(localCompletedList, true)}
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
