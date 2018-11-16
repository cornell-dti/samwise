// @flow strict

import React from 'react';
import type { Node } from 'react';
import type { ColoredTask } from './backlog-types';
import type { FloatingPosition } from '../TaskEditors/task-editors-types';
import BacklogTask from './BacklogTask';
import styles from './BacklogDayTaskContainer.css';

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
export default function BacklogDayTaskContainer(props: Props): Node {
  const {
    tasks, inFourDaysView, doesShowCompletedTasks, taskEditorPosition, hideOverflow,
  } = props;
  const taskListComponent = tasks
    .filter((t: ColoredTask) => (doesShowCompletedTasks || !t.complete))
    .map((t: ColoredTask) => (
      <BacklogTask
        key={t.id}
        inFourDaysView={inFourDaysView}
        doesShowCompletedTasks={doesShowCompletedTasks}
        taskEditorPosition={taskEditorPosition}
        {...t}
      />
    ));
  const className = inFourDaysView
    ? styles.BacklogDayTaskContainerFourDaysView
    : styles.BacklogDayTaskContainerOtherViews;
  if (hideOverflow) {
    return (<div className={className} style={{ overflow: 'hidden' }}>{taskListComponent}</div>);
  }
  return (<div className={className}>{taskListComponent}</div>);
}
