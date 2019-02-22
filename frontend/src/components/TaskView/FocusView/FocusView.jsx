// @flow strict

import React from 'react';
import type { ComponentType, Node } from 'react';
// $FlowFixMe not flow strict
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import type { Task } from '../../../store/store-types';
import styles from './FocusView.css';
import ClearFocus from './ClearFocus';
import FocusTask from './FocusTask';
import { reorder } from '../../../firebase/actions';

const focusViewDroppableId = 'focus-view-droppable';

type Props = {| +focusedTaskIds: number[] |};

/**
 * The focus view component.
 */
function FocusView({ focusedTaskIds }: Props): Node {
  const [localTasks, setLocalTasks] = React.useState<Task[]>(tasks);
  if (localTasks !== tasks) {
    setLocalTasks(tasks);
  }

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (destination == null || destination.droppableId !== focusViewDroppableId) {
      // drop outside of the list
      return;
    }
    if (source.index === destination.index) {
      // drop at the same place.
      return;
    }
    const newTasks = reorder('tasks', tasks, source.index, destination.index);
    setLocalTasks(newTasks);
  };

  return (
    <div className={styles.FocusView}>
      <div className={styles.ControlBlock}>
        <h3 className={styles.Title}>Focus</h3>
        <span className={styles.Padding} />
        <ClearFocus />
      </div>
      <div className={styles.FocusTaskContainer}>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId={focusViewDroppableId}>
            {provided => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {localTasks.map((task: Task): Node => (
                  <FocusTask key={task.id} task={task} />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
}

const Connected: ComponentType<Props> = React.memo(FocusView);
export default Connected;
