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
  ImportCourseExamsAction,
  UndoAddTaskAction,
  ClearUndoAddTaskAction,
  UndoDeleteTaskAction,
  ClearUndoDeleteTaskAction,
  BackendPatchNewTaskAction,
  BackendPatchBatchNewTasksAction,
  BackendPatchNewSubTaskAction,
  BackendPatchExistingTaskAction,
  BackendPatchLoadedDataAction,
  BackendPatchNewTagAction,
} from './action-types';
import type {
  Course, PartialMainTask, PartialSubTask, SubTask, Tag, Task,
} from './store-types';
import type { TaskDiff } from '../util/task-util';

export const addTag = (tag: Tag): AddTagAction => ({ type: 'ADD_TAG', tag });
export const editTag = (tag: Tag): EditTagAction => ({ type: 'EDIT_TAG', tag });
export const removeTag = (tagId: number): RemoveTagAction => ({ type: 'REMOVE_TAG', tagId });

export const addTask = (task: Task): AddNewTaskAction => ({ type: 'ADD_NEW_TASK', task });
export const addSubTask = (taskId: number, subTask: SubTask): AddNewSubTaskAction => ({
  type: 'ADD_NEW_SUBTASK', taskId, subTask,
});

/**
 * @see EditTaskAction
 * @see TaskDiff
 */
export const editTask = (task: Task, diff: TaskDiff): EditTaskAction => ({
  type: 'EDIT_TASK', task, diff,
});

export const editMainTask = (
  taskId: number, partialMainTask: PartialMainTask,
): EditMainTaskAction => ({ type: 'EDIT_MAIN_TASK', taskId, partialMainTask });

export const editSubTask = (
  taskId: number, subtaskId: number, partialSubTask: PartialSubTask,
): EditSubTaskAction => ({
  type: 'EDIT_SUB_TASK', taskId, subtaskId, partialSubTask,
});

export const removeTask = (taskId: number): RemoveTaskAction => ({ type: 'REMOVE_TASK', taskId });
export const removeSubTask = (taskId: number, subtaskId: number): RemoveSubTaskAction => ({
  type: 'REMOVE_SUBTASK', taskId, subtaskId,
});

export const importCourseExams = (): ImportCourseExamsAction => ({ type: 'IMPORT_COURSE_EXAMS' });

export const undoAddTask = (): UndoAddTaskAction => ({ type: 'UNDO_ADD_TASK' });
export const clearUndoAddTask = (): ClearUndoAddTaskAction => ({ type: 'CLEAR_UNDO_ADD_TASK' });
export const undoDeleteTask = (): UndoDeleteTaskAction => ({ type: 'UNDO_DELETE_TASK' });
export const clearUndoDeleteTask = (): ClearUndoDeleteTaskAction => ({
  type: 'CLEAR_UNDO_DELETE_TASK',
});

/**
 * @see BackendPatchNewTagAction
 */
export const backendPatchNewTag = (
  tempId: number, backendId: number,
): BackendPatchNewTagAction => ({ type: 'BACKEND_PATCH_NEW_TAG', tempId, backendId });

/**
 * @see BackendPatchNewTaskAction
 */
export const backendPatchNewTask = (
  tempId: number, backendTask: Task,
): BackendPatchNewTaskAction => ({ type: 'BACKEND_PATCH_NEW_TASK', tempId, backendTask });

/**
 * @see BackendPatchBatchNewTasksAction
 */
export const backendPatchBatchNewTasks = (
  tempIds: number[], backendTasks: Task[],
): BackendPatchBatchNewTasksAction => ({
  type: 'BACKEND_PATCH_BATCH_NEW_TASKS', tempIds, backendTasks,
});

/**
 * @see BackendPatchNewSubTaskAction
 */
export const backendPatchNewSubTask = (
  taskId: number, tempSubTaskId: number, backendSubTaskId: number,
): BackendPatchNewSubTaskAction => ({
  type: 'BACKEND_PATCH_NEW_SUBTASK', taskId, tempSubTaskId, backendSubTaskId,
});

/**
 * @see BackendPatchExistingTaskAction
 */
export const backendPatchExistingTask = (task: Task): BackendPatchExistingTaskAction => ({
  type: 'BACKEND_PATCH_EXISTING_TASK', task,
});

/**
 * @see BackendPatchLoadedDataAction
 */
export const backendPatchLoadedData = (
  tags: Tag[], tasks: Task[], courses: Map<number, Course[]>,
): BackendPatchLoadedDataAction => ({
  type: 'BACKEND_PATCH_LOADED_DATA', tags, tasks, courses,
});
