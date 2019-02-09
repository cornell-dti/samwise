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
export type AddNewSubTaskAction = {| type: 'ADD_NEW_SUBTASK'; +taskId: number; +subTask: SubTask; |};

export type EditTaskAction = {|
  type: 'EDIT_TASK';
  +task: Task; // the old tasks' info, used as a reference.
  +diff: TaskDiff; // a diff object that describes all the changes.
|};
export type EditMainTaskAction = {|
  type: 'EDIT_MAIN_TASK';
  +taskId: number; // the id used to locate the task to be edited.
  +partialMainTask: PartialMainTask; // the changed fields' info.
|};
export type EditSubTaskAction = {|
  type: 'EDIT_SUB_TASK';
  +taskId: number; // the id used to locate the parent of the subtask to be edited.
  +subtaskId: number; // the id used to locate the subtask to be edited.
  +partialSubTask: PartialSubTask; // the changed fields' info.
|};

export type RemoveTaskAction = {|
  type: 'REMOVE_TASK';
  +taskId: number; // the id used to locate the task to be removed.
|};
export type RemoveSubTaskAction = {|
  type: 'REMOVE_SUBTASK';
  +taskId: number; // the id used to locate the parent of the subtask to be removed.
  +subtaskId: number; // the id used to locate the subtask to be removed.
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

/**
 * Used to patch a new tag's temp id.
 */
export type BackendPatchNewTagAction = {|
  type: 'BACKEND_PATCH_NEW_TAG';
  +tempId: number; // the temp id to be replaced
  +backendId: number; // the real id.
|};
/**
 * Used to patch a new task's info.
 */
export type BackendPatchNewTaskAction = {|
  type: 'BACKEND_PATCH_NEW_TASK';
  +tempId: number; // the temp id to be replaced
  +backendTask: Task; // the tasks from the backend with up-to-date info.
|};
/**
 * Used to batch patch a list of new tasks with info from the backend.
 */
export type BackendPatchBatchNewTasksAction = {|
  type: 'BACKEND_PATCH_BATCH_NEW_TASKS';
  +tempIds: number[]; // temp ids of the newly created tasks.
  +backendTasks: Task[]; // the tasks with up-to-date info.
|};
/**
 * Used to patch a subtask's temp id.
 */
export type BackendPatchNewSubTaskAction = {|
  type: 'BACKEND_PATCH_NEW_SUBTASK';
  +taskId: number; // the task id used to located the subtask.
  +tempSubTaskId: number; // the temp id to be replaced
  +backendSubTaskId: number; // the real id
|};
/**
 * Used to patch an existing task's info.
 */
export type BackendPatchExistingTaskAction = {|
  type: 'BACKEND_PATCH_EXISTING_TASK';
  +task: Task; // The updated task
|};
/**
 * Used to patch all the loaded data to the redux store to remove the initial dummy state.
 */
export type BackendPatchLoadedDataAction = {|
  type: 'BACKEND_PATCH_LOADED_DATA';
  +tags: Tag[]; // all the tags from backend
  +tasks: Task[]; // all the tasks from backend
  +courses: Map<number, Course[]>; // all the courses from backend
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
