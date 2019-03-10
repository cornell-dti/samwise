// @flow strict

import React from 'react';
import type { ComponentType, Node } from 'react';
import { connect } from 'react-redux';
import type { FloatingPosition } from '../../Util/TaskEditors/editors-types';
import FutureViewTask from './FutureViewTask';
import styles from './FutureViewDayTaskContainer.css';
import { useWindowSizeCallback } from '../../../hooks/window-size-hook';
import { error } from '../../../util/general-util';
import type { State } from '../../../store/store-types';
import { createGetIdOrderListByDate } from '../../../store/selectors';

type OwnProps = {|
  +date: string;
  +inNDaysView: boolean;
  +taskEditorPosition: FloatingPosition;
  +doesShowCompletedTasks: boolean;
  +isInMainList: boolean;
  +onHeightChange: (doesOverflow: boolean, tasksHeight: number) => void;
|};

type Props = {|
  ...OwnProps;
  +idOrderList: {| +id: string; +order: number |}[];
|};

/**
 * The component to render a list of tasks in backlog day or its floating expanding list.
 */
function FutureViewDayTaskContainer(
  {
    idOrderList,
    inNDaysView,
    taskEditorPosition,
    doesShowCompletedTasks,
    isInMainList,
    onHeightChange,
  }: Props,
): Node {
  const containerRef = React.useRef(null);
  const [prevHeights, setPrevHeights] = React.useState(() => [0, 0]);

  // Subscribes to it, but don't use the value. Force rerender when window size changes.
  useWindowSizeCallback(() => {
    const containerNode = containerRef.current ?? error();
    const tasksHeight = containerNode.scrollHeight;
    const containerHeight = containerNode.clientHeight;
    const [prevTasksHeight, prevContainerHeight] = prevHeights;
    if (prevTasksHeight === tasksHeight && prevContainerHeight === containerHeight) {
      return;
    }
    setPrevHeights([tasksHeight, containerHeight]);
    onHeightChange(tasksHeight > containerHeight && containerHeight > 0, tasksHeight);
  });

  const taskListComponent = idOrderList.map(({ id }) => (
    <FutureViewTask
      key={id}
      taskId={id}
      inNDaysView={inNDaysView}
      taskEditorPosition={taskEditorPosition}
      doesShowCompletedTasks={doesShowCompletedTasks}
      isInMainList={isInMainList}
    />
  ));
  const className = inNDaysView ? styles.NDaysView : styles.OtherViews;
  if (isInMainList) {
    const style = { overflow: 'hidden' };
    return <div className={className} style={style} ref={containerRef}>{taskListComponent}</div>;
  }
  return <div className={className} ref={containerRef}>{taskListComponent}</div>;
}

const Connected: ComponentType<OwnProps> = connect(
  (state: State, { date }: OwnProps) => createGetIdOrderListByDate(date)(state),
)(FutureViewDayTaskContainer);
export default Connected;