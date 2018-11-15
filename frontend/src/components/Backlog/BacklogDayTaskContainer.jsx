// @flow strict

import React from 'react';
import type { Node } from 'react';
import type { ColoredTask } from './backlog-types';
import type { FloatingPosition } from '../TaskEditors/task-editors-types';
import BacklogTask from './BacklogTask';
import styles from './BacklogDay.css';

type Props = {|
  +tasks: ColoredTask[];
  +inFourDaysView: boolean;
  +doesShowCompletedTasks: boolean;
  +taskEditorPosition: FloatingPosition;
  refFunction?: (HTMLDivElement | null) => void;
|};

/**
 * The component to render a list of tasks in backlog day or its floating expanding list.
 *
 * @param {Props} props all the props passed in. Read the type definitions above.
 * @constructor
 */
export default function BacklogDayTaskContainer(props: Props): Node {
  const {
    tasks, inFourDaysView, doesShowCompletedTasks, taskEditorPosition, refFunction,
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
  return (
    <div
      className={styles.BacklogDayTaskContainer}
      ref={refFunction}
    >
      {taskListComponent}
    </div>
  );
}

BacklogDayTaskContainer.defaultProps = { refFunction: undefined };
