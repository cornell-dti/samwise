// @flow

import type {
  AddNewTaskAction,
  EditTaskAction,
  TagColorConfigEditAction,
  TagColorConfigRemoveAction,
} from './action-types';
import type { Task } from './store-types';

/**
 * Edit color config is an action that can be used to add OR edit a color config in the store.
 *
 * @param {string} tag tag of the config, which is usually a class name (e.g. CS 2112)
 * @param {string} color color of the config, which should be a valid color in CSS
 * (e.g. 'red' or '#000000')
 * @return {TagColorConfigEditAction} the edit color action.
 */
export const editColorConfig = (tag: string, color: string): TagColorConfigEditAction => ({
  type: 'EDIT_COLOR_CONFIG', tag, color,
});

/**
 * Remove color config is an action that can be used to remove a color config from the store.
 *
 * @param {string} tag tag of the config to remove, which is usually a class name (e.g. CS 2112)
 * @return {TagColorConfigRemoveAction} the remove color action.
 */
export const removeColorConfig = (tag: string): TagColorConfigRemoveAction => ({
  type: 'REMOVE_COLOR_CONFIG', tag,
});

export const addTask = (task: Task): AddNewTaskAction => ({ type: 'ADD_NEW_TASK', data: task });
export const editTask = (task: Task): EditTaskAction => ({ type: 'EDIT_TASK', task });

export const markTask = (taskID: number) => ({ type: 'MARK_TASK', id: taskID });
export const markSubtask = (taskID: number, subTaskID: number) => ({
  type: 'MARK_SUBTASK', id: taskID, subtask: subTaskID,
});

export const addSubtask = (taskID: number, subtask: any) => ({
  type: 'ADD_SUBTASK', id: taskID, data: subtask,
});
