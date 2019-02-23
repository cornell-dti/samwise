// @flow strict

import { connect } from 'react-redux';
import type { ComponentType } from 'react';
import type { Map } from 'immutable';
import type {
  PartialMainTask, PartialSubTask, SubTask, Task,
} from '../store/store-types';

/**
 * This is the utility module for array of tasks and subtasks.
 * This module implements many common functional operations on an array of tasks or subtasks.
 * Other modules should try to call functions in this module instead of implementing their own.
 */

/**
 * Replace a task with given id in an array of task.
 *
 * @param {Task[]} tasks the task array to perform the replace operation.
 * @param {number} id the id of the task to be replaced.
 * @param {function(Task): Task} replacer the replacer function.
 * @return {Task[]} the new task array.
 */
export const replaceTask = (
  tasks: Task[], id: string, replacer: (Task) => Task,
): Task[] => tasks.map((task: Task) => (task.id !== id ? task : replacer(task)));

/**
 * Replace a subtask with given id in an array of task.
 *
 * @param {SubTask[]} subTasks the subtask array to perform the replace operation.
 * @param {string} id the id of the subtask to be replaced.
 * @param {function(SubTask): SubTask} replacer the replacer function.
 * @return {SubTask[]} the new subtask array.
 */
export const replaceSubTask = (
  subTasks: SubTask[], id: string, replacer: (SubTask) => SubTask,
): SubTask[] => subTasks.map(
  (subTask: SubTask) => (subTask.id === id ? replacer(subTask) : subTask),
);

/**
 * Replace a subtask with given id in an array of task.
 *
 * @param {Task[]} tasks the main task array to perform the replace operation.
 * @param {string} mainTaskID the id of the main task to be replaced.
 * @param {string} subTaskID the id of the subtask to be replaced.
 * @param {function(SubTask, Task): SubTask} replacer the replacer function.
 * @return {Task[]} the new subtask array.
 */
export const replaceSubTaskWithinMainTask = (
  tasks: Task[], mainTaskID: string, subTaskID: string,
  replacer: ((SubTask, Task) => SubTask),
): Task[] => replaceTask(tasks, mainTaskID, (task: Task) => ({
  ...task,
  subtasks: replaceSubTask(task.subtasks, subTaskID, s => replacer(s, task)),
}));


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

/**
 * Filter away all the completed tasks.
 *
 * @param {Task[]} tasks the original tasks.
 * @return {[Task, Task][]} an array of tuple (original task, filtered task).
 */
export const filterCompletedTasks = (tasks: Task[]): [Task, Task][] => tasks
  .filter(t => !t.complete)
  .map((task: Task) => [
    task, { ...task, subtasks: task.subtasks.filter(s => !s.complete) },
  ]);

/**
 * Filter and leave only tasks and partial tasks in focus.
 *
 * @param {Task[]} tasks unfiltered tasks.
 * @return {Task[]} filtered tasks.
 */
export const filterInFocusTasks = (tasks: Task[]): Task[] => tasks
  .map((task: Task): Task => {
    if (task.inFocus) {
      return task;
    }
    const subtasks = task.subtasks.filter(subTask => subTask.inFocus);
    return { ...task, subtasks };
  })
  .filter((task: Task) => task.inFocus || task.subtasks.length > 0);

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

/**
 * A function to connect a component with just displayable tasks in redux store.
 */
export function tasksConnect<-Config>(
  component: ComponentType<Config>,
): ComponentType<$Diff<Config, {| +tasks: Task[] |}>> {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return connect(
    ({ tasks }) => ({ tasks: tasks.filter(t => (!t.complete || t.date > yesterday)) }),
    null,
  )(component);
}
