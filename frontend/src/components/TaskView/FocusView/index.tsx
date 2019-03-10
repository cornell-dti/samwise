import React, { ReactElement } from 'react';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import { connect } from 'react-redux';
import styles from './FocusView.css';
import ClearFocus from './ClearFocus';
import FocusTask from './FocusTask';
import { reorder } from '../../../firebase/actions';
import { getTaskIdOrderList } from '../../../store/selectors';

const focusViewDroppableId = 'focus-view-droppable';

const tasksRenderer = ({ id }: { readonly id: string }, index: number): ReactElement => (
  <FocusTask key={id} id={id} order={index} />
);

type IdOrder = { readonly id: string; readonly order: number };

/**
 * The focus view component.
 */
function FocusView({ idOrderList }: { readonly idOrderList: IdOrder[] }): ReactElement {
  const [localList, setLocalList] = React.useState<IdOrder[]>(idOrderList);
  if (localList !== idOrderList) {
    setLocalList(idOrderList);
  }

  const onDragEnd = (result: DropResult): void => {
    const { source, destination } = result;
    if (destination == null || destination.droppableId !== focusViewDroppableId) {
      // drop outside of the list
      return;
    }
    if (source.index === destination.index) {
      // drop at the same place.
      return;
    }
    // TODO has problem when there is a gap in order
    const newList = reorder(
      'tasks',
      localList,
      localList[source.index].order,
      localList[destination.index].order,
    );
    setLocalList(newList);
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
              <div
                ref={provided.innerRef}
                className={styles.Droppable}
                {...provided.droppableProps}
              >
                {localList.map(tasksRenderer)}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
}

const Connected = connect(getTaskIdOrderList)(FocusView);
export default Connected;
