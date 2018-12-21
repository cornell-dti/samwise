// @flow strict

import type { ComponentType } from 'react';
import type { SubTask, Task } from '../store/store-types';
import type { ConnectedComponent } from '../store/react-redux-util';
import { stateConnect } from '../store/react-redux-util';

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
 * @param {function(Task): Task | Task} replacer the replacer function or replacement task.
 * @return {Task[]} the new task array.
 */
export const replaceTask = (
  tasks: Task[], id: number, replacer: ((Task) => Task) | Task,
): Task[] => tasks.map((task: Task) => {
  if (task.id !== id) {
    return task;
  }
  return typeof replacer === 'function' ? replacer(task) : replacer;
});

/**
 * Replace a subtask with given id in an array of task.
 *
 * @param {SubTask[]} subTasks the subtask array to perform the replace operation.
 * @param {number} id the id of the subtask to be replaced.
 * @param {function(SubTask): SubTask} replacer the replacer function.
 * @return {SubTask[]} the new subtask array.
 */
export const replaceSubTask = (
  subTasks: SubTask[], id: number, replacer: (SubTask) => SubTask,
): SubTask[] => subTasks.map(
  (subTask: SubTask) => (subTask.id === id ? replacer(subTask) : subTask),
);

/**
 * Replace a subtask with given id in an array of task.
 *
 * @param {Task[]} tasks the main task array to perform the replace operation.
 * @param {number} mainTaskID the id of the main task to be replaced.
 * @param {number} subTaskID the id of the subtask to be replaced.
 * @param {function(SubTask, Task): SubTask} replacer the replacer function.
 * @return {Task[]} the new subtask array.
 */
export const replaceSubTaskWithinMainTask = (
  tasks: Task[], mainTaskID: number, subTaskID: number,
  replacer: ((SubTask, Task) => SubTask),
): Task[] => replaceTask(tasks, mainTaskID, (task: Task) => ({
  ...task,
  subtasks: replaceSubTask(task.subtasks, subTaskID, s => replacer(s, task)),
}));

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

type TasksProps = {| +tasks: Task[] |};

/**
 * A function to connect a component with just tasks in redux store.
 *
 * @param component the component to connect.
 * @return {ConnectedComponent<Config, TagsProps>} the connected component.
 */
export function tasksConnect<Config: Object>( // flowlint-line unclear-type:off
  component: ComponentType<Config>,
): ConnectedComponent<Config, TasksProps> {
  return stateConnect<Config, TasksProps>(
    ({ tasks }): TasksProps => ({ tasks }),
  )(component);
}

export type TasksProgress = {| +completed: number; +all: number |};
export type TasksProgressProps = {|
  +progress: TasksProgress;
|};

/**
 * A function to connect a component with progress in redux store.
 *
 * @param component the component to connect.
 * @return {ConnectedComponent<Config, TasksProgressProps>} the connected component.
 */
export function tasksProgressConnect<Config: Object>( // flowlint-line unclear-type:off
  component: ComponentType<Config>,
): ConnectedComponent<Config, TasksProgressProps> {
  return stateConnect<Config, TasksProgressProps>(({ tasks }): TasksProgressProps => {
    let completed = 0;
    let all = 0;
    filterInFocusTasks(tasks).forEach((task: Task) => {
      if (task.subtasks.length === 0) {
        if (task.complete) {
          completed += 1;
        }
        all += 1;
      } else {
        all += task.subtasks.length;
        if (task.complete) {
          completed += task.subtasks.length;
        } else {
          completed += task.subtasks.reduce((a, s) => a + (s.complete ? 1 : 0), 0);
        }
      }
    });
    return { progress: { completed, all } };
  })(component);
}
