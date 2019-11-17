import React, { ReactElement } from 'react';
import { connect } from 'react-redux';
import { Draggable } from 'react-beautiful-dnd';
import { CalendarPosition, FloatingPosition } from '../../Util/TaskEditors/editors-types';
import FutureViewTask from './FutureViewTask';
import styles from './FutureViewDayTaskContainer.module.css';
import { useWindowSizeCallback } from '../../../hooks/window-size-hook';
import { State } from '../../../store/store-types';
import { createGetIdOrderListByDate } from '../../../store/selectors';

type OwnProps = {
  readonly date: string;
  readonly inNDaysView: boolean;
  readonly taskEditorPosition: FloatingPosition;
  readonly calendarPosition: CalendarPosition;
  readonly doesShowCompletedTasks: boolean;
  readonly isInMainList: boolean;
  readonly onHeightChange: (doesOverflow: boolean, tasksHeight: number) => void;
};

type Props = OwnProps & {
  readonly idOrderList: { readonly id: string; readonly order: number }[];
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

  const taskListComponent = idOrderList.map(({ id, order }) => (
    <Draggable draggableId={id} index={order}>
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
    const style = { overflow: 'hidden' };
    return (
      <div className={styles.Container} style={style} ref={containerRef}>{taskListComponent}</div>
    );
  }
  return <div className={styles.Container} ref={containerRef}>{taskListComponent}</div>;
}

const Connected = connect(
  (state: State, { date }: OwnProps) => createGetIdOrderListByDate(date)(state),
)(FutureViewDayTaskContainer);
export default Connected;
