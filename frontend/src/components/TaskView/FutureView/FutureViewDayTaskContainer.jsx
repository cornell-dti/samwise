// @flow strict

import React from 'react';
import type { ComponentType, Node } from 'react';
import { connect } from 'react-redux';
import type { CompoundTask, SimpleDate } from './future-view-types';
import type { FloatingPosition } from '../../Util/TaskEditors/task-editors-types';
import FutureViewTask from './FutureViewTask';
import styles from './FutureViewDayTaskContainer.css';
import { useWindowSize } from '../../../hooks/window-size-hook';
import { error } from '../../../util/general-util';

type OwnProps = {|
  +date: SimpleDate;
  +inNDaysView: boolean;
  +taskEditorPosition: FloatingPosition;
  +doesShowCompletedTasks: boolean;
  +isInMainList: boolean;
  +onHeightChange: (doesOverflow: boolean, tasksHeight: number) => void;
|};

type Props = {|
  ...OwnProps;
  +tasks: CompoundTask[];
|};

/**
 * The component to render a list of tasks in backlog day or its floating expanding list.
 */
function FutureViewDayTaskContainer(
  {
    tasks, inNDaysView, taskEditorPosition, doesShowCompletedTasks, isInMainList, onHeightChange,
  }: Props,
): Node {
  // Subscribes to it, but don't use the value. Force rerender when window size changes.
  useWindowSize();
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    const containerNode = containerRef.current ?? error();
    const tasksHeight = containerNode.scrollHeight;
    const containerHeight = containerNode.clientHeight;
    onHeightChange(tasksHeight > containerHeight, tasksHeight);
  });

  const taskListComponent = tasks.map((t: CompoundTask) => (
    <FutureViewTask
      key={t.original.id}
      originalTask={t.original}
      filteredTask={t.filtered}
      taskColor={t.color}
      inNDaysView={inNDaysView}
      taskEditorPosition={taskEditorPosition}
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
  null, null,
)(FutureViewDayTaskContainer);
export default Connected;

// TODO subscribe tasks and pass into the date
