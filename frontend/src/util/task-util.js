// @flow strict

import type { Map } from 'immutable';
import type { PartialMainTask, PartialSubTask, SubTask, Task } from '../store/store-types';
import type { TaskWithSubTasks } from '../components/Util/TaskEditors/editors-types';

/**
 * This is the utility module for array of tasks and subtasks.
 * This module implements many common functional operations on an array of tasks or subtasks.
 * Other modules should try to call functions in this module instead of implementing their own.
 */

export const getFilteredCompletedTask = (
  task: Task, subTasks: Map<string, SubTask>,
): Task | null => {
  if (task.complete) {
    return null;
  }
  const children = task.children.filter(id => !(subTasks.get(id)?.complete ?? false));
  return { ...task, children };
};

export const getFilteredInFocusTask = (
  task: Task, subTasks: Map<string, SubTask>,
): TaskWithSubTasks | null => {
  const { children, ...rest } = task;
  const childrenArray = children.map(id => subTasks.get(id)).filter(s => s != null);
  const newSubTasks = [];
  if (task.inFocus) {
    childrenArray.forEach((s) => {
      if (s != null) { newSubTasks.push(s); }
    });
  } else {
    childrenArray.forEach((s) => {
      if (s != null && s.inFocus) { newSubTasks.push(s); }
    });
    if (newSubTasks.length === 0) {
      return null;
    }
  }
  return { ...rest, subTasks: newSubTasks };
};

/**
 * The type for a task augmented with color information and filtered task.
 */
export type CompoundTask = {|
  +original: Task;
  +filtered: Task;
  +color: string;
|};

/**
 * Used to keep track of the task diff to optimize edit speed.
 */
export type TaskDiff = {|
  +mainTaskDiff: PartialMainTask,
  +subtasksCreations: SubTask[];
  +subtasksEdits: [string, PartialSubTask][];
  +subtasksDeletions: string[];
|};

/**
 * The empty task diff.
 * @type {TaskDiff}
 */
export const EMPTY_TASK_DIFF: TaskDiff = {
  mainTaskDiff: Object.freeze({}),
  subtasksEdits: [],
  subtasksCreations: [],
  subtasksDeletions: [],
};

/**
 * Detect whether diff is empty.
 *
 * @param {TaskDiff} diff the diff to check.
 * @return {boolean} whether diff is empty.
 */
export const taskDiffIsEmpty = (diff: TaskDiff): boolean => {
  const {
    mainTaskDiff, subtasksCreations, subtasksEdits, subtasksDeletions,
  } = diff;
  const {
    name, tag, date, complete, inFocus,
  } = mainTaskDiff;
  const mainTaskEmpty = name == null
    && tag == null && date == null && complete == null && inFocus == null;
  if (!mainTaskEmpty) {
    return false;
  }
  return subtasksCreations.length === 0 && subtasksEdits.length === 0 && subtasksDeletions === 0;
};

export type TasksProgressProps = {| +completedTasksCount: number; +allTasksCount: number |};

/**
 * Compute the progress given a list of filtered tasks.
 *
 * @param {Task[]} inFocusTasks in-focus filtered tasks.
 * @param {Map<string, SubTask>} subTasks all subtasks map as a reference.
 * @return {TasksProgressProps} the progress.
 */
export const computeTaskProgress = (
  inFocusTasks: Task[], subTasks: Map<string, SubTask>,
): TasksProgressProps => {
  let completedTasksCount = 0;
  let allTasksCount = 0;
  for (let i = 0; i < inFocusTasks.length; i += 1) {
    const task = inFocusTasks[i];
    allTasksCount += task.children.size + 1;
    if (task.complete) {
      completedTasksCount += task.children.size + 1;
    } else {
      completedTasksCount += task.children.reduce(
        (acc, s) => acc + ((subTasks.get(s)?.complete ?? false) ? 1 : 0), 0,
      );
    }
  }
  return { completedTasksCount, allTasksCount };
};
