import React, { ReactElement, useState } from 'react';
import { connect } from 'react-redux';
import { Draggable, DragDropContext, DropResult, Droppable } from 'react-beautiful-dnd';
import { CalendarPosition, FloatingPosition } from '../../Util/TaskEditors/editors-types';
import FutureViewTask from './FutureViewTask';
import styles from './FutureViewDayTaskContainer.module.css';
import { useWindowSizeCallback } from '../../../hooks/window-size-hook';
import { State } from '../../../store/store-types';
import { createGetIdOrderListByDate } from '../../../store/selectors';
import { computeReorderMap, getReorderedList } from '../../../util/order-util';
import { applyReorder } from '../../../firebase/actions';

type OwnProps = {
  readonly date: string;
  readonly inNDaysView: boolean;
  readonly taskEditorPosition: FloatingPosition;
  readonly calendarPosition: CalendarPosition;
  readonly doesShowCompletedTasks: boolean;
  readonly isInMainList: boolean;
  readonly onHeightChange: (doesOverflow: boolean, tasksHeight: number) => void;
};

type IdOrder = { readonly id: string; readonly order: number };

type Props = OwnProps & {
  readonly idOrderList: IdOrder[];
};

/**
 * The component to render a list of tasks in backlog day or its floating expanding list.
 */
function FutureViewDayTaskContainer(
  {
    date,
    idOrderList,
    inNDaysView,
    taskEditorPosition,
    doesShowCompletedTasks,
    calendarPosition,
    isInMainList,
    onHeightChange,
  }: Props,
): ReactElement {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [prevHeights, setPrevHeights] = React.useState(() => [0, 0]);

  // Subscribes to it, but don't use the value. Force rerender when window size changes.
  useWindowSizeCallback(() => {
    const containerNode = containerRef.current;
    if (containerNode == null) {
      return;
    }
    const tasksHeight = containerNode.scrollHeight;
    const containerHeight = containerNode.clientHeight;
    const [prevTasksHeight, prevContainerHeight] = prevHeights;
    if (prevTasksHeight === tasksHeight && prevContainerHeight === containerHeight) {
      return;
    }
    setPrevHeights([tasksHeight, containerHeight]);
    onHeightChange(tasksHeight > containerHeight && containerHeight > 0, tasksHeight);
  });
  const [localTasks, setLocalTasks] = useState<IdOrder[]>(idOrderList);
  const onDragEnd = (result: DropResult): void => {
    const { source, destination } = result;
    if (destination == null) {
      // invalid drop, skip
      return;
    }
    const sourceOrder: number = source.index;
    const dest = localTasks[destination.index];
    const destinationOrder: number = dest == null ? sourceOrder : dest.order;

    const reorderMap = computeReorderMap(localTasks, sourceOrder, destinationOrder);
    setLocalTasks(getReorderedList(localTasks, reorderMap));
    applyReorder('tasks', reorderMap);
  };
  const taskListComponent = idOrderList.map(({ id, order }) => (
    <Draggable key={id} draggableId={id} index={order}>
      { (provided) => (
        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
          <FutureViewTask
            key={id}
            taskId={id}
            containerDate={date}
            inNDaysView={inNDaysView}
            taskEditorPosition={taskEditorPosition}
            calendarPosition={calendarPosition}
            doesShowCompletedTasks={doesShowCompletedTasks}
            isInMainList={isInMainList}
          />
        </div>
      )}
    </Draggable>
  ));
  if (isInMainList) {
    const style = {};
    return (
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="onetestyboy">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              <div
                className={styles.Container}
                style={style}
                ref={containerRef}
              >
                {taskListComponent}
              </div>
            </div>
          )}
        </Droppable>
      </DragDropContext>
    );
  }
  return <div className={styles.Container} ref={containerRef}>{taskListComponent}</div>;
}

const Connected = connect(
  (state: State, { date }: OwnProps) => createGetIdOrderListByDate(date)(state),
)(FutureViewDayTaskContainer);
export default Connected;
