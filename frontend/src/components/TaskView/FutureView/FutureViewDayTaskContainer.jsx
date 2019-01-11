// @flow strict

import React from 'react';
import type { Node } from 'react';
import type { CompoundTask } from './future-view-types';
import type { FloatingPosition } from '../../Util/TaskEditors/task-editors-types';
import FutureViewTask from './FutureViewTask';
import styles from './FutureViewDayTaskContainer.css';

type Props = {|
  +tasks: CompoundTask[];
  +inNDaysView: boolean;
  +taskEditorPosition: FloatingPosition;
  +isInMainList: boolean;
|};

/**
 * The component to render a list of tasks in backlog day or its floating expanding list.
 *
 * @param {Props} props all the props passed in. Read the type definitions above.
 * @constructor
 */
export default function FutureViewDayTaskContainer(props: Props): Node {
  const {
    tasks, inNDaysView, taskEditorPosition, isInMainList,
  } = props;
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
    return (<div className={className} style={{ overflow: 'hidden' }}>{taskListComponent}</div>);
  }
  return (<div className={className}>{taskListComponent}</div>);
}
