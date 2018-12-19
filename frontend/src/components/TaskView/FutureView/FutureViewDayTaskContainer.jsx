// @flow strict

import React from 'react';
import type { Node } from 'react';
import type { ColoredTask } from './future-view-types';
import type { FloatingPosition } from '../../Util/TaskEditors/task-editors-types';
import FutureViewTask from './FutureViewTask';
import styles from './FutureViewDayTaskContainer.css';

type Props = {|
  +tasks: ColoredTask[];
  +inFourDaysView: boolean;
  +doesShowCompletedTasks: boolean;
  +taskEditorPosition: FloatingPosition;
  +hideOverflow: boolean;
|};

/**
 * The component to render a list of tasks in backlog day or its floating expanding list.
 *
 * @param {Props} props all the props passed in. Read the type definitions above.
 * @constructor
 */
export default function FutureViewDayTaskContainer(props: Props): Node {
  const {
    tasks, inFourDaysView, doesShowCompletedTasks, taskEditorPosition, hideOverflow,
  } = props;
  const taskListComponent = tasks
    .filter((t: ColoredTask) => (doesShowCompletedTasks || !t.complete))
    .map((t: ColoredTask, index: number) => (
      <FutureViewTask
        // To force rerender
        // eslint-disable-next-line react/no-array-index-key
        key={index}
        inFourDaysView={inFourDaysView}
        doesShowCompletedTasks={doesShowCompletedTasks}
        taskEditorPosition={taskEditorPosition}
        {...t}
      />
    ));
  const className = inFourDaysView
    ? styles.FourDaysView
    : styles.OtherViews;
  if (hideOverflow) {
    return (<div className={className} style={{ overflow: 'hidden' }}>{taskListComponent}</div>);
  }
  return (<div className={className}>{taskListComponent}</div>);
}
