// @flow strict

import type {
  AddNewTaskAction, EditTaskAction,
  MarkTaskAction, MarkSubTaskAction,
  ToggleTaskPinAction, ToggleSubTaskPinAction,
  RemoveTaskAction, RemoveSubTaskAction,
  ColorConfigEditAction, ColorConfigRemoveAction,
  ClassOrTag,
  UndoDeleteTaskAction, ClearUndoDeleteTaskAction,
  BackendPatchNewTaskAction, BackendPatchExistingTaskAction,
} from './action-types';
import type { Task } from './store-types';

/**
 * Edit color config is an action that can be used to add OR edit a color config in the store.
 *
 * @param {ClassOrTag} classOrTag whether it's a class or tag.
 * @param {string} tag tag of the config, which is usually a class name (e.g. CS 2112)
 * @param {string} color color of the config, which should be a valid color in CSS
 * (e.g. 'red' or '#000000')
 * @return {ColorConfigEditAction} the edit color action.
 */
export const editColorConfig = (
  tag: string, color: string, classOrTag: ClassOrTag,
): ColorConfigEditAction => ({
  type: 'EDIT_COLOR_CONFIG', classOrTag, tag, color,
});
/**
 * Remove color config is an action that can be used to remove a color config from the store.
 *
 * @param {ClassOrTag} classOrTag whether it's a class or tag.
 * @param {string} tag tag of the config to remove, which is usually a class name (e.g. CS 2112)
 * @return {ColorConfigRemoveAction} the remove color action.
 */
export const removeColorConfig = (
  tag: string, classOrTag: ClassOrTag,
): ColorConfigRemoveAction => ({
  type: 'REMOVE_COLOR_CONFIG', classOrTag, tag,
});

/**
 * Add task is an action that can be used to add a new task.
 *
 * @param task the task to add.
 * @return {AddNewTaskAction} the add task action.
 */
export const addTask = (task: Task): AddNewTaskAction => ({ type: 'ADD_NEW_TASK', data: task });

/**
 * Edit task is an action that can be used to edit an existing task.
 *
 * @param task the task to edit.
 * @return {AddNewTaskAction} the edit task action.
 */
export const editTask = (task: Task): EditTaskAction => ({ type: 'EDIT_TASK', task });

/**
 * Mark task is the action that can be used to mark a task as completed or not.
 *
 * @param taskId the id of the task to mark.
 * @return {MarkTaskAction} the mark task action.
 */
export const markTask = (taskId: number): MarkTaskAction => ({ type: 'MARK_TASK', id: taskId });
/**
 * Mark subtask is the action that can be used to mark a subtask as completed or not.
 *
 * @param taskId the id of the parent task of the subtask to mark.
 * @param subtaskId the id of the subtask to mark.
 * @return {MarkSubTaskAction} the mark subtask action.
 */
export const markSubtask = (taskId: number, subtaskId: number): MarkSubTaskAction => ({
  type: 'MARK_SUBTASK', id: taskId, subtask: subtaskId,
});

/**
 * Toggle task pin is the action that can be used to mark a task as in focus or not.
 *
 * @param taskId the id of the task to toggle.
 * @return {ToggleTaskPinAction} the toggle task pin action.
 */
export const toggleTaskPin = (taskId: number): ToggleTaskPinAction => ({
  type: 'TOGGLE_TASK_PIN', taskId,
});
/**
 * Toggle subtask pin is the action that can be used to mark a subtask as in focus or not.
 *
 * @param taskId the id of the parent task of the subtask to toggle.
 * @param subtaskId the id of the subtask to toggle.
 * @return {ToggleSubTaskPinAction} the toggle subtask pin  action.
 */
export const toggleSubTaskPin = (taskId: number, subtaskId: number): ToggleSubTaskPinAction => ({
  type: 'TOGGLE_SUBTASK_PIN', taskId, subtaskId,
});

/**
 * Remove task is the action that can be used to remove a task.
 *
 * @param {number} taskId the id of the task to remove.
 * @param {boolean} undoable whether the removal can be undone, which defaults to false.
 * @return {RemoveTaskAction} the remove task action.
 */
export const removeTask = (taskId: number, undoable: boolean = false): RemoveTaskAction => ({
  type: 'REMOVE_TASK', taskId, undoable,
});
/**
 * Remove subtask is the action that can be used to remove a subtask.
 *
 * @param taskId the id of the parent task of the subtask to remove.
 * @param subtaskId the id of the subtask to remove.
 * @return {RemoveSubTaskAction} the remove subtask action.
 */
export const removeSubTask = (taskId: number, subtaskId: number): RemoveSubTaskAction => ({
  type: 'REMOVE_SUBTASK', taskId, subtaskId,
});

/**
 * Undo the previous delete task operation.
 *
 * @return {UndoDeleteTaskAction} the undo delete task action.
 */
export const undoDeleteTask = (): UndoDeleteTaskAction => ({ type: 'UNDO_DELETE_TASK' });
/**
 * Undo the previous delete task operation.
 *
 * @return {UndoDeleteTaskAction} the undo delete task action.
 */
export const clearUndoDeleteTask = (): ClearUndoDeleteTaskAction => ({
  type: 'CLEAR_UNDO_DELETE_TASK',
});

/**
 * Let the backend patch an existing task.
 *
 * @param {number} id the temp randomly assigned new task id.
 * @param {Task} t the task to patch.
 * @return {BackendPatchExistingTaskAction} the backend patch task action.
 */
export const backendPatchNewTask = (id: number, t: Task): BackendPatchNewTaskAction => ({
  type: 'BACKEND_PATCH_NEW_TASK', tempNewTaskId: id, task: t,
});

/**
 * Let the backend patch an existing task.
 *
 * @param {Task} task the task to patch.
 * @return {BackendPatchExistingTaskAction} the backend patch task action.
 */
export const backendPatchExistingTask = (task: Task): BackendPatchExistingTaskAction => ({
  type: 'BACKEND_PATCH_EXISTING_TASK', task,
});
