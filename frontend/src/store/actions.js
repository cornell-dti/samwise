// @flow strict

import type {
  AddTagAction,
  EditTagAction,
  RemoveTagAction,
  AddNewTaskAction,
  AddNewSubTaskAction,
  EditTaskAction,
  EditMainTaskAction,
  EditSubTaskAction,
  RemoveTaskAction,
  RemoveSubTaskAction,
  UndoAddTaskAction,
  ClearUndoAddTaskAction,
  UndoDeleteTaskAction,
  ClearUndoDeleteTaskAction,
  BackendPatchNewTaskAction,
  BackendPatchNewSubTaskAction,
  BackendPatchExistingTaskAction,
  BackendPatchLoadedDataAction,
  BackendPatchNewTagAction,
} from './action-types';
import type {
  PartialMainTask, PartialSubTask, SubTask, Tag, Task,
} from './store-types';

/**
 * Edit tag is an action that can be used to edit a tag.
 *
 * @param {Tag} tag the tag to edit.
 * @return {AddTagAction} the edit tag action.
 */
export const addTag = (tag: Tag): AddTagAction => ({ type: 'ADD_TAG', tag });
/**
 * Edit tag is an action that can be used to edit a tag.
 *
 * @param {Tag} tag the tag to edit.
 * @return {A} the edit tag action.
 */
export const editTag = (tag: Tag): EditTagAction => ({ type: 'EDIT_TAG', tag });
/**
 * Remove tag is an action that can be used to remove a tag from the store.
 *
 * @param {number} tagId the id of the tag to remove.
 * @return {RemoveTagAction} the remove color action.
 */
export const removeTag = (tagId: number): RemoveTagAction => ({ type: 'REMOVE_TAG', tagId });

/**
 * Add task is an action that can be used to add a new task.
 *
 * @param {Task} task the task to add.
 * @return {AddNewTaskAction} the add task action.
 */
export const addTask = (task: Task): AddNewTaskAction => ({ type: 'ADD_NEW_TASK', task });
/**
 * Add subtask is an action that can be used to append a subtask to a new task.
 *
 * @param {number} taskId the task id of the main task.
 * @param {AddNewSubTaskAction} subTask the new subtask.
 * @return {{subTask: SubTask, type: string, taskId: number}}
 */
export const addSubTask = (taskId: number, subTask: SubTask): AddNewSubTaskAction => ({
  type: 'ADD_NEW_SUBTASK', taskId, subTask,
});

/**
 * Edit task is an action that can be used to edit an existing task.
 *
 * @param task the task to edit.
 * @return {AddNewTaskAction} the edit task action.
 */
export const editTask = (task: Task): EditTaskAction => ({ type: 'EDIT_TASK', task });

/**
 * Edit main task is the action to edit various parts of main task except subtasks.
 *
 * @param {number} taskId the id of the task to edit.
 * @param {PartialMainTask} partialMainTask the main task info with every field optional.
 * @return {EditMainTaskAction} the edit main task action.
 */
export const editMainTask = (
  taskId: number, partialMainTask: PartialMainTask,
): EditMainTaskAction => ({ type: 'EDIT_MAIN_TASK', taskId, partialMainTask });

/**
 * Edit sub task is the action to edit various parts of subtask.
 *
 * @param {number} taskId the id of the task to edit.
 * @param {number} subtaskId the id of the subtask to edit.
 * @param {PartialSubTask} partialSubTask the subtask info with every field optional.
 * @return {EditSubTaskAction} the edit sub-task action.
 */
export const editSubTask = (
  taskId: number, subtaskId: number, partialSubTask: PartialSubTask,
): EditSubTaskAction => ({
  type: 'EDIT_SUB_TASK', taskId, subtaskId, partialSubTask,
});

/**
 * Remove task is the action that can be used to remove a task.
 *
 * @param {number} taskId the id of the task to remove.
 * @return {RemoveTaskAction} the remove task action.
 */
export const removeTask = (taskId: number): RemoveTaskAction => ({
  type: 'REMOVE_TASK', taskId,
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
 * Undo the previous add task operation.
 *
 * @return {UndoDeleteTaskAction} the undo add task action.
 */
export const undoAddTask = (): UndoAddTaskAction => ({ type: 'UNDO_ADD_TASK' });
/**
 * Undo the previous add task operation.
 *
 * @return {UndoDeleteTaskAction} the undo add task action.
 */
export const clearUndoAddTask = (): ClearUndoAddTaskAction => ({ type: 'CLEAR_UNDO_ADD_TASK' });
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
 * Let the backend patch a new task.
 *
 * @param {number} tempId the temp randomly assigned new tag id.
 * @param {number} serverId the tag id from server.
 * @return {BackendPatchExistingTaskAction} the backend patch task action.
 */
export const backendPatchNewTag = (
  tempId: number, serverId: number,
): BackendPatchNewTagAction => ({ type: 'BACKEND_PATCH_NEW_TAG', tempId, serverId });

/**
 * Let the backend patch a new task.
 *
 * @param {number} tempId the temp randomly assigned new tag id.
 * @param {number} serverId the task id from server.
 * @return {BackendPatchExistingTaskAction} the backend patch task action.
 */
export const backendPatchNewTask = (
  tempId: number, serverId: number,
): BackendPatchNewTaskAction => ({ type: 'BACKEND_PATCH_NEW_TASK', tempId, serverId });

/**
 * Let the backend patch a new subtask.
 *
 * @param {number} taskId the main task id.
 * @param {number} tempSubTaskId the temp randomly assigned new subtask id.
 * @param {number} serverSubTaskId the subtask id from server.
 * @return {BackendPatchExistingTaskAction} the backend patch subtask action.
 */
export const backendPatchNewSubTask = (
  taskId: number, tempSubTaskId: number, serverSubTaskId: number,
): BackendPatchNewSubTaskAction => ({
  type: 'BACKEND_PATCH_NEW_SUBTASK', taskId, tempSubTaskId, serverSubTaskId,
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

/**
 * Let the backend patch loaded data.
 *
 * @param {Tag[]} tags tags from the backend.
 * @param {Task[]} tasks tasks from the backend.
 * @return {BackendPatchLoadedDataAction}
 */
export const backendPatchLoadedData = (
  tags: Tag[], tasks: Task[],
): BackendPatchLoadedDataAction => ({
  type: 'BACKEND_PATCH_LOADED_DATA', tags, tasks,
});
