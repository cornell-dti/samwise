// @flow strict

import React from 'react';
import type { Node } from 'react';
import type { CompoundTask } from './future-view-types';
import type { FloatingPosition } from '../../Util/TaskEditors/task-editors-types';
import FutureViewTask from './FutureViewTask';
import styles from './FutureViewDayTaskContainer.css';
import { useWindowSize } from '../../../hooks/window-size-hook';

type Props = {|
  +tasks: CompoundTask[];
  +inNDaysView: boolean;
  +taskEditorPosition: FloatingPosition;
  +isInMainList: boolean;
  +onOverflowChange: (doesOverflow: boolean) => void;
|};

/**
 * The component to render a list of tasks in backlog day or its floating expanding list.
 */
export default function FutureViewDayTaskContainer(
  {
    tasks, inNDaysView, taskEditorPosition, isInMainList, onOverflowChange,
  }: Props,
): Node {
  // Subscribes to it, but don't use the value. Force rerender when window size changes.
  useWindowSize();

  const updateOverflowStatus = (containerNode: ?HTMLDivElement) => {
    if (containerNode == null) {
      return;
    }
    onOverflowChange(containerNode.scrollHeight > containerNode.clientHeight);
  };

  const taskListComponent = tasks.map((t: CompoundTask) => (
    <FutureViewTask
      key={t.original.id}
      originalTask={t.original}
      filteredTask={t.filtered}
      taskColor={t.color}
      inNDaysView={inNDaysView}
      isInMainList={isInMainList}
      taskEditorPosition={taskEditorPosition}
    />
  ));
  const className = inNDaysView ? styles.NDaysView : styles.OtherViews;
  if (isInMainList) {
    const style = { overflow: 'hidden' };
    return (
      <div className={className} style={style} ref={updateOverflowStatus}>
        {taskListComponent}
      </div>
    );
  }
  return <div className={className} ref={updateOverflowStatus}>{taskListComponent}</div>;
}
