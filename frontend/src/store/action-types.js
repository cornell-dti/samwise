// @flow strict

import type {
  PartialMainTask, PartialSubTask, SubTask, Tag, Task, Course,
} from './store-types';
import type { TaskDiff } from '../util/task-util';

/*
 * --------------------------------------------------------------------------------
 * Part 1: Task Actions
 * --------------------------------------------------------------------------------
 */

export type AddNewTaskAction = {| type: 'ADD_NEW_TASK'; +task: Task; |};
export type AddNewSubTaskAction = {|
  type: 'ADD_NEW_SUBTASK'; +taskId: number; +subTask: SubTask;
|};

export type EditTaskAction = {| type: 'EDIT_TASK'; +task: Task; +diff: TaskDiff; |};
export type EditMainTaskAction = {|
  type: 'EDIT_MAIN_TASK'; +taskId: number; +partialMainTask: PartialMainTask;
|};
export type EditSubTaskAction = {|
  type: 'EDIT_SUB_TASK'; +taskId: number; +subtaskId: number; +partialSubTask: PartialSubTask;
|};

export type RemoveTaskAction = {| type: 'REMOVE_TASK'; +taskId: number; |};
export type RemoveSubTaskAction = {|
  type: 'REMOVE_SUBTASK'; +taskId: number; +subtaskId: number;
|};

export type ImportCourseExamsAction = {| type: 'IMPORT_COURSE_EXAMS' |};

type TaskAction =
  | AddNewTaskAction
  | AddNewSubTaskAction
  | EditTaskAction
  | EditMainTaskAction
  | EditSubTaskAction
  | RemoveTaskAction
  | RemoveSubTaskAction
  | ImportCourseExamsAction;

/*
 * --------------------------------------------------------------------------------
 * Part 2: Color Config Actions
 * --------------------------------------------------------------------------------
 */

export type AddTagAction = {| type: 'ADD_TAG'; +tag: Tag; |};
export type EditTagAction = {| type: 'EDIT_TAG'; +tag: Tag; |};
export type RemoveTagAction = {| type: 'REMOVE_TAG'; +tagId: number; |};

export type TagAction = AddTagAction | EditTagAction | RemoveTagAction;

/*
 * --------------------------------------------------------------------------------
 * Part 3: Undo Actions
 * --------------------------------------------------------------------------------
 */

export type UndoAddTaskAction = {| type: 'UNDO_ADD_TASK' |};
export type ClearUndoAddTaskAction = {| type: 'CLEAR_UNDO_ADD_TASK' |};
export type UndoDeleteTaskAction = {| type: 'UNDO_DELETE_TASK' |};
export type ClearUndoDeleteTaskAction = {| type: 'CLEAR_UNDO_DELETE_TASK' |};

export type UndoAction =
  | UndoAddTaskAction
  | ClearUndoAddTaskAction
  | UndoDeleteTaskAction
  | ClearUndoDeleteTaskAction;

/*
 * --------------------------------------------------------------------------------
 * Part 4: Backend Patch Actions
 * --------------------------------------------------------------------------------
 */

export type BackendPatchNewTagAction = {|
  type: 'BACKEND_PATCH_NEW_TAG'; +tempId: number; +backendId: number;
|};
export type BackendPatchNewTaskAction = {|
  type: 'BACKEND_PATCH_NEW_TASK'; +tempId: number; +backendTask: Task;
|};
export type BackendPatchBatchNewTasksAction = {|
  type: 'BACKEND_PATCH_BATCH_NEW_TASKS'; +tempIds: number[]; +backendTasks: Task[];
|};
export type BackendPatchNewSubTaskAction = {|
  type: 'BACKEND_PATCH_NEW_SUBTASK';
  +taskId: number;
  +tempSubTaskId: number;
  +backendSubTaskId: number;
|};
export type BackendPatchExistingTaskAction = {|
  type: 'BACKEND_PATCH_EXISTING_TASK'; +task: Task;
|};
export type BackendPatchLoadedDataAction = {|
  type: 'BACKEND_PATCH_LOADED_DATA'; +tags: Tag[]; +tasks: Task[]; +courses: Map<number, Course[]>;
|};

/**
 * All the tasks that lets the backend patch the store with all the latest values.
 */
export type BackendPatchAction =
  | BackendPatchNewTagAction
  | BackendPatchNewTaskAction
  | BackendPatchBatchNewTasksAction
  | BackendPatchNewSubTaskAction
  | BackendPatchExistingTaskAction
  | BackendPatchLoadedDataAction

/*
 * --------------------------------------------------------------------------------
 * Part 5: All Actions
 * --------------------------------------------------------------------------------
 */

export type Action = TagAction | TaskAction | UndoAction | BackendPatchAction;
